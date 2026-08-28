'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Button as CoreButton } from '@/shared/design-system/core/button';

import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || isLoading;

  return (
    <CoreButton
      type={type}
      className={[
        styles.button,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        fullWidth ? styles.fullWidth : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-primary={isPrimary ? 'true' : undefined}
      data-loading={isLoading ? 'true' : undefined}
      disabled={isDisabled}
      busy={isLoading}
      {...props}
    >
      {iconLeft ? <span className={styles.iconLeft}>{iconLeft}</span> : null}
      <span className={isLoading ? styles.loadingLabel : undefined}>{children}</span>
      {iconRight ? <span className={styles.iconRight}>{iconRight}</span> : null}
    </CoreButton>
  );
}
