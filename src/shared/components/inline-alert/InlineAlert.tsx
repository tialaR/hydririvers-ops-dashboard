'use client';

import type { ReactNode } from 'react';
import { InlineAlert as CoreInlineAlert } from '@/shared/design-system/core/inline-alert';
import styles from './InlineAlert.module.scss';

export type InlineAlertTone = 'error' | 'success' | 'info';
export type InlineAlertProps = { tone?: InlineAlertTone; children: ReactNode; id?: string; className?: string };

export function InlineAlert({ tone = 'error', children, id, className = '' }: InlineAlertProps) {
  return (
    <CoreInlineAlert
      id={id}
      politeness={tone === 'error' ? 'assertive' : 'polite'}
      className={[styles.alert, styles[`tone_${tone}`], className].filter(Boolean).join(' ')}
    >
      {children}
    </CoreInlineAlert>
  );
}
