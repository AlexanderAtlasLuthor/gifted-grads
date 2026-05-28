import { useTranslation } from '../i18n/I18nProvider';
import { RegisterForm } from '../components/RegisterForm';
import { Bolt } from '../components/decorations';

export function RegisterPage() {
  const { t } = useTranslation();
  return (
    <div className="event-shell min-h-full">
      {/* Glow overlays — top sky-glow and an off-screen cyan ember. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_50%_26%,rgba(31,78,137,0.5),transparent_42%)]" />
      <div className="pointer-events-none absolute -left-24 top-[30rem] hidden h-72 w-72 rounded-full bg-[#6EC6E8]/10 blur-3xl lg:block" />

      <div className="relative mx-auto w-full pb-12 lg:pb-16">
        {/* =========================================================
            HERO — sphere, flyer photo, big title
            ========================================================= */}
        <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden border-y border-white/10 sm:min-h-[48rem] lg:aspect-[1672/941] lg:min-h-0">
          {/* The supplied flyer-style background — kids holding the globe
              over clouds. */}
          <img
            src="/register-bg.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_42%] lg:object-[50%_56%]"
          />
          {/* Grain overlay. */}
          <div className="pointer-events-none absolute inset-0 grain-on opacity-70" />
          {/* Bottom fade — pulls into the registration section below. */}
          <div className="pointer-events-none absolute inset-x-[-10%] bottom-0 h-80 bg-gradient-to-t from-ink-950 via-ink-950/55 to-transparent" />
          {/* Top fade — keeps header navigation legible. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-950/70 to-transparent" />
          {/* Centre vertical scrim — so the BORN GIFTED title reads cleanly
              over the bright globe in the supplied background image. */}
          <div className="pointer-events-none absolute inset-0 bg-ink-950/20 lg:hidden" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[60%] -translate-x-1/2 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(4,8,19,0.55),transparent_70%)]" />

          <div className="relative z-10 grid h-full place-content-center gap-6 px-4 py-6 text-white sm:px-6 sm:py-8 lg:grid-cols-[0.82fr_1fr_0.82fr] lg:content-normal lg:px-10">
            {/* Left rail — desktop only */}
            <div className="hidden space-y-4 pt-4 sm:space-y-5 sm:pt-5 lg:block lg:pt-8 xl:pt-10">
              <div>
                <p className="font-display text-[clamp(3.4rem,18vw,5.8rem)] uppercase leading-[0.82] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.65)] lg:text-[clamp(3.2rem,8vw,5.8rem)]">
                  May 31<span className="align-super text-[0.42em]">st</span>
                </p>
                <p className="mt-2 font-editorial text-2xl tracking-wider text-[#F4F7FA] sm:text-3xl">
                  4PM&nbsp;—&nbsp;UNTIL
                </p>
              </div>
              <div className="max-w-[13rem] border-l-2 border-accent-400/70 pl-4 leading-relaxed sm:max-w-none">
                <p className="font-display text-xl tracking-wide text-white">Casa Nübe</p>
                <p className="mt-1 max-w-[15rem] text-[#D9E7F4]">
                  2060 NW 1st Ave<br />
                  Miami, FL 33127
                </p>
              </div>
            </div>

            {/* Centre title */}
            <div className="flex flex-col items-center justify-center text-center lg:min-h-[30rem] lg:translate-y-8 lg:pb-0">
              <span className="pill-accent">
                <Bolt className="h-3.5 w-3.5" />
                {t('hero.eyebrow')}
              </span>
              <p className="eyebrow mt-5 text-sky-200/80 sm:mt-8">
                Gifted Grads · Westborn Collectives
              </p>
              <h1 className="event-title mt-4 text-[clamp(3.4rem,19vw,5.8rem)] sm:mt-5 lg:text-[clamp(3.4rem,12vw,8.5rem)]">
                “BORN GIFTED”
              </h1>
              <p className="mt-4 max-w-[18rem] font-editorial text-[10px] uppercase leading-5 tracking-[0.14em] text-[#D8F3FF] sm:max-w-none sm:text-sm sm:tracking-[0.45em] lg:hidden">
                Fundraiser · Exhibition · Registration
              </p>
              <p className="mt-4 hidden items-center justify-center gap-5 font-editorial text-base uppercase tracking-[0.32em] text-[#D8F3FF] lg:flex">
                <span>Fundraiser</span>
                <span className="text-[#D8F3FF]/70">·</span>
                <span>Exhibition</span>
                <span className="text-[#D8F3FF]/70">·</span>
                <span>Registration</span>
              </p>
              <a
                href="#registration"
                className="btn-primary mt-7 px-8 py-3 text-sm uppercase tracking-widest sm:mt-10"
              >
                <Bolt className="h-4 w-4" />
                {t('hero.cta')}
              </a>
            </div>

            {/* Right rail */}
            <div className="hidden flex-col justify-between gap-10 pt-7 text-left lg:flex lg:text-right xl:pt-9">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[#F4F7FA]/85">
                  {t('hero.brought.line1')}
                </p>
                <p className="mt-2 font-display text-2xl uppercase leading-tight tracking-wide text-white">
                  Gifted Grads<br />Westborn Collectives
                </p>
              </div>
            </div>
          </div>

          {/* Partner row */}
          <div className="absolute inset-x-0 bottom-0 z-10 hidden flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-4 text-[10px] uppercase tracking-[0.35em] text-ink-200/70 sm:px-8 lg:flex">
            <span>In partnership with</span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-editorial text-ink-100/80">
              <span>Influence Radio</span>
              <span>Neighborhood</span>
              <span>.XYZ</span>
              <span>Filthy</span>
            </div>
            <span className="hidden sm:inline">giftedgrads.org/borngifted</span>
          </div>
        </section>

        {/* =========================================================
            REGISTRATION SECTION
            ========================================================= */}
        <section
          id="registration"
          className="relative mx-auto mt-12 grid w-full max-w-[108rem] items-stretch gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-10 overflow-hidden bg-[url('/formbackground.jpg')] bg-cover bg-center"
        >
          <div className="pointer-events-none absolute inset-0 bg-black/30" />

          <div className="glass-card grain-on relative flex h-full flex-col p-5 sm:p-7 lg:p-8">
            <div className="mb-6 border-b border-white/10 pb-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{t('register.eyebrow')}</p>
                  <h2 className="mt-2 font-display text-3xl uppercase tracking-wide text-white sm:text-5xl">
                    {t('register.formTitle')}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8FA9C4]">
                    {t('register.formSubtitle')}
                  </p>
                </div>
                <div className="pill-accent">
                  <GiftIcon className="h-4 w-4" />
                  {t('register.formPill')}
                </div>
              </div>
            </div>

            <RegisterForm />

            <div className="mt-auto pt-6">
              <div className="rounded-2xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm leading-6 text-ink-100/90">
                <div className="mb-1 flex items-center gap-2 font-display text-base uppercase tracking-wider text-sky-300">
                  <InfoIcon />
                  {t('register.disclaimer.title')}
                </div>
                <p className="text-ink-100/80">{t('register.disclaimer.body')}</p>
              </div>
            </div>
          </div>

          <aside className="glass-card grain-on relative flex h-full flex-col overflow-hidden p-6 sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-6 h-60 w-60 rounded-full bg-sky-400/15 blur-3xl" />

            <div className="relative">
              <span className="eyebrow text-accent-300">{t('register.giveaway.lead')}</span>
              <h3 className="event-title mt-3 text-3xl sm:text-4xl">
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
        </section>
      </div>
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
        <div className="font-display text-base uppercase tracking-wider text-white">{title}</div>
        <p className="text-sm leading-6 text-ink-100/80">{children}</p>
      </div>
    </div>
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
