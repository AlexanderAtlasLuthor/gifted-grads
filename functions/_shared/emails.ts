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
<html lang="en">
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
  const subject = `New insurance lead #${pad(attendee.participantNumber)} — ${attendee.nombre}`;
  const rows: Array<[string, string]> = [
    ['Number', `#${pad(attendee.participantNumber)}`],
    ['Name', attendee.nombre],
    ['Email', attendee.email],
    ['Phone', attendee.telefono],
    ['Insurance type', insuranceLabel(attendee.insuranceType)],
    ['Received', new Date(attendee.createdAt).toLocaleString('en-US', { timeZone: 'UTC' })],
  ];
  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;width:145px;border-bottom:1px solid rgba(255,255,255,0.08);">${escapeHtml(k)}</td><td style="padding:10px 0;color:#f8fafc;font-size:14px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">${escapeHtml(v)}</td></tr>`,
    )
    .join('');
  const html = shellHtml(
    subject,
    `<p style="margin:0 0 8px;font-size:13px;color:#f6cf56;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">New registration</p>
     <h1 style="margin:0 0 14px;font-size:28px;line-height:1.1;color:#ffffff;">Lead #${pad(attendee.participantNumber)}</h1>
     <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#cbd5e1;">A new request came in from the Gifted Grads form.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.08);">
       ${tableRows}
     </table>
     <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#94a3b8;">You can reply directly to this email to contact the lead.</p>`,
  );
  const text = `New insurance lead — Gifted Grads\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n`;
  return { subject, html, text };
}

export function attendeeConfirmationEmail(attendee: Attendee): {
  subject: string;
  html: string;
  text: string;
} {
  const number = `#${pad(attendee.participantNumber)}`;
  const subject = `Your number ${number} — Born Gifted`;
  const html = shellHtml(
    subject,
    `<p style="margin:0 0 8px;font-size:13px;color:#f6cf56;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Registration confirmed</p>
     <h1 style="margin:0 0 14px;font-size:30px;line-height:1.1;color:#ffffff;">Thank you, ${escapeHtml(attendee.nombre)}!</h1>
     <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#cbd5e1;">
       You are registered for Born Gifted and entered in the iPad raffle.
     </p>
     <div style="border:1px dashed rgba(246,207,86,0.75);background:#172033;padding:20px;border-radius:14px;text-align:center;margin:18px 0 20px;">
       <div style="font-size:12px;color:#f6cf56;text-transform:uppercase;letter-spacing:0.18em;font-weight:800;">Your participant number</div>
       <div style="font-family:'Courier New',monospace;font-size:42px;line-height:1;font-weight:800;color:#ffffff;margin-top:10px;">${number}</div>
     </div>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
       <tr>
         <td style="padding:8px 0;color:#94a3b8;font-size:13px;width:120px;">Event</td>
         <td style="padding:8px 0;color:#f8fafc;font-size:14px;font-weight:600;">Born Gifted · May 31 · Miami</td>
       </tr>
       <tr>
         <td style="padding:8px 0;color:#94a3b8;font-size:13px;width:120px;">Venue</td>
         <td style="padding:8px 0;color:#f8fafc;font-size:14px;font-weight:600;">Casa Nübe · 2060 NW 1st Ave</td>
       </tr>
     </table>
     <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#cbd5e1;">
       Save this number. If it is selected as the winner, you will receive a separate email with instructions to claim the prize.
     </p>
     <p style="margin:24px 0 0;font-size:14px;color:#f8fafc;">See you soon!<br/><span style="color:#94a3b8;">Gifted Grads Team</span></p>`,
  );
  const text = `Thank you, ${attendee.nombre}!

You are registered for Born Gifted and entered in the iPad raffle.

Your participant number: ${number}

Save this number. If it is selected as the winner, you will receive a separate email with instructions to claim the prize.

See you soon!
Gifted Grads Team`;
  return { subject, html, text };
}

export function winnerEmail(attendee: Attendee): {
  subject: string;
  html: string;
  text: string;
} {
  const number = `#${pad(attendee.participantNumber)}`;
  const subject = `🎉 You won the iPad! — Gifted Grads`;
  const html = shellHtml(
    subject,
    `<p style="margin:0 0 8px;font-size:13px;color:#f6cf56;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">iPad raffle</p>
     <h1 style="margin:0 0 14px;font-size:30px;line-height:1.1;color:#ffffff;">Congratulations, ${escapeHtml(attendee.nombre)}!</h1>
     <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#cbd5e1;">
       Your participant number <strong style="color:#f6cf56;font-family:'Courier New',monospace;">${number}</strong> was selected in the raffle.
       You won an <strong>iPad</strong>.
     </p>
     <div style="border:1px dashed rgba(246,207,86,0.75);background:#172033;padding:20px;border-radius:14px;text-align:center;margin:18px 0 20px;">
       <div style="font-size:12px;color:#f6cf56;text-transform:uppercase;letter-spacing:0.18em;font-weight:800;">Winning number</div>
       <div style="font-family:'Courier New',monospace;font-size:42px;line-height:1;font-weight:800;color:#ffffff;margin-top:10px;">${number}</div>
     </div>
     <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#cbd5e1;">
       To claim your prize, reply to this email with your full name and an available time to coordinate delivery.
     </p>
     <p style="margin:24px 0 0;font-size:14px;color:#f8fafc;">See you soon!<br/><span style="color:#94a3b8;">Gifted Grads Team</span></p>`,
  );
  const text = `Congratulations ${attendee.nombre}!

Your participant number ${number} was selected in the raffle. You won an iPad.

To claim your prize, reply to this email with your full name and an available time to coordinate delivery.

See you soon!
Gifted Grads Team`;
  return { subject, html, text };
}
