import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  raffleDrawSchema,
  registerSchema,
} from '../shared/schemas';

const validRegister = {
  nombre: 'Ana López',
  email: 'ANA@example.com',
  telefono: '+1 555 123 4567',
  genero: 'F',
  edad: 22,
  institucion: 'Universidad Nacional',
  carrera: 'Ingeniería de Sistemas',
  nivelAcademico: 'PREGRADO',
};

describe('registerSchema', () => {
  it('accepts a valid payload and normalizes email to lowercase', () => {
    const parsed = registerSchema.parse(validRegister);
    expect(parsed.email).toBe('ana@example.com');
    expect(parsed.edad).toBe(22);
  });

  it('coerces age strings to numbers', () => {
    const parsed = registerSchema.parse({ ...validRegister, edad: '30' });
    expect(parsed.edad).toBe(30);
  });

  it('rejects under-13 ages', () => {
    expect(() => registerSchema.parse({ ...validRegister, edad: 10 })).toThrow();
  });

  it('rejects malformed emails', () => {
    expect(() => registerSchema.parse({ ...validRegister, email: 'not-an-email' })).toThrow();
  });

  it('rejects phone numbers with letters', () => {
    expect(() =>
      registerSchema.parse({ ...validRegister, telefono: 'abc-123' }),
    ).toThrow();
  });

  it('rejects unknown gender values', () => {
    expect(() =>
      registerSchema.parse({ ...validRegister, genero: 'X' }),
    ).toThrow();
  });
});

describe('loginSchema', () => {
  it('requires a non-empty password', () => {
    expect(loginSchema.parse({ password: 'hunter2' }).password).toBe('hunter2');
    expect(() => loginSchema.parse({ password: '' })).toThrow();
  });
});

describe('raffleDrawSchema', () => {
  it('accepts random mode', () => {
    expect(raffleDrawSchema.parse({ mode: 'random' })).toEqual({ mode: 'random' });
  });
  it('accepts manual mode with a positive integer', () => {
    expect(raffleDrawSchema.parse({ mode: 'manual', participantNumber: 7 })).toEqual({
      mode: 'manual',
      participantNumber: 7,
    });
  });
  it('coerces string participantNumber to a number', () => {
    expect(raffleDrawSchema.parse({ mode: 'manual', participantNumber: '42' })).toEqual({
      mode: 'manual',
      participantNumber: 42,
    });
  });
  it('rejects manual mode with zero or negative number', () => {
    expect(() =>
      raffleDrawSchema.parse({ mode: 'manual', participantNumber: 0 }),
    ).toThrow();
  });
});
