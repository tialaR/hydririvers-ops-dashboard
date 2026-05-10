import type { ReactNode } from 'react';
import styles from './badge.module.scss';

export type BadgeProps = { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'river' };

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
