import type { HTMLAttributes } from 'react';

import styles from './progress-bar.module.scss';

export type ProgressBarTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  value: number;
  label: string;
  tone?: ProgressBarTone;
  showValue?: boolean;
};

function clampProgress(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

export function ProgressBar({
  value,
  label,
  tone = 'accent',
  showValue = false,
  className = '',
  ...props
}: ProgressBarProps) {
  const clamped = clampProgress(value);
  const valueLabel = `${Math.round(clamped)}%`;

  return (
    <div
      className={`${styles.root} ${className}`.trim()}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
      {...props}
    >
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[`tone_${tone}`]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showValue ? (
        <span className={styles.value} aria-hidden>
          {valueLabel}
        </span>
      ) : null}
    </div>
  );
}
