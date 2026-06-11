'use client';

import type { ReactNode } from 'react';

import styles from './InlineAlert.module.scss';

export type InlineAlertTone = 'error' | 'success' | 'info';

export type InlineAlertProps = {
  tone?: InlineAlertTone;
  children: ReactNode;
  id?: string;
  className?: string;
};

export function InlineAlert({ tone = 'error', children, id, className = '' }: InlineAlertProps) {
  return (
    <p
      id={id}
      role={tone === 'error' ? 'alert' : 'status'}
      className={[styles.alert, styles[`tone_${tone}`], className].filter(Boolean).join(' ')}
    >
      {children}
    </p>
  );
}
