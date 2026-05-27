import type { ReactNode } from 'react';
import clsx from 'clsx';

export function MetricCard({
  label,
  value,
  hint,
  children,
  className,
}: {
  label: string;
  value?: ReactNode;
  hint?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('card grain-on relative overflow-hidden p-5', className)}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-ink-200/70">
        {label}
      </div>
      {value !== undefined && (
        <div className="mt-2 font-display text-4xl text-white">{value}</div>
      )}
      {hint && (
        <div className="mt-1 text-[11px] uppercase tracking-widest text-ink-200/60">
          {hint}
        </div>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
