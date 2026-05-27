import { raffleDrawSchema } from '@shared/schemas';
import { error, json } from '../../_shared/responses';
import { rowToAttendeeIso, type AttendeeRow } from '../../_shared/db';
import { sendResendEmail, winnerEmail } from '../../_shared/emails';

type Env = {
  DB: D1Database;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const raw = await ctx.request.json().catch(() => null);
  const parsed = raffleDrawSchema.safeParse(raw);
  if (!parsed.success) {
    return error(400, 'VALIDATION_ERROR', 'Invalid body');
  }
  const body = parsed.data;

  const countRow = await ctx.env.DB.prepare(
    'SELECT COUNT(*) AS total FROM attendees',
  ).first<{ total: number }>();
  if (!countRow || countRow.total === 0) {
    return error(400, 'NO_ATTENDEES', 'No hay asistentes registrados');
  }

  let winnerRow: AttendeeRow | null = null;
  if (body.mode === 'manual') {
    winnerRow = await ctx.env.DB.prepare(
      `SELECT id, participant_number, nombre, email, telefono, genero, edad, institucion, carrera, nivel_academico, created_at
       FROM attendees WHERE participant_number = ? LIMIT 1`,
    )
      .bind(body.participantNumber)
      .first<AttendeeRow>();
    if (!winnerRow) {
      return error(404, 'WINNER_NOT_FOUND', 'Número de participante no encontrado');
    }
  } else {
    winnerRow = await ctx.env.DB.prepare(
      `SELECT id, participant_number, nombre, email, telefono, genero, edad, institucion, carrera, nivel_academico, created_at
       FROM attendees ORDER BY RANDOM() LIMIT 1`,
    ).first<AttendeeRow>();
    if (!winnerRow) {
      return error(400, 'NO_ATTENDEES', 'No hay asistentes registrados');
    }
  }

  const drawnAtIso = new Date().toISOString();
  await ctx.env.DB.prepare(
    'INSERT INTO raffle_draws (attendee_id, drawn_at, mode) VALUES (?, ?, ?)',
  )
    .bind(winnerRow.id, drawnAtIso, body.mode)
    .run();

  const winner = rowToAttendeeIso(winnerRow);

  let emailSent = false;
  if (ctx.env.RESEND_API_KEY && ctx.env.RESEND_FROM) {
    const { subject, html, text } = winnerEmail(winner);
    emailSent = await sendResendEmail({
      apiKey: ctx.env.RESEND_API_KEY,
      from: ctx.env.RESEND_FROM,
      to: winner.email,
      subject,
      html,
      text,
    });
  }

  return json(200, { winner, drawnAt: drawnAtIso, emailSent });
};
