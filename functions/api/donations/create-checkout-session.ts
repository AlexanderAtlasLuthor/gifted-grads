// POST /api/donations/create-checkout-session — public.
//
// Validates the donation request, inserts a pending donations row, then
// asks Stripe for a hosted Checkout Session URL. The client redirects
// the donor there. The Stripe webhook (api/stripe/webhook.ts) is what
// actually flips the row to "succeeded" once payment goes through.

import { donationCreateSchema } from '../../../shared/schemas';
import { error, json } from '../../_shared/responses';
import {
  createCheckoutSession,
  StripeApiError,
} from '../../_shared/stripe';

type Env = {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  DONATION_CURRENCY?: string;
  PUBLIC_BASE_URL?: string;
};

function emptyToUndefined(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  if (!ctx.env.STRIPE_SECRET_KEY) {
    return error(503, 'SERVER_ERROR', 'Donations are not configured');
  }

  const raw = await ctx.request.json().catch(() => null);
  const parsed = donationCreateSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (path) fields[path] = issue.message;
    }
    return error(400, 'VALIDATION_ERROR', 'Validation failed', fields);
  }
  const data = parsed.data;

  const currency = ctx.env.DONATION_CURRENCY?.toLowerCase() || 'usd';
  const donationId = crypto.randomUUID();

  // Build absolute URLs Stripe can redirect back to. Prefer the
  // PUBLIC_BASE_URL var (production) and fall back to the request origin
  // (good for previews and local dev).
  const origin =
    ctx.env.PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
    new URL(ctx.request.url).origin;
  const successUrl = `${origin}/donations/thank-you?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/#donate`;

  let session;
  try {
    session = await createCheckoutSession({
      secretKey: ctx.env.STRIPE_SECRET_KEY,
      amountCents: data.amountCents,
      currency,
      successUrl,
      cancelUrl,
      donationId,
      donorEmail: emptyToUndefined(data.donorEmail),
      donorName: emptyToUndefined(data.donorName),
      message: emptyToUndefined(data.message),
      productName: 'Born Gifted — Donation',
    });
  } catch (err) {
    console.error('stripe checkout session failed', err);
    if (err instanceof StripeApiError) {
      return error(502, 'STRIPE_ERROR', 'Could not create Stripe session');
    }
    return error(500, 'SERVER_ERROR', 'Unexpected failure');
  }

  await ctx.env.DB.prepare(
    `INSERT INTO donations
       (id, amount_cents, currency, donor_name, donor_email, message,
        stripe_session_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
  )
    .bind(
      donationId,
      data.amountCents,
      currency,
      emptyToUndefined(data.donorName) ?? null,
      emptyToUndefined(data.donorEmail) ?? null,
      emptyToUndefined(data.message) ?? null,
      session.id,
    )
    .run();

  return json(200, {
    checkoutUrl: session.url,
    sessionId: session.id,
  });
};
