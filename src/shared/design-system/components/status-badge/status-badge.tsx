import type { ReactNode } from 'react';

import { DsBadge, type DsBadgeDensity, type DsBadgeTone } from '../badge/badge';

export type StatusBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusBadgeTone;
  density?: DsBadgeDensity;
  className?: string;
};

const toneMap: Record<StatusBadgeTone, DsBadgeTone> = {
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
};

export function StatusBadge({
  children,
  tone = 'neutral',
  density = 'default',
  className = '',
}: StatusBadgeProps) {
  return (
    <DsBadge tone={toneMap[tone]} density={density} className={className}>
      {children}
    </DsBadge>
  );
}
