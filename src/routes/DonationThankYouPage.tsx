import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../i18n/I18nProvider';
import { api, ApiError } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { formatCurrency } from '../lib/format';
import { Bolt, Sparkle } from '../components/decorations';
import { Spinner } from '../components/Spinner';

export function DonationThankYouPage() {
  const { t, locale } = useTranslation();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  const query = useQuery({
    queryKey: queryKeys.donationBySession(sessionId ?? ''),
    queryFn: () => api.getDonationBySession(sessionId as string),
    enabled: !!sessionId,
    refetchInterval: (q) => {
      const data = q.state.data;
      // Stripe webhooks usually land within a few seconds. Keep polling
      // until the donation flips from "pending" → "succeeded".
      if (!data) return 1500;
      return data.status === 'pending' ? 1500 : false;
    },
    retry: (failureCount, err) => {
      // 404 happens right after the redirect if the session row hasn't
      // been written yet — keep retrying briefly.
      if (err instanceof ApiError && err.code === 'NOT_FOUND') return failureCount < 10;
      return failureCount < 2;
    },
  });

  const succeeded = query.data?.status === 'succeeded';
  const pending = !!sessionId && (query.isLoading || query.data?.status === 'pending');

  return (
    <div className="event-shell min-h-full">
      <img
        src="/register-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] w-full object-cover opacity-30"
      />
      <div className="pointer-events-none absolute inset-x-0 top-[20rem] h-32 bg-gradient-to-b from-transparent to-ink-950" />

      <div className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="card-lg grain-on relative overflow-hidden p-8 text-center">
          <Sparkle className="absolute left-6 top-6 h-5 w-5 text-accent-300/80" />
          <Sparkle className="absolute right-8 top-10 h-4 w-4 text-accent-300/60 [animation-delay:600ms]" />
          <Sparkle className="absolute bottom-10 left-10 h-4 w-4 text-accent-300/50 [animation-delay:1100ms]" />

          <span className="pill-accent">
            <Bolt className="h-3.5 w-3.5" />
            BORN GIFTED
          </span>

          {pending && (
            <>
              <Spinner className="mt-8 h-8 w-8 text-accent-300" />
              <h1 className="event-title mt-6 text-3xl sm:text-4xl">
                {t('donate.thanks.processing')}
              </h1>
              <p className="mt-4 text-ink-100/80">
                {t('donate.thanks.processingBody')}
              </p>
            </>
          )}

          {!pending && succeeded && query.data && (
            <>
              <div className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-cardLg">
                <CheckIcon />
              </div>
              <h1 className="event-title mt-6 text-3xl sm:text-4xl">
                {t('donate.thanks.title')}
              </h1>
              <p className="mt-3 text-lg leading-7 text-ink-100/85">
                {query.data.donorName
                  ? t('donate.thanks.bodyWithName', { name: query.data.donorName })
                  : t('donate.thanks.body')}
              </p>
              <div className="mx-auto mt-6 inline-flex items-baseline gap-2 rounded-2xl border border-accent-300/40 bg-accent-300/10 px-6 py-3">
                <span className="text-xs uppercase tracking-[0.3em] text-accent-200/80">
                  {t('donate.thanks.amount')}
                </span>
                <span className="font-display text-3xl text-accent-100">
                  {formatCurrency(
                    query.data.amountCents,
                    query.data.currency,
                    locale === 'es' ? 'es' : 'en-US',
                  )}
                </span>
              </div>
              <p className="mt-6 text-sm text-ink-200/70">
                {t('donate.thanks.receipt')}
              </p>
            </>
          )}

          {!sessionId && (
            <>
              <h1 className="event-title mt-8 text-3xl sm:text-4xl">
                {t('donate.thanks.title')}
              </h1>
              <p className="mt-4 text-ink-100/80">
                {t('donate.thanks.body')}
              </p>
            </>
          )}

          <Link
            to="/"
            className="btn-secondary mt-10 inline-flex py-3 px-6 text-sm uppercase tracking-widest"
          >
            {t('confirmation.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
