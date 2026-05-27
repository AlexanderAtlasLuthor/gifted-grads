import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import { useAttendees } from '../hooks/useAttendees';
import { formatDateTime, formatParticipantNumber } from '../lib/format';
import { Spinner } from './Spinner';
import { ErrorBanner } from './ErrorBanner';
import { AttendeeDetailModal } from './AttendeeDetailModal';
import type { Attendee } from '@shared/types';

const PAGE_SIZE = 25;

export function AttendeeTable() {
  const { t, locale } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Attendee | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data, isLoading, isError, isPlaceholderData } = useAttendees({
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          className="input sm:max-w-sm"
          placeholder={t('dashboard.search.placeholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {isPlaceholderData && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Spinner /> {t('common.loading')}
          </div>
        )}
      </div>

      {isError && (
        <div className="p-4">
          <ErrorBanner message={t('common.error')} />
        </div>
      )}

      {isLoading ? (
        <div className="p-6 text-center text-slate-500">
          <Spinner /> <span className="ml-2">{t('common.loading')}</span>
        </div>
      ) : data && data.items.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-500">
          {t('dashboard.table.empty')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">{t('dashboard.table.number')}</th>
                <th className="px-4 py-2 text-left">{t('dashboard.table.nombre')}</th>
                <th className="px-4 py-2 text-left">{t('dashboard.table.email')}</th>
                <th className="px-4 py-2 text-left">{t('dashboard.table.institucion')}</th>
                <th className="px-4 py-2 text-left">{t('dashboard.table.carrera')}</th>
                <th className="px-4 py-2 text-left">{t('dashboard.table.createdAt')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.items.map((a) => (
                <tr
                  key={a.id}
                  className="cursor-pointer transition hover:bg-slate-50"
                  onClick={() => setSelected(a)}
                >
                  <td className="px-4 py-2 font-mono text-brand-700">
                    {formatParticipantNumber(a.participantNumber)}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-900">{a.nombre}</td>
                  <td className="px-4 py-2 text-slate-600">{a.email}</td>
                  <td className="px-4 py-2 text-slate-600">{a.institucion}</td>
                  <td className="px-4 py-2 text-slate-600">{a.carrera}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {formatDateTime(a.createdAt, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
          <span>
            {t('dashboard.pagination.info', {
              page,
              totalPages,
              total: data.total,
            })}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary text-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('dashboard.pagination.prev')}
            </button>
            <button
              type="button"
              className="btn-secondary text-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t('dashboard.pagination.next')}
            </button>
          </div>
        </div>
      )}

      {selected && (
        <AttendeeDetailModal
          attendee={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
