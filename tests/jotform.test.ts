import { describe, expect, it } from 'vitest';
import {
  isAllowedFormId,
  JotformParseError,
  parseJotformPayload,
} from '../functions/_shared/jotform';

function makePayload(opts: {
  submissionID?: string;
  formID?: string;
  raw?: Record<string, unknown> | string | null;
}): FormData {
  const fd = new FormData();
  if (opts.submissionID !== undefined) fd.set('submissionID', opts.submissionID);
  if (opts.formID !== undefined) fd.set('formID', opts.formID);
  if (opts.raw !== undefined && opts.raw !== null) {
    fd.set(
      'rawRequest',
      typeof opts.raw === 'string' ? opts.raw : JSON.stringify(opts.raw),
    );
  }
  return fd;
}

const validRaw = {
  q3_nombreCompleto: 'Ana López',
  q4_email: 'ANA@example.com',
  q5_telefono: '+1 555 0000',
  q6_genero: 'Femenino',
  q7_edad: '22',
  q8_institucion: 'Universidad X',
  q9_carrera: 'Ingeniería',
  q10_nivelAcademico: 'Pregrado',
};

describe('parseJotformPayload', () => {
  it('parses a well-formed submission and normalizes enums + email', () => {
    const fd = makePayload({
      submissionID: '12345',
      formID: '999',
      raw: validRaw,
    });
    const out = parseJotformPayload(fd);
    expect(out.submissionId).toBe('12345');
    expect(out.formId).toBe('999');
    expect(out.data.email).toBe('ana@example.com');
    expect(out.data.genero).toBe('F');
    expect(out.data.nivelAcademico).toBe('PREGRADO');
    expect(out.data.edad).toBe(22);
  });

  it('honors English option labels too', () => {
    const fd = makePayload({
      submissionID: '1',
      formID: '2',
      raw: { ...validRaw, q6_genero: 'Male', q10_nivelAcademico: 'Graduate' },
    });
    const out = parseJotformPayload(fd);
    expect(out.data.genero).toBe('M');
    expect(out.data.nivelAcademico).toBe('POSGRADO');
  });

  it('handles compound name fields (object with first/last)', () => {
    const fd = makePayload({
      submissionID: '1',
      formID: '2',
      raw: {
        ...validRaw,
        q3_nombreCompleto: { first: 'Ana', last: 'López' },
      },
    });
    const out = parseJotformPayload(fd);
    expect(out.data.nombre).toBe('Ana López');
  });

  it('throws MISSING_SUBMISSION_ID when submissionID is absent', () => {
    const fd = makePayload({ formID: '2', raw: validRaw });
    expect(() => parseJotformPayload(fd)).toThrowError(JotformParseError);
    try {
      parseJotformPayload(fd);
    } catch (err) {
      expect((err as JotformParseError).code).toBe('MISSING_SUBMISSION_ID');
    }
  });

  it('throws BAD_RAW_REQUEST when rawRequest is not JSON', () => {
    const fd = makePayload({
      submissionID: '1',
      formID: '2',
      raw: 'not-json{{',
    });
    try {
      parseJotformPayload(fd);
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(JotformParseError);
      expect((err as JotformParseError).code).toBe('BAD_RAW_REQUEST');
    }
  });

  it('throws VALIDATION when a required field is missing', () => {
    const { q4_email: _omit, ...withoutEmail } = validRaw;
    void _omit;
    const fd = makePayload({
      submissionID: '1',
      formID: '2',
      raw: withoutEmail,
    });
    try {
      parseJotformPayload(fd);
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(JotformParseError);
      expect((err as JotformParseError).code).toBe('VALIDATION');
    }
  });

  it('throws VALIDATION when an enum option is unrecognized', () => {
    const fd = makePayload({
      submissionID: '1',
      formID: '2',
      raw: { ...validRaw, q6_genero: 'Mystery' },
    });
    try {
      parseJotformPayload(fd);
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(JotformParseError);
      expect((err as JotformParseError).code).toBe('VALIDATION');
    }
  });

  it('accepts the field-alias fallback (q3_nombre instead of q3_nombreCompleto)', () => {
    const { q3_nombreCompleto: _drop, ...rest } = validRaw;
    void _drop;
    const fd = makePayload({
      submissionID: '1',
      formID: '2',
      raw: { ...rest, q3_nombre: 'María García' },
    });
    const out = parseJotformPayload(fd);
    expect(out.data.nombre).toBe('María García');
  });
});

describe('isAllowedFormId', () => {
  it('returns true when CSV is empty (dev convenience)', () => {
    expect(isAllowedFormId('any', '')).toBe(true);
    expect(isAllowedFormId('any', undefined)).toBe(true);
  });
  it('matches case-sensitive IDs in CSV', () => {
    expect(isAllowedFormId('abc', 'abc,def')).toBe(true);
    expect(isAllowedFormId('def', ' abc , def ')).toBe(true);
    expect(isAllowedFormId('ghi', 'abc,def')).toBe(false);
  });
});
