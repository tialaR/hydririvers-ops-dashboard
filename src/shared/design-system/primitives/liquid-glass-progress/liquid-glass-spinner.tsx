import type { HTMLAttributes } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-progress.module.scss';

export type LiquidGlassSpinnerTone = 'auto' | 'light' | 'dark';
export type LiquidGlassSpinnerSize = 'sm' | 'md' | 'lg';

/** Opacity gradient per segment (12 o'clock clockwise). */
const SPINNER_SEGMENT_OPACITIES = [1, 0.87, 0.75, 0.63, 0.51, 0.39, 0.27, 0.15] as const;

const SPINNER_SEGMENT_COUNT = SPINNER_SEGMENT_OPACITIES.length;

export type LiquidGlassSpinnerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  size?: LiquidGlassSpinnerSize;
  tone?: LiquidGlassSpinnerTone;
  label?: string;
  showLabel?: boolean;
  className?: string;
};

export function LiquidGlassSpinner({
  size = 'md',
  tone = 'auto',
  label,
  showLabel = false,
  className = '',
  ...props
}: LiquidGlassSpinnerProps) {
  const hasAccessibleLabel = Boolean(label?.trim());
  const classNames = [styles.spinner, className].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      data-tone={tone}
      data-size={size}
      role="status"
      aria-live={hasAccessibleLabel ? 'polite' : undefined}
      aria-label={hasAccessibleLabel ? label : undefined}
      {...props}
    >
      <div className={styles.spinnerWheel} aria-hidden>
        {Array.from({ length: SPINNER_SEGMENT_COUNT }, (_, index) => (
          <span
            key={index}
            className={styles.spinnerSegment}
            style={{
              opacity: SPINNER_SEGMENT_OPACITIES[index],
              transform: `rotate(${index * 45}deg)`,
            }}
          />
        ))}
      </div>
      {showLabel && label ? (
        <span className={styles.spinnerLabel}>{label}</span>
      ) : null}
    </div>
  );
}
