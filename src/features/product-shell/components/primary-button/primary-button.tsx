'use client';

export type ProductCtaState = 'idle' | 'pressed' | 'loading' | 'success' | 'error' | 'disabled';
import { Link } from '@/core/i18n/navigation';

import styles from './primary-button.module.sass';

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
    <button type={type} className={className} onClick={onClick} disabled={state === 'disabled' || state === 'loading'}>
      {label}
    </button>
  );
}
