import { useTranslation } from '../i18n/I18nProvider';
import { MetricsGrid } from '../components/MetricsGrid';
import { AttendeeTable } from '../components/AttendeeTable';
import { RafflePanel } from '../components/RafflePanel';

export function ManagerDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="event-shell min-h-full">
      <div className="event-sphere -right-32 top-10 h-80 w-80 opacity-40 lg:right-[6%] lg:h-[30rem] lg:w-[30rem]" />
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <header>
        <p className="eyebrow">{t('dashboard.kicker')}</p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-tight tracking-normal text-white sm:text-6xl">
          {t('dashboard.title')}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">{t('dashboard.subtitle')}</p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8FA9C4]">
          {t('dashboard.section.metrics')}
        </h2>
        <MetricsGrid />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8FA9C4]">
          {t('dashboard.section.raffle')}
        </h2>
        <RafflePanel />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8FA9C4]">
          {t('dashboard.section.attendees')}
        </h2>
        <AttendeeTable />
      </section>
      </div>
    </div>
  );
}
