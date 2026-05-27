import { useTranslation } from '../i18n/I18nProvider';
import { JotformEmbed } from '../components/JotformEmbed';
import { PaperPlane, SunBurst, CloudPuff } from '../components/decorations';

export function RegisterPage() {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden">
      <SunBurst className="absolute -right-24 -top-24 h-96 w-96" />
      <CloudPuff className="absolute left-1/3 top-32 hidden h-24 w-40 opacity-70 lg:block" />
      <PaperPlane className="absolute right-[28%] top-12 hidden h-36 w-72 lg:block" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {t('register.title.line1')}
              <br />
              <span className="accent-underline text-brand-500">
                {t('register.title.line2')}
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base text-slate-600">
              {t('register.subtitle')}
            </p>

            <div className="card-lg mt-8 p-6 sm:p-7">
              <div className="mb-5 flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <UserIcon />
                </div>
                <h2 className="text-base font-semibold text-slate-800">
                  {t('register.formTitle')}
                </h2>
              </div>
              <JotformEmbed />
            </div>
          </div>

          <aside className="space-y-6">
            <GiveawayCard />
            <FeatureRow icon={<BoltIcon />} title={t('register.feature.instant.title')}>
              {t('register.feature.instant.body')}
            </FeatureRow>
            <FeatureRow icon={<LockIcon />} title={t('register.feature.secure.title')}>
              {t('register.feature.secure.body')}
            </FeatureRow>
            <FeatureRow icon={<TeamIcon />} title={t('register.feature.team.title')}>
              {t('register.feature.team.body')}
            </FeatureRow>
          </aside>
        </div>
      </div>
    </div>
  );
}

function GiveawayCard() {
  const { t } = useTranslation();
  return (
    <div className="card-lg relative overflow-hidden p-6">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent-200/60 blur-2xl" />
      <div className="relative flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-sm">
          <GiftIcon />
        </div>
        <div className="text-base leading-relaxed text-slate-800">
          {t('register.giveaway.lead')}{' '}
          <span className="font-semibold text-brand-700">
            {t('register.giveaway.highlight')}
          </span>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <IpadIllustration className="h-24 w-auto" />
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-1">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-slate-800">{title}</div>
        <p className="text-sm text-slate-600">{children}</p>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent-500" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M3 12h18M12 8v13M8 8c0-2 1.5-4 4-4 2.5 0 4 2 4 4M8 8c-2 0-3-1-3-2.5S6 3 7.5 3c2 0 4.5 3 4.5 5" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5M14 20c0-2 2-4 4-4s4 2 4 4" />
    </svg>
  );
}
function IpadIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
      <rect x="22" y="6" width="76" height="62" rx="6" fill="#1e3a5f" />
      <rect x="26" y="10" width="68" height="54" rx="3" fill="#5b9bd5" />
      <path d="M26 38 Q 60 18 94 38 L 94 64 L 26 64 Z" fill="#7eb1dc" />
      <circle cx="86" cy="20" r="3" fill="#f5c518" />
      <rect x="14" y="68" width="92" height="6" rx="3" fill="#dfe7ef" />
      <rect x="22" y="74" width="76" height="3" rx="1.5" fill="#cfd8e3" />
    </svg>
  );
}
