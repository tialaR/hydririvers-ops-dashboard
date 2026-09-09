import type { HTMLAttributes } from 'react';
import { ProgressBar as CoreProgressBar } from '@/shared/design-system/core/progress-bar';
import styles from './progress-bar.module.scss';

export type ProgressBarTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  value: number; label: string; tone?: ProgressBarTone; showValue?: boolean;
};

export function ProgressBar({ value, label, tone = 'accent', showValue = false, className = '', ...props }: ProgressBarProps) {
  return (
    <CoreProgressBar
      value={value}
      label={label}
      showValue={showValue}
      className={`${styles.root} ${className}`.trim()}
      trackClassName={styles.track}
      fillClassName={`${styles.fill} ${styles[`tone_${tone}`]}`}
      valueClassName={styles.value}
      {...props}
    />
  );
}
