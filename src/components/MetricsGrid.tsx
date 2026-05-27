import { useTranslation } from '../i18n/I18nProvider';
import { useMetrics } from '../hooks/useMetrics';
import { MetricCard } from './MetricCard';
import { Spinner } from './Spinner';
import { ErrorBanner } from './ErrorBanner';
import { formatPercent } from '../lib/format';
import type { CategoryCount } from '@shared/types';

function BarRow({
  label,
  count,
  percent,
}: {
  label: string;
  count: number;
  percent: number;
}) {
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between">
        <span className="truncate pr-2 text-slate-700">{label}</span>
        <span className="font-medium text-slate-900 whitespace-nowrap">
          {count} · {formatPercent(percent)}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

function CategoryList({
  items,
  emptyLabel,
  labelFor = (key) => key,
}: {
  items: CategoryCount[];
  emptyLabel: string;
  labelFor?: (key: string) => string;
}) {
  if (items.length === 0) {
    return <div className="text-xs text-slate-500">{emptyLabel}</div>;
  }
  return (
    <div className="space-y-2">
      {items.slice(0, 5).map((c) => (
        <BarRow key={c.key} label={labelFor(c.key)} count={c.count} percent={c.percent} />
      ))}
    </div>
  );
}

export function MetricsGrid() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <Spinner />
        <span>{t('common.loading')}</span>
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorBanner message={t('common.error')} />;
  }

  const generos = (['M', 'F', 'OTRO', 'PREFIERO_NO_DECIR'] as const).filter(
    (k) => data.byGenero[k] > 0,
  );
  const updatedTime = new Date(data.updatedAt).toLocaleTimeString();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label={t('dashboard.metric.total')}
        value={data.total}
        hint={t('dashboard.metric.updatedAt', { time: updatedTime })}
      />
      <MetricCard
        label={t('dashboard.metric.promedioEdad')}
        value={data.promedioEdad.toFixed(1)}
      />
      <MetricCard label={t('dashboard.metric.genero')}>
        <div className="space-y-2">
          {generos.length === 0 && (
            <div className="text-xs text-slate-500">—</div>
          )}
          {generos.map((g) => (
            <BarRow
              key={g}
              label={t(`genero.${g}`)}
              count={data.byGenero[g]}
              percent={data.generoPercent[g]}
            />
          ))}
        </div>
      </MetricCard>
      <MetricCard label={t('dashboard.metric.nivel')}>
        <CategoryList
          items={data.byNivel}
          emptyLabel="—"
          labelFor={(key) => t(`nivel.${key}`)}
        />
      </MetricCard>
      <MetricCard
        className="md:col-span-2"
        label={t('dashboard.metric.carrera')}
      >
        <CategoryList items={data.byCarrera} emptyLabel="—" />
      </MetricCard>
      <MetricCard
        className="md:col-span-2"
        label={t('dashboard.metric.institucion')}
      >
        <CategoryList items={data.byInstitucion} emptyLabel="—" />
      </MetricCard>
    </div>
  );
}
