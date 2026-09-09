import type { ReactNode } from 'react';

import { Badge as CoreBadge, type BadgeTone as CoreBadgeTone } from '@/shared/design-system/core/badge';

import styles from './badge.module.scss';

export type BadgeProps = {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'river';
};

const CORE_TONE_BY_LEGACY_TONE: Record<NonNullable<BadgeProps['tone']>, CoreBadgeTone> = {
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  river: 'info',
};

/**
 * Compatibility skin for the legacy shared/ui Badge API.
 * DOM semantics now come from the extractable Design System core.
 */
export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <CoreBadge
      tone={CORE_TONE_BY_LEGACY_TONE[tone]}
      className={`${styles.badge} ${styles[tone]}`}
    >
      {children}
    </CoreBadge>
  );
}
