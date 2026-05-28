# Donations — Re-enable Guide

Stripe-powered donations are **built and tested** but currently hidden
from the UI (commit `99717fb`). All backend infrastructure stays in
place. This doc walks through what's already done, what's hidden, and
how to bring it back online.

## State today

| Layer | Status |
|---|---|
| D1 table `donations` | ✅ Created in production (migration `0005_donations.sql` already applied) |
| Worker endpoints | ✅ Code is in `functions/api/donations/*` and `functions/api/stripe/webhook.ts` — not called from anywhere, dormant |
| Stripe helpers + signature verification | ✅ `functions/_shared/stripe.ts`, `functions/_shared/donations.ts` |
| Shared types + zod schema | ✅ `shared/types.ts` + `shared/schemas.ts` |
| React components | ✅ `DonationsSection.tsx`, `DonationProgress.tsx`, `DonationThankYouPage.tsx` — orphan files, not mounted |
| API client + mockApi paths | ✅ `src/lib/api.ts`, `src/lib/mockApi.ts` |
| i18n strings | ✅ All `donate.*` keys in `src/i18n/en.json` and `es.json` |
| Tests | ✅ `tests/donations.test.ts` — 10 tests still passing |
| Stripe secrets in Cloudflare | Optional — set them now or later |

## What's hidden

Just four mount points were removed in commit `99717fb`:

| File | What was removed |
|---|---|
| `src/App.tsx` | `<Route path="/donations/thank-you" />` + the `DonationThankYouPage` import |
| `src/routes/RegisterPage.tsx` | `<DonationsSection />` block below the form + the import |
| `src/routes/ConfirmationPage.tsx` | `<DonationsSection compact />` block below the entry pass + the import |
| `src/routes/ManagerDashboardPage.tsx` | `<DonationProgress />` section between Metrics and Raffle + the import |

## Re-enable — Option A: revert the hide commit (fastest)

```bash
git revert 99717fb
git push origin main
```

That single revert restores everything. Cloudflare Pages redeploys in
~30s and donations are live everywhere.

## Re-enable — Option B: manual (if you need to review)

Open each file and add back the imports + JSX. The diff for
`99717fb` shows exactly what was removed — pasting it back works.

```bash
git show 99717fb -- src/App.tsx src/routes/RegisterPage.tsx \
  src/routes/ConfirmationPage.tsx src/routes/ManagerDashboardPage.tsx
```

## Stripe configuration checklist

These steps run in the Stripe dashboard + Cloudflare CLI. None of
them are needed for the hidden state; do them before flipping
donations back on.

### 1. Apply the migration (already done in prod)

```bash
# Already applied to the production DB. If you reset D1 or migrate
# a new database, this is the command:
npx wrangler d1 migrations apply DB --remote
```

### 2. Configure secrets in Cloudflare Pages

```bash
npx wrangler pages secret put STRIPE_SECRET_KEY      # sk_live_... or sk_test_...
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET  # whsec_...
```

### 3. Create the webhook endpoint in Stripe

`dashboard.stripe.com/webhooks` → **+ Add endpoint**:

- **URL**: `https://gifted-grads-events.pages.dev/api/stripe/webhook`
- **Events**:
  - `checkout.session.completed`
  - `charge.refunded`
- After creating, click **Reveal signing secret** and paste it as the
  `STRIPE_WEBHOOK_SECRET` value in step 2.

### 4. Stripe Checkout branding (so the hosted page keeps the app's look)

`dashboard.stripe.com/settings/branding`:

- **Logo**: upload `public/logo.png` from this repo
- **Icon**: `public/apple-touch-icon.png`
- **Brand color**: `#f5c518` (accent yellow)
- **Accent color**: `#070d1c` (ink-950 navy)
- **Business name** (under Settings → Business details): `Born Gifted · Gifted Grads`

### 5. Tune the goal (optional)

`wrangler.toml` plain vars, change without redeploy via Cloudflare
Pages → Settings → Environment variables:

```toml
DONATION_CURRENCY = "usd"
DONATION_GOAL_CENTS = "500000"    # 500000 = $5,000
PUBLIC_BASE_URL = ""               # optional override for Stripe redirect URLs
```

### 6. Smoke test (recommended before going live)

With `sk_test_...` set:

1. Visit `https://your-domain/#donate`.
2. Click `$25` → `Donate now` → redirected to Stripe Checkout (should
   show the Born Gifted logo + accent yellow).
3. Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC.
4. Stripe redirects to `/donations/thank-you?session_id=cs_...`.
5. The page polls `/api/donations/by-session/{id}` until the webhook
   flips the row to `succeeded`, then shows the amount.
6. Log in to `/manager` → the **Donations** section shows the new $25
   donation in the recent activity feed and the goal progress moves.
7. In Stripe Dashboard → Webhooks → your endpoint → Events, confirm the
   `checkout.session.completed` event was delivered with 200.

### 7. Going live

Swap the test key for the live key and redeploy:

```bash
npx wrangler pages secret put STRIPE_SECRET_KEY
# Paste sk_live_xxx this time

# If Stripe gave you a separate webhook endpoint for Live mode, grab
# that endpoint's signing secret and update STRIPE_WEBHOOK_SECRET too.
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET

git commit --allow-empty -m "Promote Stripe to live mode"
git push origin main
```

## What lives where (file reference)

```
functions/_shared/
  stripe.ts            ─ REST client + HMAC-SHA256 signature verify
  donations.ts         ─ DonationRow → Donation mapper

functions/api/donations/
  create-checkout-session.ts ─ POST: creates Stripe session, inserts pending row
  by-session/[id].ts         ─ GET: public, used by thank-you page polling
  summary.ts                 ─ GET: auth, used by manager widget

functions/api/stripe/
  webhook.ts           ─ POST: verifies signature, handles checkout.session.completed + charge.refunded

migrations/
  0005_donations.sql   ─ donations table

shared/
  types.ts             ─ Donation, DonationStatus, DonationCreateRequest, DonationSummary, ...
  schemas.ts           ─ donationCreateSchema (zod)

src/components/
  DonationsSection.tsx ─ The donate card (presets + custom + name/email)
  DonationProgress.tsx ─ Manager widget (goal bar + recent activity)

src/routes/
  DonationThankYouPage.tsx ─ /donations/thank-you

src/lib/
  api.ts               ─ createDonation, getDonationBySession, donationSummary
  mockApi.ts           ─ Mock paths so VITE_USE_MOCK_API works end-to-end
  format.ts            ─ formatCurrency

src/i18n/
  {en,es}.json         ─ donate.* keys

tests/
  donations.test.ts    ─ schema + signature verification
```

## Cost reminder

Stripe fees: **2.9% + $0.30 per transaction**. On $1,000 raised
≈ $32 in fees, net $968.

If A&A / Gifted Grads is a registered 501(c)(3) and you want the
**Stripe Charity pricing** (2.2% + $0.30 — saves ~0.7%), email
Stripe Support after activation with proof of nonprofit status. The
pricing change is account-wide, no code changes needed.
