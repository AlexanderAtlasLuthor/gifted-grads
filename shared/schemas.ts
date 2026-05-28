import { z } from 'zod';

export const insuranceTypeSchema = z.enum(['AUTO', 'HOME', 'COMMERCIAL', 'RENTERS']);

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, 'name_too_short').max(120, 'name_too_long'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, 'email_invalid')
    .max(160, 'email_too_long')
    .email('email_invalid'),
  telefono: z
    .string()
    .trim()
    .max(20, 'phone_too_long')
    .regex(/^[0-9+\-\s().]*$/, 'phone_invalid_chars')
    .refine(
      (v) => v.replace(/\D/g, '').length >= 10,
      'phone_min_10_digits',
    ),
  insuranceType: insuranceTypeSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const raffleDrawSchema = z.union([
  z.object({ mode: z.literal('random') }),
  z.object({
    mode: z.literal('manual'),
    participantNumber: z.coerce.number().int().positive(),
  }),
]);

// Donations — amount is in cents. Min $1, max $10,000 to keep abusive
// inputs out and to satisfy Stripe's min charge of $0.50.
export const donationCreateSchema = z.object({
  amountCents: z.coerce
    .number()
    .int()
    .min(100, 'donation_min_1_dollar')
    .max(1_000_000, 'donation_max_10000'),
  donorName: z.string().trim().min(2).max(120).optional().or(z.literal('')),
  donorEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('email_invalid')
    .max(160)
    .optional()
    .or(z.literal('')),
  message: z.string().trim().max(500).optional().or(z.literal('')),
});

export type DonationCreateInput = z.infer<typeof donationCreateSchema>;
