'use client';

import type { ReactNode } from 'react';

import styles from './InformationalCard.module.scss';

export type InformationalCardTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type InformationalCardAlign = 'center' | 'start';

export type InformationalCardProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: InformationalCardAlign;
  tone?: InformationalCardTone;
  className?: string;
  children?: ReactNode;
};

export function InformationalCard({
  icon,
  title,
  description,
  action,
  align = 'center',
  tone = 'info',
  className = '',
  children,
}: InformationalCardProps) {
  return (
    <div
      className={[
        styles.card,
        styles[`align_${align}`],
        styles[`tone_${tone}`],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      data-informational-card="true"
      data-informational-card-tone={tone}
      data-informational-card-align={align}
    >
      {icon ? (
        <span className={styles.icon} data-informational-card-icon="true" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h3 className={styles.title} data-informational-card-title="true">
        {title}
      </h3>
      {description ? (
        <p className={styles.description} data-informational-card-description="true">
          {description}
        </p>
      ) : null}
      {children}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
