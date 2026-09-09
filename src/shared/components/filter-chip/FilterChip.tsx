'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { FilterChip as CoreFilterChip } from '@/shared/design-system/core/filter-chip';
import styles from './FilterChip.module.scss';

export type FilterChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaPressed?: boolean;
};

export function FilterChip({
  children,
  isSelected = false,
  className = '',
  ariaPressed,
  ...props
}: FilterChipProps) {
  return (
    <CoreFilterChip
      {...props}
      selected={isSelected}
      ariaPressed={ariaPressed}
      className={[styles.chip, className].filter(Boolean).join(' ')}
    >
      {children}
    </CoreFilterChip>
  );
}
