-- Track donations linked to Stripe Checkout sessions.
-- A row is created on POST /api/donations/create-checkout-session with
-- status='pending'. The Stripe webhook flips it to 'succeeded' when the
-- session completes, or 'refunded' if the donor is refunded later.

CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  donor_name TEXT,
  donor_email TEXT,
  message TEXT,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','succeeded','refunded','failed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  succeeded_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_succeeded_at ON donations(succeeded_at);
