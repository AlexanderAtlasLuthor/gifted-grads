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
