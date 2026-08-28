import type { ReactNode } from 'react';

import { Button as CoreButton } from '@/shared/design-system/core/button';
import styles from './button.module.scss';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  loadingLabel?: ReactNode;
};

export function Button({ className = '', variant = 'primary', loading = false, loadingLabel, disabled, children, ...props }: ButtonProps) {
  return (
    <CoreButton
      className={`${styles.button} ${styles[variant]} ${loading ? styles.loading : ''} ${className}`}
      disabled={disabled}
      busy={loading}
      {...props}
    >
      {loading ? (
        <span className={styles.loadingContent}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>{loadingLabel ?? children}</span>
        </span>
      ) : children}
    </CoreButton>
  );
}
