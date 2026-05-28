import clsx from 'clsx';

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={clsx('flex min-w-0 items-center gap-2 sm:gap-3', className)}>
      <div className="grid shrink-0 place-items-center">
        <img
          src="/logo.png"
          alt="Gifted Grads"
          className="h-9 w-auto"
          draggable={false}
        />
      </div>
      {showText && (
        <div className="flex min-w-0 flex-col leading-tight">
          {/* On mobile the type stays large enough to read at arm's length;
              tracking compresses so "Gifted Grads · Events" still fits next
              to the ES/EN toggle + QR pill on a 390px iPhone. */}
          <span className="font-display text-sm uppercase tracking-[0.1em] text-accent-300 sm:text-xs sm:tracking-widest">
            Born Gifted
          </span>
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-200/80 sm:text-[10px] sm:tracking-[0.3em]">
            Gifted Grads · Events
          </span>
        </div>
      )}
    </div>
  );
}
