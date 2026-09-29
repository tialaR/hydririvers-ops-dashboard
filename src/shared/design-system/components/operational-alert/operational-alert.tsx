'use client';

import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Info,
  type LucideIcon,
} from 'lucide-react';

import styles from './operational-alert.module.sass';

export type OperationalAlertTone = 'info' | 'warning' | 'danger' | 'success';

type OperationalAlertProps = {
  tone: OperationalAlertTone;
  eyebrow: string;
  badge?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  testId?: string;
};

const toneIcons: Record<OperationalAlertTone, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  danger: CircleAlert,
  success: CheckCircle2,
};

export function OperationalAlert({
  tone,
  eyebrow,
  badge,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  testId,
}: OperationalAlertProps) {
  const Icon = icon ?? toneIcons[tone];

  return (
    <section className={styles.root} data-tone={tone} data-testid={testId}>
      <span className={styles.icon} aria-hidden>
        <Icon size={20} strokeWidth={2} />
      </span>

      <div className={styles.copy}>
        <div className={styles.meta}>
          <small>{eyebrow}</small>
          {badge ? <span>{badge}</span> : null}
        </div>
        <strong>{title}</strong>
        {description ? <p>{description}</p> : null}
      </div>

      {actionLabel ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
