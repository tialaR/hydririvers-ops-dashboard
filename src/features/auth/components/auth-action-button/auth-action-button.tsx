'use client';

import { Link } from '@/core/i18n/navigation';
import { Button as CoreButton } from '@/shared/design-system/core/button';
import type { AuthCtaState } from '@/features/auth/screens/auth-presentation-contracts';

import styles from './auth-action-button.module.sass';

type AuthActionButtonProps = {
  label: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  state?: AuthCtaState;
  type?: 'button' | 'submit';
};

export function AuthActionButton({
  label,
  href,
  variant = 'primary',
  state = 'idle',
  type = 'button',
}: AuthActionButtonProps) {
  const className = [
    styles.button,
    styles[variant],
    state === 'loading' ? styles.loading : '',
    state === 'success' ? styles.success : '',
    state === 'error' ? styles.error : '',
    state === 'disabled' ? styles.disabled : '',
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
    <CoreButton
      type={type}
      className={className}
      busy={state === 'loading'}
      disabled={state === 'disabled'}
    >
      {label}
    </CoreButton>
  );
}
