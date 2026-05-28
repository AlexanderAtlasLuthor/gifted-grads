import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useTranslation } from '../i18n/I18nProvider';
import { Bolt } from './decorations';

export function RegistrationQrButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn-secondary px-3 text-xs uppercase tracking-widest sm:px-4"
        onClick={() => setOpen(true)}
        aria-label={t('qr.open')}
      >
        QR
      </button>

      {open ? <RegistrationQrModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function RegistrationQrModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [qrSrc, setQrSrc] = useState('');
  const registrationUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'https://gifted-grads-events.pages.dev/#registration';
    }
    return `${window.location.origin}/#registration`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(registrationUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: {
        dark: '#07111f',
        light: '#ffffff',
      },
    }).then((src) => {
      if (!cancelled) setQrSrc(src);
    });
    return () => {
      cancelled = true;
    };
  }, [registrationUrl]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-950/90 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-qr-title"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-ink-950 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-ink-900 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          onClick={onClose}
          aria-label={t('qr.close')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>

        <div className="border-b border-white/10 bg-ink-950 px-5 pb-3 pt-4 pr-14">
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-accent-300">
            <Bolt className="h-3.5 w-3.5" />
            Born Gifted
          </div>
          <h2
            id="registration-qr-title"
            className="mt-1 font-display text-xl uppercase tracking-wide text-white"
          >
            {t('qr.title')}
          </h2>
        </div>

        <div className="bg-ink-950 px-5 pb-4 pt-4">
          <div className="mx-auto w-full max-w-[220px] rounded-2xl bg-white p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
            {qrSrc ? (
              <img
                src={qrSrc}
                alt={t('qr.imageAlt')}
                className="aspect-square w-full rounded-xl"
                draggable={false}
              />
            ) : (
              <div className="grid aspect-square w-full place-items-center rounded-xl bg-ink-50 text-sm font-semibold text-ink-950">
                {t('qr.loading')}
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-xs leading-5 text-ink-100/80">
            {t('qr.subtitle')}
          </p>
          <a
            href={registrationUrl}
            className="mt-3 block truncate rounded-xl border border-white/10 bg-ink-900 px-4 py-2 text-center text-[11px] font-semibold text-sky-200 transition hover:bg-white/10"
          >
            {registrationUrl}
          </a>
          <button
            type="button"
            className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/10"
            onClick={onClose}
          >
            {t('qr.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
