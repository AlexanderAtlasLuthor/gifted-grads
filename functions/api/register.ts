// POST /api/register — public registration endpoint used by the
// custom RegisterForm in the SPA.

import { registerSchema } from '../../shared/schemas';
import { error, json } from '../_shared/responses';
import { insertAttendee } from '../_shared/attendees';
import {
  attendeeConfirmationEmail,
  organizerEmail,
  sendResendEmail,
} from '../_shared/emails';

type Env = {
  DB: D1Database;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  ORGANIZER_EMAIL?: string;
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

  const result = await insertAttendee(ctx.env.DB, parsed.data);
  if (result.kind === 'email_exists') {
    return error(409, 'EMAIL_EXISTS', 'Email ya registrado');
  }

  const attendee = result.attendee;

  if (ctx.env.RESEND_API_KEY && ctx.env.RESEND_FROM) {
    const attendeeEmail = attendeeConfirmationEmail(attendee);
    const emailJobs = [
      sendResendEmail({
        apiKey: ctx.env.RESEND_API_KEY,
        from: ctx.env.RESEND_FROM,
        to: attendee.email,
        subject: attendeeEmail.subject,
        html: attendeeEmail.html,
        text: attendeeEmail.text,
      }),
    ];

    if (ctx.env.ORGANIZER_EMAIL) {
      const organizer = organizerEmail(attendee);
      emailJobs.push(
        sendResendEmail({
          apiKey: ctx.env.RESEND_API_KEY,
          from: ctx.env.RESEND_FROM,
          to: ctx.env.ORGANIZER_EMAIL,
          subject: organizer.subject,
          html: organizer.html,
          text: organizer.text,
          replyTo: attendee.email,
        }),
      );
    }

    ctx.waitUntil(Promise.all(emailJobs));
  }

  return json(201, {
    id: attendee.id,
    participantNumber: attendee.participantNumber,
    createdAt: attendee.createdAt,
  });
};
