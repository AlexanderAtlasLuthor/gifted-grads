import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useTranslation } from '../i18n/I18nProvider';
import { LanguageToggle } from './LanguageToggle';
import { Logo } from './Logo';
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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx('nav-link', isActive && 'nav-link-active');

  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="Gifted Grads Events">
          <Logo />
        </Link>

        {!onManager && (
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/" className={navLinkClass}>
              {t('nav.register')}
            </NavLink>
            <NavLink to="/manager/login" className={navLinkClass}>
              {t('nav.event')}
            </NavLink>
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          {onManager && authed ? (
            <button
              type="button"
              onClick={logout}
              className="btn-secondary text-xs"
            >
              {t('nav.logout')}
            </button>
          ) : (
            <Link to="/manager/login" className="btn-secondary text-xs">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
