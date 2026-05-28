// Direct calls to the Stripe REST API. The official Node SDK pulls in
// `crypto.createHmac` and other Node-only modules, so on Cloudflare
// Workers we go through fetch instead. Signature verification for
// webhooks uses Web Crypto.

const STRIPE_API = 'https://api.stripe.com/v1';

interface StripeCheckoutSessionArgs {
  secretKey: string;
  amountCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  donationId: string;
  donorEmail?: string;
  donorName?: string;
  message?: string;
  productName: string;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_intent?: string;
}

/**
 * Creates a Stripe Checkout Session for a one-time donation. Returns the
 * hosted-checkout URL the client should redirect to.
 */
export async function createCheckoutSession(
  args: StripeCheckoutSessionArgs,
): Promise<StripeCheckoutSession> {
  // Stripe wants application/x-www-form-urlencoded for v1 API.
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', args.successUrl);
  params.set('cancel_url', args.cancelUrl);
  params.set('line_items[0][price_data][currency]', args.currency);
  params.set('line_items[0][price_data][product_data][name]', args.productName);
  params.set('line_items[0][price_data][unit_amount]', String(args.amountCents));
  params.set('line_items[0][quantity]', '1');
  params.set('client_reference_id', args.donationId);
  params.set('metadata[donation_id]', args.donationId);
  if (args.donorEmail) {
    params.set('customer_email', args.donorEmail);
    params.set('metadata[donor_email]', args.donorEmail);
  }
  if (args.donorName) params.set('metadata[donor_name]', args.donorName);
  if (args.message) params.set('metadata[message]', args.message.slice(0, 500));
  params.set('payment_intent_data[description]',
    `Donation — Born Gifted${args.donorName ? ` from ${args.donorName}` : ''}`);
  // Show a thank-you on the Stripe-hosted side too in case the redirect
  // never happens (mobile network blip, etc).
  params.set('submit_type', 'donate');

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new StripeApiError(res.status, text);
  }
  return (await res.json()) as StripeCheckoutSession;
}

/**
 * Retrieves a Checkout Session — used by the thank-you page to confirm
 * the donation actually went through without trusting the URL alone.
 */
export async function retrieveCheckoutSession(
  secretKey: string,
  sessionId: string,
): Promise<{
  id: string;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  amount_total: number;
  currency: string;
  customer_details?: { name?: string | null; email?: string | null };
  metadata?: Record<string, string>;
  payment_intent?: string;
}> {
  const res = await fetch(
    `${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new StripeApiError(res.status, text);
  }
  return res.json();
}

export class StripeApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`Stripe API ${status}: ${body.slice(0, 200)}`);
    this.status = status;
    this.body = body;
  }
}

/**
 * Verifies a Stripe webhook signature using HMAC-SHA256, the same
 * algorithm the official SDK uses. Returns true if every signature in
 * the header matches and the timestamp is within the tolerance window.
 *
 * The Stripe header looks like:
 *   t=1672531200,v1=abc123,v1=def456
 */
export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  signingSecret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const idx = p.indexOf('=');
      return idx === -1 ? [p, ''] : [p.slice(0, idx).trim(), p.slice(idx + 1).trim()];
    }),
  ) as Record<string, string>;
  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;

  const signedPayload = `${parts.t}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signedPayload));
  const expected = toHex(new Uint8Array(sig));

  // The header may carry multiple v1 signatures (during rotation). Match
  // against every one in constant time.
  const candidates = header
    .split(',')
    .filter((p) => p.trim().startsWith('v1='))
    .map((p) => p.split('=')[1]?.trim() ?? '');
  return candidates.some((c) => timingSafeEqualHex(c, expected));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
