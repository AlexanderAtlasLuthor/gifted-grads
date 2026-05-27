import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { LanguageToggle } from './LanguageToggle';
import { clearToken, isAuthenticated } from '../lib/auth';

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const onManager = location.pathname.startsWith('/manager');
  const authed = isAuthenticated();

  function logout() {
    clearToken();
    navigate('/manager/login');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white font-bold">
            GG
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">
              {t('app.title')}
            </div>
            <div className="text-xs text-slate-500">{t('app.tagline')}</div>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          {onManager && authed && (
            <button type="button" onClick={logout} className="btn-secondary text-xs">
              {t('nav.logout')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
