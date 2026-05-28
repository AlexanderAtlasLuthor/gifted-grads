import { useState } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import { useDrawRaffle } from '../hooks/useDrawRaffle';
import { useCurrentWinner } from '../hooks/useCurrentWinner';
import { ApiError } from '../lib/api';
import { ErrorBanner } from './ErrorBanner';
import { Spinner } from './Spinner';
import { formatDateTime, formatParticipantNumber } from '../lib/format';
import type { Attendee, RaffleDrawResponse } from '@shared/types';

export function RafflePanel() {
  const { t, locale } = useTranslation();
  const drawMutation = useDrawRaffle();
  const currentQuery = useCurrentWinner();
  const [mode, setMode] = useState<'idle' | 'manual'>('idle');
  const [manualNumber, setManualNumber] = useState('');
  const [lastResult, setLastResult] = useState<RaffleDrawResponse | null>(null);

  async function drawRandom() {
    if (displayed && !window.confirm(t('raffle.confirm.redraw'))) return;
    setLastResult(null);
    try {
      const res = await drawMutation.mutateAsync({ mode: 'random' });
      setLastResult(res);
    } catch {
      /* error rendered below */
    }
  }

  async function drawManual() {
    const n = Number(manualNumber);
    if (!Number.isInteger(n) || n <= 0) return;
    if (!window.confirm(t('raffle.confirm.manual', { number: n }))) return;
    setLastResult(null);
    try {
      const res = await drawMutation.mutateAsync({
        mode: 'manual',
        participantNumber: n,
      });
      setLastResult(res);
      setMode('idle');
      setManualNumber('');
    } catch {
      /* error rendered below */
    }
  }

  const errorMessage = (() => {
    if (!drawMutation.isError) return null;
    const err = drawMutation.error;
    if (err instanceof ApiError) {
      if (err.code === 'WINNER_NOT_FOUND') return t('raffle.error.notFound');
      if (err.code === 'NO_ATTENDEES') return t('raffle.error.empty');
      if (err.code === 'RAFFLE_ALREADY_DRAWN') return t('raffle.error.alreadyDrawn');
    }
    return t('raffle.error.generic');
  })();

  const displayed: { winner: Attendee; drawnAt: string; emailSent?: boolean } | null =
    lastResult ?? currentQuery.data ?? null;

  return (
    <div className="card grain-on relative overflow-hidden p-6 space-y-5">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent-400/15 blur-3xl" />
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl uppercase tracking-wider text-white">
          {t('dashboard.section.raffle')}
        </h3>
        {displayed && (
          <span className="text-[10px] uppercase tracking-[0.3em] text-ink-200/70">
            {t('raffle.previous')} · {formatDateTime(displayed.drawnAt, locale)}
          </span>
        )}
      </div>

      {errorMessage && <ErrorBanner message={errorMessage} />}

      {displayed && (
        <div className="relative rounded-2xl border border-accent-400/30 bg-accent-400/[0.07] p-5">
          <div className="text-[10px] uppercase tracking-[0.35em] text-accent-300">
            {t('raffle.winner.title')}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
                {t('raffle.winner.number')}
              </div>
              <div className="mt-1 font-display text-3xl text-accent-300">
                #{formatParticipantNumber(displayed.winner.participantNumber)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
                {t('raffle.winner.name')}
              </div>
              <div className="mt-1 font-medium text-white">{displayed.winner.nombre}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
                {t('raffle.winner.email')}
              </div>
              <div className="mt-1 font-medium text-white">{displayed.winner.email}</div>
            </div>
          </div>
          {lastResult && (
            <div className="mt-3 text-xs">
              {lastResult.emailSent ? (
                <span className="text-emerald-300">✓ {t('raffle.winner.emailSent')}</span>
              ) : (
                <span className="text-amber-300">⚠ {t('raffle.winner.emailFailed')}</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          className="btn-primary"
          onClick={drawRandom}
          disabled={drawMutation.isPending}
        >
          {drawMutation.isPending ? (
            <>
              <Spinner /> {t('raffle.drawing')}
            </>
          ) : displayed ? (
            t('raffle.drawAgain')
          ) : (
            t('raffle.draw.random')
          )}
        </button>

        {mode === 'idle' ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setMode('manual')}
            disabled={drawMutation.isPending}
          >
            {t('raffle.draw.manual')}
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              className="input w-40"
              placeholder={t('raffle.draw.manualPlaceholder')}
              value={manualNumber}
              min={1}
              onChange={(e) => setManualNumber(e.target.value)}
            />
            <button
              type="button"
              className="btn-primary"
              onClick={drawManual}
              disabled={drawMutation.isPending || !manualNumber}
            >
              {t('raffle.draw.confirm')}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setMode('idle');
                setManualNumber('');
              }}
            >
              {t('raffle.cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
