'use client';

import type { ReactNode } from 'react';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';

import styles from '../shared-ui/shared-ui.module.sass';

type ErrorStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function ErrorState({ title, description, actionLabel, actionHref, onAction, icon }: ErrorStateProps) {
  return (
    <div className={styles.center}>
      <div className={`${styles.iconCircle} ${styles.errorIcon}`}>{icon ?? '!'}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.summary}>{description}</p>
      {actionLabel ? (
        <PrimaryButton label={actionLabel} href={actionHref} onClick={onAction} />
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.center}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.summary}>{description}</p>
    </div>
  );
}

export function SuccessReceipt({
  title,
  description,
  actionLabel,
  actionHref
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className={styles.center}>
      <div className={`${styles.iconCircle} ${styles.success}`}>✓</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.summary}>{description}</p>
      <PrimaryButton label={actionLabel} href={actionHref} />
    </div>
  );
}
