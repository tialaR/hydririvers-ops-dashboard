'use client';

import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/design-system/core/button';

import styles from './primary-button.module.sass';

export type ProductCtaState = 'idle' | 'pressed' | 'loading' | 'success' | 'error' | 'disabled';

type PrimaryButtonProps = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  state?: ProductCtaState;
  type?: 'button' | 'submit';
  size?: 'default' | 'compact';
};

export function PrimaryButton({
  label,
  onClick,
  href,
  variant = 'primary',
  state = 'idle',
  type = 'button',
  size = 'default'
}: PrimaryButtonProps) {
  const className = [
    styles.button,
    styles[variant],
    size === 'compact' ? styles.compact : '',
    state === 'loading' ? styles.loading : '',
    state === 'success' ? styles.success : '',
    state === 'error' ? styles.error : '',
    state === 'disabled' ? styles.disabled : ''
  ]
    .filter(Boolean)
    .join(' ');

  if (href && state !== 'disabled') {
    return (
      <Link href={href} className={`${className} ${styles.link}`}>
        {label}
      </Link>
    );
  }

  return (
    <Button
      type={type}
      className={className}
      onClick={onClick}
      disabled={state === 'disabled'}
      busy={state === 'loading'}
    >
      {label}
    </Button>
  );
}
