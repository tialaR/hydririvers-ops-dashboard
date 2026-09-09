import type { HTMLAttributes } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-progress.module.scss';

export type LiquidGlassProgressBarTone = 'auto' | 'light' | 'dark';
export type LiquidGlassProgressBarSize = 'sm' | 'md';

export type LiquidGlassProgressBarProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  value: number;
  max?: number;
  tone?: LiquidGlassProgressBarTone;
  size?: LiquidGlassProgressBarSize;
  label?: string;
  showLabel?: boolean;
  className?: string;
  'aria-label'?: string;
};

function clampProgress(value: number, max: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0;
  }

  if (!Number.isFinite(max) || max <= 0) {
    return 0;
  }

  return Math.min(max, Math.max(0, value));
}

export function LiquidGlassProgressBar({
  value,
  max = 100,
  tone = 'auto',
  size = 'md',
  label,
  showLabel = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}: LiquidGlassProgressBarProps) {
  const clamped = clampProgress(value, max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;
  const resolvedAriaLabel = ariaLabel ?? (showLabel && label ? label : undefined);

  const classNames = [styles.progressBar, className].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      data-tone={tone}
      data-size={size}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-label={resolvedAriaLabel}
      {...props}
    >
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      {showLabel && label ? (
        <span className={styles.progressLabel}>{label}</span>
      ) : null}
    </div>
  );
}
