// GET /api/registration/by-submission/[id] — public.
//
// Looks up an attendee by their Jotform submission ID. Used by the
// confirmation page right after the Jotform thank-you redirect: the React
// client polls this until the webhook has populated the row.

import { error, json } from '../../../_shared/responses';
import { rowToAttendeeIso, type AttendeeRow } from '../../../_shared/db';

type Env = { DB: D1Database };

export const onRequestGet: PagesFunction<Env, 'id'> = async (ctx) => {
  const id = ctx.params.id;
  if (typeof id !== 'string' || id.length === 0) {
    return error(400, 'VALIDATION_ERROR', 'Invalid submission id');
  }

  const row = await ctx.env.DB.prepare(
    `SELECT id, participant_number, nombre, email, telefono, genero, edad,
            institucion, carrera, nivel_academico, created_at
     FROM attendees
     WHERE jotform_submission_id = ?
     LIMIT 1`,
  )
    .bind(id)
    .first<AttendeeRow>();

  if (!row) {
    return error(404, 'PENDING', 'Registration not yet processed');
  }

  const attendee = rowToAttendeeIso(row);
  return json(200, {
    participantNumber: attendee.participantNumber,
    attendee,
  });
};
