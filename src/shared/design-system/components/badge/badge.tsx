import type { ReactNode } from 'react';

import styles from './badge.module.scss';

export type DsBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type DsBadgeDensity = 'default' | 'compact';

export type DsBadgeProps = {
  children: ReactNode;
  tone?: DsBadgeTone;
  density?: DsBadgeDensity;
  className?: string;
};

export function DsBadge({
  children,
  tone = 'neutral',
  density = 'default',
  className = '',
}: DsBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[`tone_${tone}`]} ${styles[`density_${density}`]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
