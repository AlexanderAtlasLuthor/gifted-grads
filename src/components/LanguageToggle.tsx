import { useTranslation, type Locale } from '../i18n/I18nProvider';
import clsx from 'clsx';

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();
  const options: Locale[] = ['es', 'en'];
  return (
    <div className="inline-flex rounded-lg border border-white/15 bg-white/5 p-0.5 text-xs font-semibold backdrop-blur">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setLocale(opt)}
          className={clsx(
            'px-2.5 py-1 rounded-md uppercase tracking-widest transition',
            locale === opt
              ? 'bg-accent-400 text-ink-950'
              : 'text-ink-100/80 hover:bg-white/10',
          )}
          aria-pressed={locale === opt}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
