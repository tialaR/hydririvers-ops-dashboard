import type { ReactNode } from 'react';

import {
  Badge as CoreBadge,
  type BadgeDensity,
  type BadgeTone,
} from '@/shared/design-system/core/badge';

import styles from './badge.module.scss';

export type DsBadgeTone = BadgeTone;
export type DsBadgeDensity = BadgeDensity;

export type DsBadgeProps = {
  children: ReactNode;
  tone?: DsBadgeTone;
  density?: DsBadgeDensity;
  className?: string;
};

/**
 * HydroRivers Design System skin over the product-agnostic core Badge.
 * Existing visual classes are intentionally preserved during extraction.
 */
export function DsBadge({
  children,
  tone = 'neutral',
  density = 'default',
  className = '',
}: DsBadgeProps) {
  return (
    <CoreBadge
      tone={tone}
      density={density}
      className={`${styles.badge} ${styles[`tone_${tone}`]} ${styles[`density_${density}`]} ${className}`.trim()}
    >
      {children}
    </CoreBadge>
  );
}
