import { describe, expect, it } from 'vitest';
import { donationCreateSchema } from '../shared/schemas';
import { verifyStripeSignature } from '../functions/_shared/stripe';

describe('donationCreateSchema', () => {
  it('accepts a minimal valid payload', () => {
    const parsed = donationCreateSchema.parse({ amountCents: 2500 });
    expect(parsed.amountCents).toBe(2500);
  });

  it('rejects amounts below $1 (Stripe minimum)', () => {
    expect(() => donationCreateSchema.parse({ amountCents: 50 })).toThrow();
  });

  it('rejects amounts above $10,000', () => {
    expect(() => donationCreateSchema.parse({ amountCents: 1_100_000 })).toThrow();
  });

  it('coerces stringified amounts to integers', () => {
    const parsed = donationCreateSchema.parse({ amountCents: '5000' });
    expect(parsed.amountCents).toBe(5000);
  });

  it('treats empty optional fields as empty strings', () => {
    const parsed = donationCreateSchema.parse({
      amountCents: 2500,
      donorName: '',
      donorEmail: '',
      message: '',
    });
    expect(parsed.donorName).toBe('');
    expect(parsed.donorEmail).toBe('');
  });

  it('rejects malformed donor emails when provided', () => {
    expect(() =>
      donationCreateSchema.parse({ amountCents: 2500, donorEmail: 'not-an-email' }),
    ).toThrow();
  });
});

describe('verifyStripeSignature', () => {
  const secret = 'whsec_test_secret_123';

  async function sign(payload: string, timestamp: number, signingSecret: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(signingSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${timestamp}.${payload}`));
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  it('returns true for a valid recent signature', async () => {
    const payload = '{"id":"evt_1","type":"checkout.session.completed"}';
    const ts = Math.floor(Date.now() / 1000);
    const v1 = await sign(payload, ts, secret);
    const header = `t=${ts},v1=${v1}`;
    expect(await verifyStripeSignature(payload, header, secret)).toBe(true);
  });

  it('returns false for a mismatched signature', async () => {
    const payload = '{"id":"evt_1"}';
    const ts = Math.floor(Date.now() / 1000);
    const header = `t=${ts},v1=0000000000000000000000000000000000000000000000000000000000000000`;
    expect(await verifyStripeSignature(payload, header, secret)).toBe(false);
  });

  it('returns false when the timestamp is too old', async () => {
    const payload = '{"id":"evt_1"}';
    const ts = Math.floor(Date.now() / 1000) - 60 * 60; // 1 hour ago
    const v1 = await sign(payload, ts, secret);
    const header = `t=${ts},v1=${v1}`;
    expect(await verifyStripeSignature(payload, header, secret)).toBe(false);
  });

  it('returns false when the header is missing', async () => {
    expect(await verifyStripeSignature('{}', null, secret)).toBe(false);
  });
});
