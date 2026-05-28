import type { Donation, DonationStatus } from '@shared/types';
import { sqliteToIso } from './db';

export interface DonationRow {
  id: string;
  amount_cents: number;
  currency: string;
  donor_name: string | null;
  donor_email: string | null;
  message: string | null;
  status: DonationStatus;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
  succeeded_at: string | null;
}

export function rowToDonation(row: DonationRow): Donation {
  return {
    id: row.id,
    amountCents: row.amount_cents,
    currency: row.currency,
    donorName: row.donor_name ?? undefined,
    donorEmail: row.donor_email ?? undefined,
    message: row.message ?? undefined,
    status: row.status,
    createdAt: sqliteToIso(row.created_at),
    succeededAt: row.succeeded_at ? sqliteToIso(row.succeeded_at) : undefined,
  };
}
