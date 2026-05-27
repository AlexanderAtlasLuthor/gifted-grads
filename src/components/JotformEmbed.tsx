import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import { RegisterForm } from './RegisterForm';
import { ErrorBanner } from './ErrorBanner';
import { Spinner } from './Spinner';

const HANDLER_SRC = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

declare global {
  interface Window {
    jotformEmbedHandler?: (selector: string, origin: string) => void;
  }
}

let handlerScriptPromise: Promise<void> | null = null;

function loadHandlerScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.jotformEmbedHandler) return Promise.resolve();
  if (handlerScriptPromise) return handlerScriptPromise;
  handlerScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${HANDLER_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Jotform handler')));
      return;
    }
    const script = document.createElement('script');
    script.src = HANDLER_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Jotform handler'));
    document.head.appendChild(script);
  });
  return handlerScriptPromise;
}

export function JotformEmbed() {
  const { locale } = useTranslation();
  const formId =
    locale === 'en'
      ? (import.meta.env.VITE_JOTFORM_FORM_ID_EN ?? '')
      : (import.meta.env.VITE_JOTFORM_FORM_ID_ES ?? '');

  // In mock mode we render the legacy custom form so devs can exercise
  // the full register → confirmation flow without touching Jotform.
  if (USE_MOCK) {
    return <RegisterForm />;
  }

  if (!formId) {
    return (
      <ErrorBanner
        message={
          locale === 'en'
            ? 'Jotform Form ID is not configured. Set VITE_JOTFORM_FORM_ID_EN.'
            : 'Falta configurar el Form ID de Jotform. Define VITE_JOTFORM_FORM_ID_ES.'
        }
      />
    );
  }

  return <JotformIframe formId={formId} />;
}

function JotformIframe({ formId }: { formId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');
    let cancelled = false;
    loadHandlerScript()
      .then(() => {
        if (cancelled) return;
        try {
          window.jotformEmbedHandler?.(
            `iframe[id="JotFormIFrame-${formId}"]`,
            'https://form.jotform.com/',
          );
        } catch {
          /* handler attaches via querySelector; ignore */
        }
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [formId]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-slate-500">
          <Spinner />
        </div>
      )}
      {status === 'error' && (
        <div className="p-4">
          <ErrorBanner message="No se pudo cargar el formulario. Intenta recargar la página." />
        </div>
      )}
      <iframe
        ref={iframeRef}
        id={`JotFormIFrame-${formId}`}
        title="Gifted Grads registration form"
        src={`https://form.jotform.com/${formId}`}
        allow="geolocation; microphone; camera; fullscreen"
        allowFullScreen
        scrolling="no"
        frameBorder={0}
        style={{ minHeight: '720px', width: '100%', border: 'none' }}
        onLoad={() => setStatus('ready')}
      />
    </div>
  );
}
