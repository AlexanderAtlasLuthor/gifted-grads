import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../i18n/I18nProvider';
import { api } from '../lib/api';
import { POLL_INTERVAL_MS, queryKeys } from '../lib/queryKeys';
import { formatCurrency, formatDateTime } from '../lib/format';
import { Spinner } from './Spinner';
import { ErrorBanner } from './ErrorBanner';

export function DonationProgress() {
  const { t, locale } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.donationSummary,
    queryFn: () => api.donationSummary(),
    refetchInterval: POLL_INTERVAL_MS,
  });

  if (isLoading) {
    return (
      <div className="card p-6 text-center text-ink-100/80">
        <Spinner /> <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorBanner message={t('common.error')} />;
  }

  const pct = data.goalCents > 0
    ? Math.min(100, (data.totalCents / data.goalCents) * 100)
    : 0;
  const remaining = Math.max(0, data.goalCents - data.totalCents);
  const intlLocale = locale === 'es' ? 'es' : 'en-US';

  return (
    <div className="card grain-on relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-300/20 blur-3xl" />

      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-[0.35em] text-ink-200/70">
            {t('donate.dashboard.eyebrow')}
          </span>
          <div className="mt-2 font-display text-4xl text-white sm:text-5xl">
            {formatCurrency(data.totalCents, data.currency, intlLocale)}
          </div>
          <div className="mt-1 text-sm text-ink-100/70">
            {t('donate.dashboard.ofGoal', {
              goal: formatCurrency(data.goalCents, data.currency, intlLocale),
            })}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-accent-300">
            {pct.toFixed(0)}%
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
            {data.count}{' '}
            {data.count === 1
              ? t('donate.dashboard.donation')
              : t('donate.dashboard.donations')}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-200 transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="relative mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
        <span>{formatCurrency(0, data.currency, intlLocale)}</span>
        {remaining > 0 ? (
          <span className="text-ink-100/70">
            {t('donate.dashboard.remaining', {
              amount: formatCurrency(remaining, data.currency, intlLocale),
            })}
          </span>
        ) : (
          <span className="text-accent-300">
            {t('donate.dashboard.goalReached')}
          </span>
        )}
        <span>{formatCurrency(data.goalCents, data.currency, intlLocale)}</span>
      </div>

      {/* Recent activity */}
      <div className="relative mt-6">
        <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
          {t('donate.dashboard.recent')}
        </div>
        {data.recent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-sm text-ink-200/60">
            {t('donate.dashboard.empty')}
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {data.recent.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">
                    {d.donorName || t('donate.dashboard.anonymous')}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-ink-200/60">
                    {formatDateTime(
                      d.succeededAt ?? d.createdAt,
                      intlLocale,
                    )}
                  </div>
                </div>
                <div className="font-display text-base text-accent-300">
                  {formatCurrency(d.amountCents, d.currency, intlLocale)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
