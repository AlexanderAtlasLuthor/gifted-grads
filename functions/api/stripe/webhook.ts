// POST /api/stripe/webhook — public, protected by Stripe signature.
//
// Stripe POSTs every configured event here. We care about:
//   - checkout.session.completed: flips a donation to "succeeded"
//   - charge.refunded: flips it to "refunded"
// Anything else is acknowledged with 200 and ignored.

import { json } from '../../_shared/responses';
import { verifyStripeSignature } from '../../_shared/stripe';

type Env = {
  DB: D1Database;
  STRIPE_WEBHOOK_SECRET: string;
};

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  if (!ctx.env.STRIPE_WEBHOOK_SECRET) {
    console.error('stripe webhook: STRIPE_WEBHOOK_SECRET not configured');
    return new Response('webhook secret not configured', { status: 503 });
  }

  const payload = await ctx.request.text();
  const signature = ctx.request.headers.get('Stripe-Signature');

  const ok = await verifyStripeSignature(
    payload,
    signature,
    ctx.env.STRIPE_WEBHOOK_SECRET,
  );
  if (!ok) {
    console.warn('stripe webhook: signature verification failed');
    return new Response('invalid signature', { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch (err) {
    console.error('stripe webhook: bad json', err);
    return new Response('bad json', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as {
        id: string;
        payment_intent?: string | null;
        amount_total?: number;
        client_reference_id?: string | null;
        payment_status?: string;
        customer_details?: { email?: string | null; name?: string | null };
        metadata?: Record<string, string> | null;
      };
      if (session.payment_status !== 'paid') {
        // Subscription / setup mode etc. — ignore for now.
        return json(200, { ok: true, ignored: 'not_paid' });
      }
      const donorEmail =
        session.customer_details?.email ??
        session.metadata?.donor_email ??
        null;
      const donorName =
        session.customer_details?.name ??
        session.metadata?.donor_name ??
        null;

      await ctx.env.DB.prepare(
        `UPDATE donations
         SET status = 'succeeded',
             stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id),
             donor_email = COALESCE(donor_email, ?),
             donor_name  = COALESCE(donor_name, ?),
             succeeded_at = datetime('now')
         WHERE stripe_session_id = ?`,
      )
        .bind(
          session.payment_intent ?? null,
          donorEmail,
          donorName,
          session.id,
        )
        .run();
      return json(200, { ok: true });
    }
    case 'charge.refunded': {
      const charge = event.data.object as {
        payment_intent?: string | null;
      };
      if (!charge.payment_intent) return json(200, { ok: true, ignored: 'no_pi' });
      await ctx.env.DB.prepare(
        `UPDATE donations SET status = 'refunded'
         WHERE stripe_payment_intent_id = ?`,
      )
        .bind(charge.payment_intent)
        .run();
      return json(200, { ok: true });
    }
    default:
      return json(200, { ok: true, ignored: event.type });
  }
};
