import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './icon-button.module.scss';

export type DsIconButtonSize = 'sm' | 'md' | 'lg';
export type DsIconButtonVariant = 'ghost' | 'glass' | 'solid';

export type DsIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  ariaLabel: string;
  size?: DsIconButtonSize;
  variant?: DsIconButtonVariant;
  active?: boolean;
};

export function DsIconButton({
  icon,
  ariaLabel,
  size = 'md',
  variant = 'glass',
  active = false,
  className = '',
  type = 'button',
  ...props
}: DsIconButtonProps) {
  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        active ? styles.active : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      aria-pressed={props['aria-pressed'] ?? (active ? true : undefined)}
      {...props}
    >
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
    </button>
  );
}
