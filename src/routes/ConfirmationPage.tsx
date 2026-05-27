import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { formatParticipantNumber } from '../lib/format';

interface ConfirmationState {
  participantNumber?: number;
  nombre?: string;
}

export function ConfirmationPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const state = (location.state as ConfirmationState | null) ?? {};
  const fromQuery = new URLSearchParams(location.search).get('n');
  const participantNumber =
    state.participantNumber ?? (fromQuery ? Number(fromQuery) : null);

  if (!participantNumber || !Number.isFinite(participantNumber)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="card p-8 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {t('confirmation.title')}
        </h1>
        <p className="mt-1 text-slate-600">{t('confirmation.subtitle')}</p>
        <div className="mt-8 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 p-6">
          <div className="text-xs uppercase tracking-wide text-brand-700">
            {t('confirmation.numberLabel')}
          </div>
          <div className="mt-1 font-mono text-6xl font-extrabold text-brand-700">
            #{formatParticipantNumber(participantNumber)}
          </div>
          {state.nombre && (
            <div className="mt-2 text-sm text-slate-600">{state.nombre}</div>
          )}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          {t('confirmation.notice')}
        </p>
        <Link to="/" className="btn-secondary mt-6 inline-flex">
          {t('confirmation.registerAnother')}
        </Link>
      </div>
    </div>
  );
}
