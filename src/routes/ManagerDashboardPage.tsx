import { useTranslation } from '../i18n/I18nProvider';
import { MetricsGrid } from '../components/MetricsGrid';
import { AttendeeTable } from '../components/AttendeeTable';
import { RafflePanel } from '../components/RafflePanel';
import { Bolt } from '../components/decorations';

export function ManagerDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="event-shell min-h-full">
      {/* Supplied dashboard background — silhouettes against clouds. */}
      <img
        src="/manager-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] w-full object-cover opacity-35"
        style={{ objectPosition: '50% 35%' }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-[24rem] h-32 bg-gradient-to-b from-transparent to-ink-950" />

      <div className="relative mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:py-14">
        <header className="flex flex-col gap-3">
          <span className="pill-accent w-fit">
            <Bolt className="h-3.5 w-3.5" />
            Born Gifted · Control Room
          </span>
          <h1 className="event-title text-[clamp(2.5rem,6vw,4.5rem)]">
            {t('dashboard.title')}
          </h1>
          <p className="max-w-2xl text-ink-100/80">{t('dashboard.subtitle')}</p>
        </header>

        <section>
          <SectionTitle>{t('dashboard.section.metrics')}</SectionTitle>
          <MetricsGrid />
        </section>

        <section>
          <SectionTitle>{t('dashboard.section.raffle')}</SectionTitle>
          <RafflePanel />
        </section>

        <section>
          <SectionTitle>{t('dashboard.section.attendees')}</SectionTitle>
          <AttendeeTable />
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
      <h2 className="font-editorial text-[11px] font-semibold uppercase tracking-[0.4em] text-ink-100/70">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-l from-white/15 to-transparent" />
    </div>
  );
}
