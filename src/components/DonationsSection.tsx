import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from '../i18n/I18nProvider';
import { api, ApiError } from '../lib/api';
import { formatCurrency } from '../lib/format';
import { ErrorBanner } from './ErrorBanner';
import { Spinner } from './Spinner';

const PRESETS_CENTS = [2500, 5000, 10000] as const;
const MIN_CUSTOM_CENTS = 100;
const MAX_CUSTOM_CENTS = 1_000_000;

export function DonationsSection({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useTranslation();
  const [selected, setSelected] = useState<number | 'custom'>(5000);
  const [customDollars, setCustomDollars] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  const mutation = useMutation({
    mutationFn: (amountCents: number) =>
      api.createDonation({
        amountCents,
        donorName: donorName.trim() || undefined,
        donorEmail: donorEmail.trim() || undefined,
      }),
    onSuccess: (res) => {
      // Hard redirect to Stripe-hosted checkout (or thank-you in mock mode).
      window.location.href = res.checkoutUrl;
    },
  });

  function onDonate() {
    let amountCents: number;
    if (selected === 'custom') {
      const dollars = Number(customDollars);
      if (!Number.isFinite(dollars) || dollars <= 0) return;
      amountCents = Math.round(dollars * 100);
    } else {
      amountCents = selected;
    }
    if (amountCents < MIN_CUSTOM_CENTS || amountCents > MAX_CUSTOM_CENTS) return;
    mutation.mutate(amountCents);
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.code === 'VALIDATION_ERROR'
        ? t('donate.error.invalid')
        : mutation.error.code === 'STRIPE_ERROR'
          ? t('donate.error.stripe')
          : t('donate.error.generic')
      : mutation.isError
        ? t('donate.error.generic')
        : null;

  const submitDisabled =
    mutation.isPending ||
    (selected === 'custom' &&
      (!customDollars ||
        Number(customDollars) <= 0 ||
        Number(customDollars) > 10_000));

  return (
    <section
      id="donate"
      className="glass-card grain-on relative scroll-mt-24 overflow-hidden p-6 sm:p-7 lg:p-8"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-300/10 blur-3xl" />
      <div className="relative">
        <span className="eyebrow text-accent-300">{t('donate.eyebrow')}</span>
        <h3
          className={
            compact
              ? 'event-title mt-3 text-2xl sm:text-3xl'
              : 'event-title mt-3 text-3xl sm:text-4xl'
          }
        >
          {t('donate.headline')}
        </h3>
        {!compact && (
          <p className="mt-3 max-w-md text-sm leading-6 text-ink-100/80">
            {t('donate.subtitle')}
          </p>
        )}
      </div>

      {errorMessage && <ErrorBanner className="mt-5" message={errorMessage} />}

      {/* Preset chips */}
      <div className="relative mt-6 grid grid-cols-3 gap-2">
        {PRESETS_CENTS.map((cents) => {
          const active = selected === cents;
          return (
            <button
              key={cents}
              type="button"
              onClick={() => setSelected(cents)}
              className={
                'rounded-xl border px-3 py-3 text-center font-display text-lg uppercase tracking-wider transition ' +
                (active
                  ? 'border-accent-300 bg-accent-300/15 text-accent-100'
                  : 'border-white/15 bg-white/5 text-white hover:border-accent-300/60 hover:bg-white/[0.08]')
              }
            >
              {formatCurrency(cents, 'usd', locale === 'es' ? 'es' : 'en-US')}
            </button>
          );
        })}
      </div>

      {/* Custom amount */}
      <div className="relative mt-3">
        <button
          type="button"
          onClick={() => setSelected('custom')}
          className={
            'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ' +
            (selected === 'custom'
              ? 'border-accent-300 bg-accent-300/10'
              : 'border-white/15 bg-white/5 hover:border-accent-300/60')
          }
          aria-pressed={selected === 'custom'}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-ink-100/80">
            {t('donate.custom')}
          </span>
          <span className="text-ink-100/40">$</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            min={1}
            max={10000}
            step="0.01"
            value={customDollars}
            onChange={(e) => {
              setSelected('custom');
              setCustomDollars(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={() => setSelected('custom')}
            className="w-full bg-transparent text-2xl font-display tracking-tight text-white placeholder:text-ink-100/30 focus:outline-none"
          />
        </button>
      </div>

      {/* Optional donor info */}
      {!compact && (
        <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            className="input h-11 rounded-lg"
            placeholder={t('donate.namePlaceholder')}
            autoComplete="name"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            maxLength={120}
          />
          <input
            type="email"
            className="input h-11 rounded-lg"
            placeholder={t('donate.emailPlaceholder')}
            autoComplete="email"
            inputMode="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            maxLength={160}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onDonate}
        disabled={submitDisabled}
        className="btn-primary mt-5 w-full py-3 text-base"
      >
        {mutation.isPending ? (
          <>
            <Spinner /> {t('donate.processing')}
          </>
        ) : (
          <>
            <HeartIcon /> {t('donate.cta')}
          </>
        )}
      </button>

      <p className="relative mt-3 flex items-center justify-center gap-2 text-center text-[11px] uppercase tracking-[0.2em] text-ink-200/60">
        <LockMiniIcon /> {t('donate.securedByStripe')}
      </p>
    </section>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 21s-7-4.35-9-9.5C1.5 7 5 4 8 4c2 0 3 1 4 2 1-1 2-2 4-2 3 0 6.5 3 5 7.5C19 16.65 12 21 12 21z" />
    </svg>
  );
}
function LockMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}
