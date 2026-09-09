import type { HTMLAttributes } from 'react';

export type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  value: number;
  label: string;
  showValue?: boolean;
  trackClassName?: string;
  fillClassName?: string;
  valueClassName?: string;
};

export function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  trackClassName = '',
  fillClassName = '',
  valueClassName = '',
  ...props
}: ProgressBarProps) {
  const clamped = clampProgress(value);
  const valueLabel = `${Math.round(clamped)}%`;

  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped} aria-label={label} {...props}>
      <div className={trackClassName}>
        <div className={fillClassName} style={{ width: `${clamped}%` }} />
      </div>
      {showValue ? <span className={valueClassName} aria-hidden>{valueLabel}</span> : null}
    </div>
  );
}
