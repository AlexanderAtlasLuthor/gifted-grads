import { useTranslation } from '../i18n/I18nProvider';
import { MetricsGrid } from '../components/MetricsGrid';
import { AttendeeTable } from '../components/AttendeeTable';
import { RafflePanel } from '../components/RafflePanel';

export function ManagerDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t('dashboard.title')}
        </h1>
        <p className="mt-1 text-slate-600">{t('dashboard.subtitle')}</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('dashboard.section.metrics')}
        </h2>
        <MetricsGrid />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('dashboard.section.raffle')}
        </h2>
        <RafflePanel />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('dashboard.section.attendees')}
        </h2>
        <AttendeeTable />
      </section>
    </div>
  );
}
