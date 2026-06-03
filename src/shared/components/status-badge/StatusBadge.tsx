'use client';

import type { HTMLAttributes, ReactNode } from 'react';

import styles from './StatusBadge.module.scss';
import { STATUS_BADGE_DATA_ATTR, STATUS_BADGE_DEFAULT_LABEL } from './status-badge-utils';

export type StatusBadgeStatus =
  | 'inTransit'
  | 'scheduled'
  | 'quotation'
  | 'delayed'
  | 'completed'
  | 'blocked';

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

  return (
    <span
      className={[
        styles.badge,
        styles[`size_${size}`],
        showDot ? styles.withDot : styles.noDot,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-status={STATUS_BADGE_DATA_ATTR[status]}
      aria-label={ariaLabel}
      {...props}
    >
      {label}
    </span>
  );
}
