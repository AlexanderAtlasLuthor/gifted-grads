import { registerSchema } from '@shared/schemas';
import { error, json } from '../_shared/responses';
import { organizerEmail, sendResendEmail } from '../_shared/emails';
import { rowToAttendeeIso, type AttendeeRow } from '../_shared/db';

type Env = {
  DB: D1Database;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  ORGANIZER_EMAIL: string;
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const raw = await ctx.request.json().catch(() => null);
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (path) fields[path] = issue.message;
    }
    return error(400, 'VALIDATION_ERROR', 'Validation failed', fields);
  }
  const data = parsed.data;
  const id = crypto.randomUUID();

  const existing = await ctx.env.DB.prepare(
    'SELECT id FROM attendees WHERE email = ? COLLATE NOCASE LIMIT 1',
  )
    .bind(data.email)
    .first<{ id: string }>();
  if (existing) {
    return error(409, 'EMAIL_EXISTS', 'Email ya registrado');
  }

  // D1 has no multi-statement BEGIN over the binding; rely on email UNIQUE
  // and the participant_number UNIQUE constraint + a small retry to handle
  // the rare race in concurrent inserts.
  const MAX_RETRIES = 5;
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const next = await ctx.env.DB.prepare(
      'SELECT COALESCE(MAX(participant_number), 0) + 1 AS next FROM attendees',
    ).first<{ next: number }>();
    const participantNumber = next?.next ?? 1;
    try {
      const insert = await ctx.env.DB.prepare(
        `INSERT INTO attendees (id, participant_number, nombre, email, telefono, genero, edad, institucion, carrera, nivel_academico)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id, participant_number, nombre, email, telefono, genero, edad, institucion, carrera, nivel_academico, created_at`,
      )
        .bind(
          id,
          participantNumber,
          data.nombre,
          data.email,
          data.telefono,
          data.genero,
          data.edad,
          data.institucion,
          data.carrera,
          data.nivelAcademico,
        )
        .first<AttendeeRow>();
      if (!insert) {
        return error(500, 'SERVER_ERROR', 'Insert failed');
      }
      const attendee = rowToAttendeeIso(insert);

      // Fire-and-forget organizer notification — never fail the request on email errors.
      const { subject, html, text } = organizerEmail(attendee);
      ctx.waitUntil(
        sendResendEmail({
          apiKey: ctx.env.RESEND_API_KEY,
          from: ctx.env.RESEND_FROM,
          to: ctx.env.ORGANIZER_EMAIL,
          subject,
          html,
          text,
        }),
      );

      return json(201, {
        id: attendee.id,
        participantNumber: attendee.participantNumber,
        createdAt: attendee.createdAt,
      });
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      // UNIQUE constraint collision on participant_number — retry.
      if (/UNIQUE/i.test(msg) && /participant_number/i.test(msg)) continue;
      // UNIQUE on email — duplicate registration mid-race.
      if (/UNIQUE/i.test(msg) && /email/i.test(msg)) {
        return error(409, 'EMAIL_EXISTS', 'Email ya registrado');
      }
      throw err;
    }
  }
  console.error('register: max retries reached', lastErr);
  return error(500, 'SERVER_ERROR', 'Could not assign participant number');
};
