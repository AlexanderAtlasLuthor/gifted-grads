// GET /api/donations/summary — auth (manager).
//
// Aggregates everything the dashboard widget needs in one round trip:
// total raised, the configured goal, donation count, and the last 5
// succeeded donations for the activity feed.

import { json } from '../../_shared/responses';
import { rowToDonation, type DonationRow } from '../../_shared/donations';
import type { DonationSummary } from '../../../shared/types';

type Env = {
  DB: D1Database;
  DONATION_GOAL_CENTS?: string;
  DONATION_CURRENCY?: string;
};

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const currency = ctx.env.DONATION_CURRENCY?.toLowerCase() || 'usd';
  const goalCents = Number(ctx.env.DONATION_GOAL_CENTS ?? '500000');

  const totals = await ctx.env.DB.prepare(
    `SELECT COALESCE(SUM(amount_cents), 0) AS total_cents,
            COUNT(*) AS count
     FROM donations WHERE status = 'succeeded'`,
  ).first<{ total_cents: number; count: number }>();

  const recentRs = await ctx.env.DB.prepare(
    `SELECT id, amount_cents, currency, donor_name, donor_email, message,
            status, stripe_session_id, stripe_payment_intent_id,
            created_at, succeeded_at
     FROM donations
     WHERE status = 'succeeded'
     ORDER BY COALESCE(succeeded_at, created_at) DESC
     LIMIT 5`,
  ).all<DonationRow>();

  const response: DonationSummary = {
    totalCents: totals?.total_cents ?? 0,
    goalCents: Number.isFinite(goalCents) ? goalCents : 500_000,
    count: totals?.count ?? 0,
    currency,
    recent: (recentRs.results ?? []).map(rowToDonation),
    updatedAt: new Date().toISOString(),
  };
  return json(200, response);
};
