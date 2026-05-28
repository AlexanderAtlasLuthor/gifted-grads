import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { useLogin } from '../hooks/useLogin';
import { ApiError } from '../lib/api';
import { ErrorBanner } from '../components/ErrorBanner';
import { Spinner } from '../components/Spinner';
import { isAuthenticated } from '../lib/auth';

export function ManagerLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const login = useLogin();

  if (isAuthenticated()) {
    return <Navigate to="/manager" replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync(password);
      navigate('/manager', { replace: true });
    } catch {
      /* error rendered below */
    }
  }

  const errorMessage =
    login.error instanceof ApiError && login.error.code === 'INVALID_PASSWORD'
      ? t('login.error')
      : login.error instanceof ApiError && login.error.code === 'RATE_LIMIT'
        ? t('login.error.rateLimit')
        : login.error instanceof ApiError && login.error.status >= 500
          ? t('login.error.config')
      : login.isError
        ? t('login.error.network')
        : null;

  return (
    <div className="event-shell min-h-full overflow-hidden">
      <img
        src="/manager-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-screen w-screen object-cover opacity-55"
        style={{ objectPosition: '50% 50%' }}
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-ink-950/45 via-ink-950/30 to-ink-950/80" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(9,16,31,0.18),rgba(4,8,19,0.84)_78%)]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-md place-items-center px-4 py-12 sm:px-6">
        <div className="glass-card grain-on relative w-full p-8">
          <span className="eyebrow">Manager access</span>
          <h1 className="event-title mt-3 text-3xl">{t('login.title')}</h1>
          <p className="mt-2 text-sm text-ink-100/80">{t('login.subtitle')}</p>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            {errorMessage && <ErrorBanner message={errorMessage} />}
            <div>
              <label htmlFor="password" className="label">
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={login.isPending || !password}
            >
              {login.isPending ? (
                <>
                  <Spinner /> {t('login.submitting')}
                </>
              ) : (
                t('login.submit')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
