import { useEffect } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import { formatDateTime, formatParticipantNumber } from '../lib/format';
import type { Attendee } from '@shared/types';

export function AttendeeDetailModal({
  attendee,
  onClose,
}: {
  attendee: Attendee;
  onClose: () => void;
}) {
  const { t, locale } = useTranslation();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows: Array<[string, string]> = [
    [t('register.field.nombre'), attendee.nombre],
    [t('register.field.email'), attendee.email],
    [t('register.field.telefono'), attendee.telefono],
    [t('register.field.insuranceType'), t(`insurance.${attendee.insuranceType}`)],
    [t('dashboard.table.createdAt'), formatDateTime(attendee.createdAt, locale)],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 p-4 backdrop-blur-md sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="card-lg grain-on w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-ink-200/70">
              {t('detail.title')}
            </div>
            <div className="mt-1 font-display text-3xl text-accent-300">
              #{formatParticipantNumber(attendee.participantNumber)}
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost text-xs uppercase tracking-widest"
            onClick={onClose}
          >
            {t('detail.close')}
          </button>
        </div>
        <dl className="divide-y divide-white/5 px-5">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 gap-2 py-3 text-sm">
              <dt className="text-[10px] uppercase tracking-[0.3em] text-ink-200/60">
                {label}
              </dt>
              <dd className="col-span-2 font-medium text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="p-4" />
      </div>
    </div>
  );
}
