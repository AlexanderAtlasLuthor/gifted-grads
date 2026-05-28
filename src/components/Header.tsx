import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { LanguageToggle } from './LanguageToggle';
import { Logo } from './Logo';
import { RegistrationQrButton } from './RegistrationQrModal';
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
    <header
      className="glass-rail grain-on sticky top-0 z-30 border-b"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <Link to="/" className="flex min-w-0 items-center" aria-label="Born Gifted · Gifted Grads">
          <Logo compactOnMobile />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <RegistrationQrButton />
          {onManager && authed && (
            <button
              type="button"
              onClick={logout}
              className="btn-secondary px-3 text-xs sm:px-5"
            >
              {t('nav.logout')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
