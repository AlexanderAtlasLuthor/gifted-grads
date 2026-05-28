import clsx from 'clsx';

export function ErrorBanner({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={clsx(
        'rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur',
        className,
      )}
    >
      {message}
    </div>
  );
}
