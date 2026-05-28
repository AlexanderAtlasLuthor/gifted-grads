// GET /api/donations/by-session/[id] — public.
//
// The thank-you page calls this with the Stripe session_id from the URL
// to confirm the donation actually went through. We don't expose the
// internal donation_id or email; just enough info to render "Thanks,
// [name]! Your $X donation was received."

import { error, json } from '../../../_shared/responses';
import type { DonationLookupResponse } from '@shared/types';

type Env = { DB: D1Database };

interface Row {
  amount_cents: number;
  currency: string;
  donor_name: string | null;
  status: 'pending' | 'succeeded' | 'refunded' | 'failed';
}

export const onRequestGet: PagesFunction<Env, 'id'> = async (ctx) => {
  const id = ctx.params.id;
  if (typeof id !== 'string' || id.length === 0) {
    return error(400, 'VALIDATION_ERROR', 'Invalid session id');
  }

  const row = await ctx.env.DB.prepare(
    `SELECT amount_cents, currency, donor_name, status
     FROM donations WHERE stripe_session_id = ? LIMIT 1`,
  )
    .bind(id)
    .first<Row>();

  if (!row) {
    return error(404, 'NOT_FOUND', 'Donation not found');
  }

  const response: DonationLookupResponse = {
    amountCents: row.amount_cents,
    currency: row.currency,
    donorName: row.donor_name ?? undefined,
    status: row.status,
  };
  return json(200, response);
};
