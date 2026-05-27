import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t('register.title')}
        </h1>
        <p className="mt-2 text-slate-600">{t('register.subtitle')}</p>
      </div>
      <div className="card p-6">
        <RegisterForm />
      </div>
      <div className="mt-6 text-right text-xs text-slate-400">
        <Link to="/manager/login" className="hover:text-slate-600">
          {t('nav.manager')} →
        </Link>
      </div>
    </div>
  );
}
