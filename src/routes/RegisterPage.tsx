import { useTranslation } from '../i18n/I18nProvider';
import { JotformEmbed } from '../components/JotformEmbed';
import { Sparkle } from '../components/decorations';

export function RegisterPage() {
  const { t } = useTranslation();
  return (
    <div className="event-shell min-h-full">
      <div className="absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_50%_26%,rgba(31,78,137,0.46),transparent_42%)]" />
      <div className="absolute -left-24 top-[30rem] hidden h-72 w-72 rounded-full bg-[#6EC6E8]/10 blur-3xl lg:block" />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:pb-16">
        <section className="relative min-h-[calc(100svh-7rem)] overflow-hidden border-y border-white/10 py-6 sm:py-8 lg:min-h-[680px]">
          <div className="pointer-events-none absolute inset-x-[-10%] bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/[0.28] to-transparent" />
          <div className="event-sphere left-1/2 top-[24%] h-[18rem] w-[18rem] -translate-x-1/2 opacity-80 sm:h-[26rem] sm:w-[26rem] lg:top-[18%] lg:h-[34rem] lg:w-[34rem]" />
          <SilhouetteStrip />

          <div className="relative z-10 grid gap-6 text-white lg:grid-cols-[0.82fr_1fr_0.82fr]">
            <div className="space-y-5">
              <div>
                <p className="text-[clamp(3.2rem,8vw,5.8rem)] font-black uppercase leading-[0.82] tracking-normal">
                  May 31<span className="align-super text-[0.42em]">st</span>
                </p>
                <p className="mt-2 text-3xl font-light leading-none text-[#F4F7FA] sm:text-4xl">
                  4pm - until
                </p>
              </div>
              <div className="leading-relaxed">
                <p className="text-xl font-black">Casa Nübe</p>
                <p className="mt-1 max-w-[15rem] text-[#D9E7F4]">
                  2060 NW 1st Ave<br />
                  Miami, FL 33127
                </p>
              </div>
            </div>

            <div className="flex min-h-[24rem] flex-col items-center justify-center text-center sm:min-h-[30rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-100 shadow-sm backdrop-blur">
                <Sparkle className="h-3.5 w-3.5 text-accent-300" />
                {t('register.badge')}
              </div>
              <p className="eyebrow mt-8">{t('register.kicker')}</p>
              <h1 className="event-title mt-5 text-[clamp(3.4rem,11vw,7.8rem)]">
                “{t('register.heroTitle')}”
              </h1>
              <p className="mt-4 text-lg font-light uppercase tracking-[0.34em] text-[#D8F3FF] sm:text-2xl">
                Fundraiser Exhibition
              </p>
            </div>

            <div className="flex flex-col justify-between gap-10 text-left lg:text-right">
              <div>
                <p className="text-lg font-light text-[#F4F7FA]">Brought to you by</p>
                <p className="mt-2 text-2xl font-black uppercase leading-tight tracking-wide">
                  Gifted Grads<br />
                  Westborn Collectives
                </p>
              </div>
              <div className="space-y-3 text-base font-semibold text-[#F4F7FA]">
                <p>Panel in Collaboration w/ Burgundy.XYZ @ 4pm</p>
                <p>Art Exhibition Opening @ 5:30pm</p>
              </div>
            </div>
          </div>
        </section>

        <section id="registration" className="relative mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.56fr)]">
          <div className="absolute -right-24 top-12 h-80 w-80 rounded-full bg-[#6EC6E8]/10 blur-3xl" />
          <div className="glass-card relative flex flex-col p-5 sm:p-7 lg:p-8">
            <div className="mb-6 border-b border-white/10 pb-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Registration</p>
                  <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-normal text-white sm:text-5xl">
                    {t('register.formTitle')}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8FA9C4]">
                    {t('register.formSubtitle')}
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-300/30 bg-accent-300/[0.12] px-3 py-1.5 text-xs font-semibold text-accent-200">
                  <GiftIcon className="h-4 w-4" />
                  {t('register.formPill')}
                </div>
              </div>
            </div>
            <JotformEmbed />
            <div className="mt-auto pt-6">
              <div className="rounded-2xl border border-[#6EC6E8]/[0.18] bg-[#6EC6E8]/[0.08] px-4 py-3 text-sm leading-6 text-slate-200">
                <div className="mb-1 flex items-center gap-2 font-semibold text-white">
                  <InfoIcon />
                  {t('register.disclaimer.title')}
                </div>
                <p>{t('register.disclaimer.body')}</p>
              </div>
            </div>
          </div>

          <aside className="relative overflow-hidden border-y border-white/[0.12] bg-black/[0.24] px-2 py-6 text-white lg:sticky lg:top-24">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_70%_20%,rgba(247,201,72,0.16),transparent_24%)]" />
            <div className="relative space-y-6">
              <div className="px-4">
                <p className="eyebrow">Raffle Pass</p>
                <p className="mt-3 text-3xl font-black uppercase leading-tight">
                  {t('register.giveaway.highlight')}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#8FA9C4]">
                  {t('register.sidebar.note')}
                </p>
              </div>
              <div className="mx-4 rounded-[2rem] border border-white/[0.12] bg-white/[0.08] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-200">
                    iPad raffle
                  </span>
                  <GiftIcon className="h-5 w-5 text-accent-300" />
                </div>
                <div className="mt-8 flex justify-center">
                  <IpadIllustration className="h-28 w-auto" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
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
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function SilhouetteStrip() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] hidden h-64 items-end justify-center gap-4 opacity-70 sm:flex">
      <div className="h-32 w-28 rounded-t-full bg-black/[0.72] blur-[0.5px]" />
      <div className="mb-4 h-44 w-14 rotate-[-18deg] rounded-full bg-black/80 blur-[0.5px]" />
      <div className="h-40 w-24 rounded-t-full bg-black/[0.76] blur-[0.5px]" />
      <div className="mb-2 h-52 w-16 rotate-[16deg] rounded-full bg-black/[0.82] blur-[0.5px]" />
      <div className="h-36 w-28 rounded-t-full bg-black/[0.74] blur-[0.5px]" />
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
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#6EC6E8]/[0.12] text-[#BDEEFF] ring-1 ring-[#6EC6E8]/[0.18]">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <p className="text-sm leading-6 text-[#8FA9C4]">{children}</p>
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
      <rect x="22" y="6" width="76" height="62" rx="6" fill="#1e3a5f" />
      <rect x="26" y="10" width="68" height="54" rx="3" fill="#5b9bd5" />
      <path d="M26 38 Q 60 18 94 38 L 94 64 L 26 64 Z" fill="#7eb1dc" />
      <circle cx="86" cy="20" r="3" fill="#f5c518" />
      <rect x="14" y="68" width="92" height="6" rx="3" fill="#dfe7ef" />
      <rect x="22" y="74" width="76" height="3" rx="1.5" fill="#cfd8e3" />
    </svg>
  );
}
