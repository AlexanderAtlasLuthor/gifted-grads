import { useTranslation } from '../i18n/I18nProvider';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="glass-rail grain-on relative border-t">
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-[10px] uppercase tracking-[0.28em] text-ink-100/60 sm:flex-row sm:gap-6 sm:px-6 sm:py-5 sm:text-[11px] sm:tracking-[0.32em]">
        <div>
          © {year} ·{' '}
          <span className="text-ink-100/85">{t('footer.brand')}</span>
        </div>
        <div className="text-ink-100/70">
          {t('footer.developedBy')}{' '}
          <span className="text-ink-100/85">Miguel Fuenmayor</span>
        </div>
      </div>
    </footer>
  );
}
