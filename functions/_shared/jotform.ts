import { registerSchema } from '@shared/schemas';
import type { Genero, NivelAcademico, RegisterRequest } from '@shared/types';

/**
 * Field aliases used to find each form field inside Jotform's `rawRequest`
 * JSON payload. Jotform keys are typically `q{N}_{slug}` — we strip the
 * `qN_` prefix and match the remaining slug against these aliases, so the
 * mapping works no matter which slot number Jotform assigned to the field.
 *
 * Order matters: an exact slug match wins over a substring match, and
 * earlier aliases win over later ones.
 */
export const FIELD_ALIASES = {
  nombre: ['nombreCompleto', 'fullName', 'nombre', 'name'],
  email: ['email', 'correoElectronico', 'correo'],
  telefono: ['telefono', 'telephoneNumber', 'phoneNumber', 'phone'],
  genero: ['genero', 'gender'],
  edad: ['edad', 'age'],
  institucion: [
    'institucionOUniversidad',
    'institutionOrUniversity',
    'institucion',
    'institution',
    'universidad',
    'university',
  ],
  carrera: [
    'carreraOAreaDe',
    'carreraOAreaDeEstudio',
    'majorOrFieldOf',
    'majorOrFieldOfStudy',
    'carrera',
    'major',
  ],
  nivelAcademico: [
    'nivelAcademico',
    'academicLevel',
    'nivel',
    'level',
  ],
} satisfies Record<keyof RegisterRequest, string[]>;

/**
 * Maps the human-readable option text Jotform sends to our schema enums.
 * Edit these once the actual option labels are confirmed in the forms.
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
  'High School': 'SECUNDARIA',
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

function extractString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (value && typeof value === 'object') {
    // Jotform compound fields, e.g. name: { first, last, prefix, suffix }
    const collapsed = Object.values(value as Record<string, unknown>)
      .filter((x) => typeof x === 'string')
      .map((s) => (s as string).trim())
      .filter((s) => s.length > 0)
      .join(' ');
    return collapsed.length > 0 ? collapsed : undefined;
  }
  if (typeof value === 'number') return String(value);
  return undefined;
}

function findValue(
  raw: Record<string, unknown>,
  aliases: string[],
): string | undefined {
  // Normalize each key once: strip the leading qN_ that Jotform prepends.
  const normalized = Object.keys(raw).map((key) => ({
    key,
    slug: key.replace(/^q\d+_/i, '').toLowerCase(),
  }));
  // Exact-slug match first.
  for (const alias of aliases) {
    const a = alias.toLowerCase();
    const exact = normalized.find((n) => n.slug === a);
    if (exact) {
      const s = extractString(raw[exact.key]);
      if (s) return s;
    }
  }
  // Substring fallback (e.g. alias "email" finds "emailAddress").
  for (const alias of aliases) {
    const a = alias.toLowerCase();
    const partial = normalized.find((n) => n.slug.includes(a));
    if (partial) {
      const s = extractString(raw[partial.key]);
      if (s) return s;
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
  const lower = raw.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

/**
 * Parses a Jotform webhook payload (multipart/form-data) into a validated
 * `RegisterRequest`. Throws `JotformParseError` on any failure so the
 * webhook handler can log it and return 200 (no Jotform retry loop).
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
    nombre: findValue(raw, FIELD_ALIASES.nombre),
    email: findValue(raw, FIELD_ALIASES.email),
    telefono: findValue(raw, FIELD_ALIASES.telefono),
    genero: lookupEnum(GENERO_MAP, findValue(raw, FIELD_ALIASES.genero)),
    edad: findValue(raw, FIELD_ALIASES.edad),
    institucion: findValue(raw, FIELD_ALIASES.institucion),
    carrera: findValue(raw, FIELD_ALIASES.carrera),
    nivelAcademico: lookupEnum(NIVEL_MAP, findValue(raw, FIELD_ALIASES.nivelAcademico)),
  };

  const parsed = registerSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new JotformParseError(
      'VALIDATION',
      'Jotform payload failed validation',
      { issues: parsed.error.issues, rawKeys: Object.keys(raw) },
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
