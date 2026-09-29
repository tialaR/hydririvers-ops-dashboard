'use client';

import { ChevronRight, Clock3, Folder, type LucideIcon } from 'lucide-react';

import styles from './evidence-folder-item.module.sass';

export type EvidenceFolderTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type EvidenceFolderVariant = 'card' | 'row';

type EvidenceFolderItemProps = {
  title: string;
  subtitle: string;
  meta: string;
  statusLabel: string;
  tone: EvidenceFolderTone;
  variant?: EvidenceFolderVariant;
  selected?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
  testId?: string;
};

export function EvidenceFolderItem({
  title,
  subtitle,
  meta,
  statusLabel,
  tone,
  variant = 'card',
  selected = false,
  icon,
  onClick,
  testId,
}: EvidenceFolderItemProps) {
  const Icon = icon ?? Folder;

  return (
    <button
      type="button"
      className={styles.root}
      data-tone={tone}
      data-variant={variant}
      data-selected={selected || undefined}
      aria-pressed={selected}
      onClick={onClick}
      data-testid={testId}
    >
      <span className={styles.icon} data-semantic-role="neutral-icon" aria-hidden>
        <Icon size={variant === 'row' ? 20 : 19} strokeWidth={1.9} />
      </span>

      <span className={styles.copy}>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>

      <span
        className={styles.status}
        data-semantic-status={tone}
        aria-label={`Status: ${statusLabel}`}
      >
        {statusLabel}
      </span>

      <span className={styles.meta}>
        <Clock3 size={13} aria-hidden />
        {meta}
      </span>

      {variant === 'row' ? (
        <span className={styles.chevron} aria-hidden>
          <ChevronRight size={18} />
        </span>
      ) : null}
    </button>
  );
}
