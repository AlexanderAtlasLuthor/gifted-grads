import { useTranslation } from '../i18n/I18nProvider';
import { JotformEmbed } from '../components/JotformEmbed';
import { Bolt, FlyerScene } from '../components/decorations';

export function RegisterPage() {
  const { t } = useTranslation();
  return (
    <div className="relative isolate">
      {/* =============================================================
          HERO — full-bleed flyer-style composition
          ============================================================= */}
      <section className="relative min-h-[760px] w-full overflow-hidden lg:min-h-[88vh]">
        {/* The cinematic flyer scene (sky + globe + silhouettes). */}
        <FlyerScene className="absolute inset-0" />

        {/* Heavy grain layer over the whole hero. */}
        <div className="pointer-events-none absolute inset-0 grain-on opacity-100" />

        {/* Foreground content. */}
        <div className="relative mx-auto flex h-full max-w-7xl flex-col px-5 pb-12 pt-8 sm:px-10 sm:pt-12 lg:min-h-[88vh] lg:pt-16">
          {/* Top eyebrow row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="pill-accent">
              <Bolt className="h-3.5 w-3.5" />
              {t('hero.eyebrow')}
            </div>
            <div className="hidden text-right text-[10px] uppercase tracking-[0.35em] text-ink-100/75 sm:block">
              {t('hero.brought.line1')}
              <br />
              <span className="font-display tracking-wider text-white">
                {t('hero.brought.line2')}
              </span>
            </div>
          </div>

          {/* Centre title block — sits over the globe. */}
          <div className="my-auto flex flex-col items-center pt-10 text-center lg:pt-0">
            <span className="eyebrow text-sky-200/80">
              Gifted Grads · Westborn Collectives
            </span>
            <h1 className="headline mt-3 text-[clamp(4rem,16vw,14rem)] drop-shadow-[0_12px_50px_rgba(0,0,0,0.7)]">
              <span className="text-white">“BORN</span>
              <br className="sm:hidden" />{' '}
              <span className="text-white">GIFTED”</span>
            </h1>
            <div className="mt-2 font-editorial text-xs uppercase tracking-[0.45em] text-ink-100/85 sm:text-sm">
              Fundraiser&nbsp;·&nbsp;Exhibition&nbsp;·&nbsp;Registration
            </div>
            <a
              href="#register"
              className="btn-primary mt-10 px-8 py-3 text-sm uppercase tracking-widest"
            >
              <Bolt className="h-4 w-4" />
              {t('hero.cta')}
            </a>
          </div>

          {/* Bottom row — date / venue (left), agenda (right), partners (across). */}
          <div className="mt-auto pt-10">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
              {/* Left — date + venue */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10">
                <div>
                  <div className="flex items-end gap-3">
                    <span className="font-display text-[clamp(4rem,11vw,9rem)] leading-[0.8] text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.75)]">
                      MAY
                    </span>
                    <span className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.8] text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.75)]">
                      31<sup className="text-[0.5em]">ST</sup>
                    </span>
                  </div>
                  <div className="mt-3 font-editorial text-sm uppercase tracking-widest text-ink-100">
                    4&nbsp;PM&nbsp;—&nbsp;UNTIL
                  </div>
                </div>

                <div className="border-l-2 border-accent-400/70 pl-4 text-sm leading-relaxed text-ink-100">
                  <div className="font-display text-xl tracking-wide text-white">
                    Casa Nübe
                  </div>
                  <div className="text-ink-200/85">2060 NW 1st Ave</div>
                  <div className="text-ink-200/85">Miami, FL 33127</div>
                </div>
              </div>

              {/* Right — agenda */}
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-8 lg:flex-col lg:items-end lg:gap-5">
                <AgendaLine time="4:00 PM" body={t('hero.agenda.panel')} />
                <AgendaLine time="5:30 PM" body={t('hero.agenda.opening')} accent />
              </div>
            </div>

            {/* Partner / source line. */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.35em] text-ink-200/65">
              <span>In partnership with</span>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-editorial text-ink-100/80">
                <span>Influence Radio</span>
                <span>Neighborhood</span>
                <span>.XYZ</span>
                <span>Filthy</span>
              </div>
              <span className="hidden sm:inline">giftedgrads.org/borngifted</span>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          REGISTRATION SECTION
          ============================================================= */}
      <section
        id="register"
        className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20"
      >
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-sky-glow blur-[120px]" />

        <div className="relative">
          <div className="flex flex-col items-center text-center">
            <span className="eyebrow">{t('register.eyebrow')}</span>
            <h2 className="headline mt-4 text-[clamp(2.5rem,6vw,5rem)]">
              {t('register.title.line1')}{' '}
              <span className="text-accent-300">{t('register.title.line2')}</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink-100/80">
              {t('register.subtitle')}
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
            {/* ----- Form card ----- */}
            <section className="card-lg grain-on flex flex-col p-5 sm:p-7 lg:p-8">
              <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-sky-300">
                    <UserIcon />
                  </div>
                  <div>
                    <h3 className="font-display text-xl uppercase tracking-wide text-white">
                      {t('register.formTitle')}
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-ink-200/70">
                      {t('register.formSubtitle')}
                    </p>
                  </div>
                </div>
                <div className="pill-accent">
                  <GiftIcon className="h-4 w-4" />
                  {t('register.formPill')}
                </div>
              </div>

              <JotformEmbed />

              <div className="mt-auto pt-6">
                <div className="rounded-2xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm leading-6 text-ink-100/90">
                  <div className="mb-1 flex items-center gap-2 font-display text-base uppercase tracking-wider text-sky-300">
                    <InfoIcon />
                    {t('register.disclaimer.title')}
                  </div>
                  <p className="text-ink-100/80">{t('register.disclaimer.body')}</p>
                </div>
              </div>
            </section>

            {/* ----- Raffle / details aside ----- */}
            <aside className="card-lg grain-on relative flex flex-col overflow-hidden p-6 sm:p-7 lg:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-6 h-60 w-60 rounded-full bg-sky-400/15 blur-3xl" />

              <div className="relative">
                <span className="eyebrow text-accent-300">{t('register.giveaway.lead')}</span>
                <h3 className="headline mt-3 text-3xl sm:text-4xl">
                  {t('register.giveaway.highlight')}
                </h3>
                <div className="mt-6 flex justify-center">
                  <IpadIllustration className="h-24 w-auto" />
                </div>
              </div>

              <div className="relative mt-8 space-y-4">
                <FeatureRow icon={<BoltIcon />} title={t('register.feature.instant.title')}>
                  {t('register.feature.instant.body')}
                </FeatureRow>
                <FeatureRow icon={<LockIcon />} title={t('register.feature.secure.title')}>
                  {t('register.feature.secure.body')}
                </FeatureRow>
                <FeatureRow icon={<TeamIcon />} title={t('register.feature.team.title')}>
                  {t('register.feature.team.body')}
                </FeatureRow>
              </div>

              <div className="relative mt-6">
                <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4 text-sm leading-6 text-ink-100/85">
                  {t('register.sidebar.note')}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function AgendaLine({
  time,
  body,
  accent,
}: {
  time: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-start lg:items-end">
      <span
        className={
          accent
            ? 'font-display text-2xl text-accent-300'
            : 'font-display text-2xl text-white'
        }
      >
        {time}
      </span>
      <span className="text-[11px] uppercase tracking-[0.3em] text-ink-100/80">
        {body}
      </span>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-accent-300">
        {icon}
      </div>
      <div>
        <div className="font-display text-base uppercase tracking-wider text-white">
          {title}
        </div>
        <p className="text-sm leading-6 text-ink-100/80">{children}</p>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5a1.2 1.2 0 1 1 0 2.4A1.2 1.2 0 0 1 12 7zm1 10h-2v-6h2v6z" />
    </svg>
  );
}
function GiftIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M3 12h18M12 8v13M8 8c0-2 1.5-4 4-4 2.5 0 4 2 4 4M8 8c-2 0-3-1-3-2.5S6 3 7.5 3c2 0 4.5 3 4.5 5" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5M14 20c0-2 2-4 4-4s4 2 4 4" />
    </svg>
  );
}
function IpadIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
      <rect x="22" y="6" width="76" height="62" rx="6" fill="#0e1a36" stroke="rgba(255,255,255,0.18)" />
      <rect x="26" y="10" width="68" height="54" rx="3" fill="#1c4a8a" />
      <path d="M26 38 Q 60 18 94 38 L 94 64 L 26 64 Z" fill="#4992e8" />
      <circle cx="86" cy="20" r="3" fill="#f7c948" />
      <rect x="14" y="68" width="92" height="6" rx="3" fill="rgba(255,255,255,0.85)" />
      <rect x="22" y="74" width="76" height="3" rx="1.5" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}
