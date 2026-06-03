'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import styles from './IconButton.module.scss';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'default' | 'filter' | 'theme' | 'close' | 'map' | 'alert';

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  ariaLabel: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isActive?: boolean;
  badgeCount?: number;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    ariaLabel,
    icon,
    variant = 'default',
    size = 'lg',
    isActive = false,
    badgeCount,
    className = '',
    disabled = false,
    type = 'button',
    ...props
  },
  ref,
) {
  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;

  return (
    <button
      ref={ref}
      type={type}
      className={[
        styles.button,
        styles[`variant_${variant}`],
        variant !== 'close' ? styles[`size_${size}`] : '',
        isActive ? styles.isActive : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      aria-pressed={props['aria-pressed'] ?? (isActive ? true : undefined)}
      data-active={isActive ? 'true' : undefined}
      disabled={disabled}
      {...props}
    >
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      {showBadge ? <span className={styles.badge}>{badgeCount}</span> : null}
    </button>
  );
});
