'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { StatusBadge as CoreStatusBadge } from '@/shared/design-system/core/status-badge';
import styles from './StatusBadge.module.scss';
import {
  STATUS_BADGE_DATA_ATTR,
  STATUS_BADGE_DEFAULT_LABEL,
  STATUS_BADGE_TONE,
} from './status-badge-utils';

export type StatusBadgeStatus =
  | 'open'
  | 'quotation'
  | 'contracting'
  | 'operating'
  | 'inTransit'
  | 'completed'
  | 'delayed'
  | 'blocked'
  | 'unknown';

export type StatusBadgeSize = 'sm' | 'md';

export type StatusBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  status: StatusBadgeStatus;
  children?: ReactNode;
  showDot?: boolean;
  size?: StatusBadgeSize;
  className?: string;
  ariaLabel?: string;
};

export function StatusBadge({
  status,
  children,
  showDot = true,
  size = 'md',
  className = '',
  ariaLabel,
  ...props
}: StatusBadgeProps) {
  const label = children ?? STATUS_BADGE_DEFAULT_LABEL[status];
  const resolvedStatus = STATUS_BADGE_DATA_ATTR[status] ? status : 'unknown';

  return (
    <CoreStatusBadge
      className={[
        styles.badge,
        styles[`size_${size}`],
        showDot ? styles.withDot : styles.noDot,
        className,
      ].filter(Boolean).join(' ')}
      statusKey={STATUS_BADGE_DATA_ATTR[resolvedStatus]}
      tone={STATUS_BADGE_TONE[resolvedStatus]}
      aria-label={ariaLabel}
      {...props}
    >
      {label}
    </CoreStatusBadge>
  );
}
