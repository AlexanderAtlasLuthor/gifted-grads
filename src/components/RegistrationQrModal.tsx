import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useTranslation } from '../i18n/I18nProvider';
import { Bolt } from './decorations';
import { Logo } from './Logo';

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
      width: 440,
      color: {
        dark: '#07111f',
        light: '#f8fafc',
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/85 p-4 backdrop-blur-md sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-qr-title"
      onClick={onClose}
    >
      <div
        className="card-lg grain-on w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-white/10 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-400/15 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <Logo showText={false} />
              <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-accent-300">
                <Bolt className="h-3.5 w-3.5" />
                Born Gifted
              </div>
              <h2
                id="registration-qr-title"
                className="mt-2 font-display text-3xl uppercase tracking-wide text-white"
              >
                {t('qr.title')}
              </h2>
            </div>
            <button
              type="button"
              className="btn-ghost px-3 py-2 text-xs uppercase tracking-widest"
              onClick={onClose}
            >
              {t('qr.close')}
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-2xl border border-white/10 bg-white p-3 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
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

          <p className="mt-5 text-center text-sm leading-6 text-ink-100/80">
            {t('qr.subtitle')}
          </p>
          <a
            href={registrationUrl}
            className="mt-4 block truncate rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 text-center text-xs font-semibold text-sky-200 transition hover:bg-white/10"
          >
            {registrationUrl}
          </a>
        </div>
      </div>
    </div>
  );
}
