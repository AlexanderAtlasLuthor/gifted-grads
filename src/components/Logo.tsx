import clsx from 'clsx';

export function Logo({
  className,
  showText = true,
  compactOnMobile = false,
}: {
  className?: string;
  showText?: boolean;
  compactOnMobile?: boolean;
}) {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div className="grid place-items-center">
        <img
          src="/logo.png"
          alt="Gifted Grads"
          className="h-9 w-auto"
          draggable={false}
        />
      </div>
      {showText && (
        <div
          className={clsx(
            'flex-col leading-tight',
            compactOnMobile ? 'hidden sm:flex' : 'flex',
          )}
        >
          <span className="font-display text-xs uppercase tracking-widest text-accent-300">
            Born Gifted
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-200/80">
            Gifted Grads · Events
          </span>
        </div>
      )}
    </div>
  );
}
