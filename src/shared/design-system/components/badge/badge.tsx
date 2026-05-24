import type { ReactNode } from 'react';

import styles from './badge.module.scss';

export type DsBadgeTone = 'neutral' | 'success' | 'warning' | 'info';

export type DsBadgeProps = {
  children: ReactNode;
  tone?: DsBadgeTone;
  className?: string;
};

export function DsBadge({ children, tone = 'neutral', className = '' }: DsBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[`tone_${tone}`]} ${className}`.trim()}>
      {children}
    </span>
  );
}
