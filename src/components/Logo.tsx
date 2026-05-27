import clsx from 'clsx';

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <img
        src="/logo.png"
        alt="Gifted Grads"
        className="h-12 w-auto drop-shadow-sm"
        draggable={false}
      />
      {showText && (
        <span className="text-lg font-semibold uppercase tracking-[0.24em] text-slate-100">
          Born Gifted
        </span>
      )}
    </div>
  );
}
