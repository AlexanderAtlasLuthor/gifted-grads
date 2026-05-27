import { registerSchema } from '@shared/schemas';
import type { Genero, NivelAcademico, RegisterRequest } from '@shared/types';

/**
 * Maps each field in our `RegisterRequest` to the key Jotform uses inside
 * the `rawRequest` JSON payload (typically `q{N}_{label}`).
 *
 * IMPORTANT: After the user finalizes the two Jotform forms, replace each
 * value with the real Jotform key. Both the ES and EN forms must share the
 * same field keys (Jotform numbers fields by creation order — recreate
 * fields in the second form in the same order so they line up).
 *
 * The shape allows a primary key plus optional aliases (for either-or
 * compatibility while iterating on the form). The first key that resolves
 * to a non-empty value wins.
 */
export const FIELD_MAP = {
  nombre: ['q3_nombreCompleto', 'q3_nombre'],
  email: ['q4_email'],
  telefono: ['q5_telefono', 'q5_phone'],
  genero: ['q6_genero', 'q6_gender'],
  edad: ['q7_edad', 'q7_age'],
  institucion: ['q8_institucion', 'q8_institution'],
  carrera: ['q9_carrera', 'q9_major'],
  nivelAcademico: ['q10_nivelAcademico', 'q10_nivel', 'q10_academicLevel'],
} satisfies Record<keyof RegisterRequest, string[]>;

/**
 * Maps the human-readable option text that Jotform sends in the payload to
 * our schema enum. Edit these once the actual option labels are confirmed
 * in the Jotform forms.
 */
export const GENERO_MAP: Record<string, Genero> = {
  Masculino: 'M',
  Male: 'M',
  Hombre: 'M',
  Femenino: 'F',
  Female: 'F',
  Mujer: 'F',
  Otro: 'OTRO',
  Other: 'OTRO',
  'Prefiero no decir': 'PREFIERO_NO_DECIR',
  'Prefer not to say': 'PREFIERO_NO_DECIR',
};

export const NIVEL_MAP: Record<string, NivelAcademico> = {
  Secundaria: 'SECUNDARIA',
  'High school': 'SECUNDARIA',
  Pregrado: 'PREGRADO',
  Undergraduate: 'PREGRADO',
  Posgrado: 'POSGRADO',
  Graduate: 'POSGRADO',
  Otro: 'OTRO',
  Other: 'OTRO',
};

export interface ParsedJotformPayload {
  submissionId: string;
  formId: string;
  data: RegisterRequest;
}

export class JotformParseError extends Error {
  code:
    | 'MISSING_SUBMISSION_ID'
    | 'MISSING_RAW_REQUEST'
    | 'BAD_RAW_REQUEST'
    | 'MISSING_FIELD'
    | 'BAD_OPTION'
    | 'VALIDATION';
  details?: unknown;
  constructor(code: JotformParseError['code'], message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

function firstString(raw: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
    if (v && typeof v === 'object') {
      // Jotform sometimes nests compound fields, e.g. name: { first, last }
      const collapsed = Object.values(v as Record<string, unknown>)
        .filter((x) => typeof x === 'string')
        .join(' ')
        .trim();
      if (collapsed) return collapsed;
    }
  }
  return undefined;
}

function lookupEnum<T extends string>(
  map: Record<string, T>,
  raw: string | undefined,
): T | undefined {
  if (!raw) return undefined;
  if (map[raw]) return map[raw];
  // case-insensitive fallback
  const lower = raw.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

/**
 * Parses a Jotform webhook payload (multipart/form-data) into a validated
 * `RegisterRequest`. Throws `JotformParseError` on any failure so the
 * webhook handler can log it and return a 200 (no Jotform retry loop).
 */
export function parseJotformPayload(form: FormData): ParsedJotformPayload {
  const submissionId = form.get('submissionID');
  if (typeof submissionId !== 'string' || submissionId.length === 0) {
    throw new JotformParseError('MISSING_SUBMISSION_ID', 'submissionID missing');
  }
  const formId = (form.get('formID') as string | null) ?? '';

  const rawRequestStr = form.get('rawRequest');
  if (typeof rawRequestStr !== 'string' || rawRequestStr.length === 0) {
    throw new JotformParseError('MISSING_RAW_REQUEST', 'rawRequest missing');
  }
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(rawRequestStr) as Record<string, unknown>;
  } catch (err) {
    throw new JotformParseError('BAD_RAW_REQUEST', 'rawRequest is not JSON', err);
  }

  const candidate = {
    nombre: firstString(raw, FIELD_MAP.nombre),
    email: firstString(raw, FIELD_MAP.email),
    telefono: firstString(raw, FIELD_MAP.telefono),
    genero: lookupEnum(GENERO_MAP, firstString(raw, FIELD_MAP.genero)),
    edad: firstString(raw, FIELD_MAP.edad),
    institucion: firstString(raw, FIELD_MAP.institucion),
    carrera: firstString(raw, FIELD_MAP.carrera),
    nivelAcademico: lookupEnum(NIVEL_MAP, firstString(raw, FIELD_MAP.nivelAcademico)),
  };

  const parsed = registerSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new JotformParseError(
      'VALIDATION',
      'Jotform payload failed validation',
      parsed.error.issues,
    );
  }

  return { submissionId, formId, data: parsed.data };
}

export function isAllowedFormId(
  formId: string,
  csv: string | undefined,
  options: { requireConfigured?: boolean } = {},
): boolean {
  if (!csv) return options.requireConfigured ? false : true;
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .includes(formId);
}
