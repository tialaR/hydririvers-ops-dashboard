'use client';
import type { ReactNode } from 'react';
import { PrimaryButton } from '@/features/product-shell/components/primary-button/primary-button';
import styles from './product-state.module.sass';
type ProductStateProps = { title: string; description: string; actionLabel?: string; actionHref?: string; onAction?: () => void; icon?: ReactNode };
export function ErrorState({ title, description, actionLabel, actionHref, onAction, icon }: ProductStateProps) {
  return <div className={styles.center}><div className={`${styles.iconCircle} ${styles.errorIcon}`}>{icon ?? '!'}</div><h2 className={styles.title}>{title}</h2><p className={styles.summary}>{description}</p>{actionLabel ? <PrimaryButton label={actionLabel} href={actionHref} onClick={onAction} /> : null}</div>;
}
export function EmptyState({ title, description }: Pick<ProductStateProps, 'title' | 'description'>) {
  return <div className={styles.center}><h2 className={styles.title}>{title}</h2><p className={styles.summary}>{description}</p></div>;
}
export function SuccessReceipt({ title, description, actionLabel, actionHref }: Required<Pick<ProductStateProps, 'title' | 'description' | 'actionLabel' | 'actionHref'>>) {
  return <div className={styles.center}><div className={`${styles.iconCircle} ${styles.success}`}>✓</div><h2 className={styles.title}>{title}</h2><p className={styles.summary}>{description}</p><PrimaryButton label={actionLabel} href={actionHref} /></div>;
}
