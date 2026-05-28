import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { formatDateTime, formatParticipantNumber } from '../lib/format';
import { Bolt, Sparkle } from '../components/decorations';
import type { Attendee, InsuranceType } from '@shared/types';

interface ConfirmationState {
  participantNumber?: number;
  attendee?: {
    nombre?: string;
    email?: string;
    telefono?: string;
    insuranceType?: InsuranceType;
    createdAt?: string;
  };
}

export function ConfirmationPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const numberFromQuery = params.get('n');

  const state = (location.state as ConfirmationState | null) ?? {};
  const participantNumber =
    state.participantNumber ??
    (numberFromQuery ? Number(numberFromQuery) : null);

  if (!participantNumber || !Number.isFinite(participantNumber)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="event-shell min-h-full">
      <img
        src="/register-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] w-full object-cover opacity-30"
        style={{ objectPosition: '50% 50%' }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-[20rem] h-32 bg-gradient-to-b from-transparent to-ink-950" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
        <Loaded participantNumber={participantNumber} attendee={state.attendee} />
      </div>
    </div>
  );
}

function Loaded({
  participantNumber,
  attendee,
}: {
  participantNumber: number;
  attendee?: ConfirmationState['attendee'] | Attendee;
}) {
  const { t, locale } = useTranslation();
  const a = attendee;

  return (
    <>
      {/* Top eyebrow / brand line. */}
      <div className="flex flex-col items-center text-center">
        <span className="pill-accent">
          <Bolt className="h-3.5 w-3.5" />
          BORN GIFTED · May 31 · Miami
        </span>
        <h1 className="headline mt-6 text-[clamp(2.5rem,7vw,5.5rem)]">
          <span className="text-white">{t('confirmation.title')}</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-ink-100/80">
          {t('confirmation.subtitle.line1')} {t('confirmation.subtitle.line2')}
        </p>

        {/* Prominent spam-folder reminder — visible immediately so the
            attendee doesn't lose their participant number if the email
            ends up in a junk filter. */}
        <div className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-2xl border border-accent-300/40 bg-accent-300/10 px-4 py-3 text-left">
          <span className="mt-0.5 text-lg" aria-hidden="true">📬</span>
          <p className="text-sm leading-6 text-ink-100/90">
            <span className="font-semibold text-accent-200">
              {t('confirmation.spamHeading')}
            </span>{' '}
            {t('confirmation.spamBody')}
          </p>
        </div>
      </div>

      {/* The participant ticket. */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <Ticket
          participantNumber={participantNumber}
          name={a?.nombre}
          className="lg:col-span-2"
        />

        <section className="card-lg grain-on relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="relative flex flex-col items-center text-center">
            <EnvelopeIllustration className="h-24 w-auto" />
            <h2 className="mt-4 font-display text-xl uppercase tracking-wider text-white">
              {t('confirmation.email.title')}
            </h2>
            <p className="mt-1 text-sm text-ink-100/80">{t('confirmation.email.body')}</p>
          </div>
        </section>

        <section className="card-lg p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-sky-300">
              <UserMiniIcon />
            </div>
            <h2 className="font-display text-lg uppercase tracking-wider text-white">
              {t('confirmation.summaryTitle')}
            </h2>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <SummaryItem label={t('register.field.nombre')} value={a?.nombre} />
            <SummaryItem label={t('register.field.email')} value={a?.email} />
            <SummaryItem label={t('register.field.telefono')} value={a?.telefono} />
            <SummaryItem
              label={t('register.field.insuranceType')}
              value={a?.insuranceType ? t(`insurance.${a.insuranceType}`) : undefined}
            />
            <SummaryItem
              label={t('confirmation.registeredAt')}
              value={a?.createdAt ? formatDateTime(a.createdAt, locale) : undefined}
            />
          </dl>
        </section>

        <section className="card-lg space-y-4 p-6">
          <NoticeRow
            icon={<TeamMiniIcon />}
            title={t('confirmation.notice1.title')}
            body={t('confirmation.notice1.body')}
          />
          <NoticeRow
            icon={<GiftMiniIcon />}
            title={t('confirmation.notice2.title')}
            body={t('confirmation.notice2.body')}
          />
          <NoticeRow
            icon={<SendMiniIcon />}
            title={t('confirmation.notice3.title')}
            body={t('confirmation.notice3.body')}
          />
        </section>
      </div>

      <div className="mt-10 flex justify-center">
        <Link to="/" className="btn-secondary py-3 px-6 text-sm uppercase tracking-widest">
          <HomeIcon /> {t('confirmation.backHome')}
        </Link>
      </div>
    </>
  );
}

/* --------------------------------------------------------------------------
   Ticket — the event-pass card with perforated edges and BORN GIFTED branding.
   -------------------------------------------------------------------------- */
function Ticket({
  participantNumber,
  name,
  className,
}: {
  participantNumber: number;
  name?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <section
      className={`card-lg grain-on relative overflow-hidden p-0 ${className ?? ''}`}
    >
      {/* Perforation circles cut from the side. */}
      <span className="pointer-events-none absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-ink-950" />
      <span className="pointer-events-none absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-ink-950" />

      <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
        {/* Left half — event detail. */}
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Bolt className="h-4 w-4" />
            <span className="font-editorial text-[11px] uppercase tracking-[0.35em] text-accent-300">
              Official entry pass
            </span>
          </div>
          <div className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] text-white">
            “BORN<br />GIFTED”
          </div>
          <div className="mt-3 text-[11px] uppercase tracking-[0.3em] text-ink-100/70">
            Fundraiser Exhibition · Casa Nübe · Miami
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
                Date
              </div>
              <div className="mt-1 font-display text-xl text-white">May 31</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
                Doors
              </div>
              <div className="mt-1 font-display text-xl text-white">4:00 PM</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
                Holder
              </div>
              <div className="mt-1 font-display text-xl text-white truncate">
                {name ?? '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 border-l-2 border-dashed border-white/15" />
        </div>

        {/* Right half — the participant number. */}
        <div className="relative grid place-items-center border-t border-dashed border-white/15 px-6 py-8 sm:border-l sm:border-t-0 sm:px-10">
          <Sparkle className="spark absolute left-6 top-6 h-5 w-5" />
          <Sparkle className="spark absolute right-6 top-8 h-3.5 w-3.5 [animation-delay:600ms]" />
          <Sparkle className="spark absolute bottom-6 left-10 h-4 w-4 [animation-delay:1200ms]" />
          <Sparkle className="spark absolute bottom-8 right-8 h-3.5 w-3.5 [animation-delay:300ms]" />
          <div className="text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-ink-200/70">
              {t('confirmation.numberLabel')}
            </div>
            <div className="mt-3 font-display text-[clamp(4rem,9vw,8rem)] leading-none text-accent-300 drop-shadow-[0_0_30px_rgba(247,201,72,0.35)]">
              {formatParticipantNumber(participantNumber)}
            </div>
            <p className="mt-3 max-w-[14rem] text-xs text-ink-100/70">
              {t('confirmation.numberNotice')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-200/60">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-white">{value ?? '—'}</dd>
    </div>
  );
}

function NoticeRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-sky-300">
        {icon}
      </div>
      <div>
        <div className="font-display text-base uppercase tracking-wider text-white">
          {title}
        </div>
        <p className="text-sm text-ink-100/80">{body}</p>
      </div>
    </div>
  );
}

function UserMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
function TeamMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5M14 20c0-2 2-4 4-4s4 2 4 4" />
    </svg>
  );
}
function GiftMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M3 12h18M12 8v13" />
    </svg>
  );
}
function SendMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l18-8-8 18-2-8-8-2z" strokeLinejoin="round" />
    </svg>
  );
}
function EnvelopeIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
      <rect x="20" y="22" width="80" height="54" rx="6" fill="#0e1a36" stroke="rgba(255,255,255,0.18)" />
      <path d="M20 28 L 60 56 L 100 28" fill="none" stroke="#4992e8" strokeWidth="2" />
      <rect x="28" y="14" width="64" height="40" rx="4" fill="rgba(255,255,255,0.92)" />
      <path d="M34 24 h 52 M34 32 h 40 M34 40 h 30" stroke="#74b1f5" strokeWidth="2" strokeLinecap="round" />
      <circle cx="92" cy="68" r="10" fill="#f7c948" />
      <path d="M87 68 l 4 4 l 7 -8" fill="none" stroke="#070d1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-8 9 8M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
