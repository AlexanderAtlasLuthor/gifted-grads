import type { Attendee, InsuranceType } from '../../shared/types';

interface SendArgs {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

const SITE_URL = 'https://gifted-grads-events.pages.dev';
const LOGO_URL = `${SITE_URL}/logo.png`;

export async function sendResendEmail(args: SendArgs): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${args.apiKey}`,
      },
      body: JSON.stringify({
        from: args.from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
        reply_to: args.replyTo,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      console.error(`Resend email failed (${res.status}): ${detail}`);
    }
    return res.ok;
  } catch {
    console.error('Resend email request failed before receiving a response');
    return false;
  }
}

function pad(n: number): string {
  return n.toString().padStart(3, '0');
}

function insuranceLabel(t: InsuranceType): string {
  switch (t) {
    case 'AUTO':
      return 'Auto insurance';
    case 'HOME':
      return 'Home insurance';
    case 'COMMERCIAL':
      return 'Commercial insurance';
    case 'RENTERS':
      return 'Renters insurance';
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shellHtml(title: string, body: string): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#07111f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,sans-serif;color:#f8fafc;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07111f;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#101827;border:1px solid rgba(255,255,255,0.12);border-radius:18px;box-shadow:0 24px 80px rgba(0,0,0,0.35);overflow:hidden;">
            <tr>
              <td style="background:#0f1a2b;padding:22px 28px;border-bottom:1px solid rgba(255,255,255,0.10);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:72px;vertical-align:middle;">
                      <img src="${LOGO_URL}" width="58" alt="Gifted Grads" style="display:block;width:58px;height:auto;border:0;" />
                    </td>
                    <td style="vertical-align:middle;">
                      <div style="color:#f6cf56;font-size:12px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;">Born Gifted</div>
                      <div style="margin-top:3px;color:#cbd5e1;font-size:11px;font-weight:700;letter-spacing:0.20em;text-transform:uppercase;">Gifted Grads</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#0b1322;border-top:1px solid rgba(255,255,255,0.08);color:#94a3b8;font-size:12px;text-align:center;">
                Gifted Grads · Born Gifted
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function organizerEmail(attendee: Attendee): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Nuevo lead de seguro #${pad(attendee.participantNumber)} — ${attendee.nombre}`;
  const rows: Array<[string, string]> = [
    ['Número', `#${pad(attendee.participantNumber)}`],
    ['Nombre', attendee.nombre],
    ['Email', attendee.email],
    ['Teléfono', attendee.telefono],
    ['Tipo de seguro', insuranceLabel(attendee.insuranceType)],
    ['Recibido', new Date(attendee.createdAt).toLocaleString('es', { timeZone: 'UTC' })],
  ];
  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;width:145px;border-bottom:1px solid rgba(255,255,255,0.08);">${escapeHtml(k)}</td><td style="padding:10px 0;color:#f8fafc;font-size:14px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">${escapeHtml(v)}</td></tr>`,
    )
    .join('');
  const html = shellHtml(
    subject,
    `<p style="margin:0 0 8px;font-size:13px;color:#f6cf56;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Nuevo registro</p>
     <h1 style="margin:0 0 14px;font-size:28px;line-height:1.1;color:#ffffff;">Lead #${pad(attendee.participantNumber)}</h1>
     <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#cbd5e1;">Llegó una nueva solicitud desde el formulario de Gifted Grads.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.08);">
       ${tableRows}
     </table>
     <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#94a3b8;">Puedes responder este correo directamente para contactar al lead.</p>`,
  );
  const text = `Nuevo lead de seguro — Gifted Grads\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n`;
  return { subject, html, text };
}

export function attendeeConfirmationEmail(attendee: Attendee): {
  subject: string;
  html: string;
  text: string;
} {
  const number = `#${pad(attendee.participantNumber)}`;
  const subject = `Tu número ${number} — Born Gifted`;
  const html = shellHtml(
    subject,
    `<p style="margin:0 0 8px;font-size:13px;color:#f6cf56;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Registro confirmado</p>
     <h1 style="margin:0 0 14px;font-size:30px;line-height:1.1;color:#ffffff;">¡Gracias, ${escapeHtml(attendee.nombre)}!</h1>
     <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#cbd5e1;">
       Ya estás registrado para Born Gifted y participando en la rifa del iPad.
     </p>
     <div style="border:1px dashed rgba(246,207,86,0.75);background:#172033;padding:20px;border-radius:14px;text-align:center;margin:18px 0 20px;">
       <div style="font-size:12px;color:#f6cf56;text-transform:uppercase;letter-spacing:0.18em;font-weight:800;">Tu número de participante</div>
       <div style="font-family:'Courier New',monospace;font-size:42px;line-height:1;font-weight:800;color:#ffffff;margin-top:10px;">${number}</div>
     </div>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
       <tr>
         <td style="padding:8px 0;color:#94a3b8;font-size:13px;width:120px;">Evento</td>
         <td style="padding:8px 0;color:#f8fafc;font-size:14px;font-weight:600;">Born Gifted · May 31 · Miami</td>
       </tr>
       <tr>
         <td style="padding:8px 0;color:#94a3b8;font-size:13px;width:120px;">Lugar</td>
         <td style="padding:8px 0;color:#f8fafc;font-size:14px;font-weight:600;">Casa Nübe · 2060 NW 1st Ave</td>
       </tr>
     </table>
     <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#cbd5e1;">
       Guarda este número. Si resulta ganador, recibirás otro correo separado con las instrucciones para reclamar el premio.
     </p>
     <p style="margin:24px 0 0;font-size:14px;color:#f8fafc;">¡Nos vemos pronto!<br/><span style="color:#94a3b8;">Equipo Gifted Grads</span></p>`,
  );
  const text = `¡Gracias, ${attendee.nombre}!

Ya estás registrado para Born Gifted y participando en la rifa del iPad.

Tu número de participante: ${number}

Guarda este número. Si resulta ganador, recibirás otro correo separado con las instrucciones para reclamar el premio.

¡Nos vemos pronto!
Equipo Gifted Grads`;
  return { subject, html, text };
}

export function winnerEmail(attendee: Attendee): {
  subject: string;
  html: string;
  text: string;
} {
  const number = `#${pad(attendee.participantNumber)}`;
  const subject = `🎉 ¡Ganaste el iPad! — Gifted Grads`;
  const html = shellHtml(
    subject,
    `<p style="margin:0 0 8px;font-size:13px;color:#f6cf56;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Rifa del iPad</p>
     <h1 style="margin:0 0 14px;font-size:30px;line-height:1.1;color:#ffffff;">¡Felicidades, ${escapeHtml(attendee.nombre)}!</h1>
     <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#cbd5e1;">
       Tu número de participante <strong style="color:#f6cf56;font-family:'Courier New',monospace;">${number}</strong> fue el seleccionado en la rifa.
       Has ganado un <strong>iPad</strong>.
     </p>
     <div style="border:1px dashed rgba(246,207,86,0.75);background:#172033;padding:20px;border-radius:14px;text-align:center;margin:18px 0 20px;">
       <div style="font-size:12px;color:#f6cf56;text-transform:uppercase;letter-spacing:0.18em;font-weight:800;">Número ganador</div>
       <div style="font-family:'Courier New',monospace;font-size:42px;line-height:1;font-weight:800;color:#ffffff;margin-top:10px;">${number}</div>
     </div>
     <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#cbd5e1;">
       Para reclamar tu premio, responde a este correo con tu nombre completo y un horario disponible para coordinar la entrega.
     </p>
     <p style="margin:24px 0 0;font-size:14px;color:#f8fafc;">¡Nos vemos pronto!<br/><span style="color:#94a3b8;">Equipo Gifted Grads</span></p>`,
  );
  const text = `¡Felicidades ${attendee.nombre}!

Tu número de participante ${number} fue el seleccionado en la rifa. Has ganado un iPad.

Para reclamar tu premio, responde a este correo con tu nombre completo y un horario disponible para coordinar la entrega.

¡Nos vemos pronto!
Equipo Gifted Grads`;
  return { subject, html, text };
}
