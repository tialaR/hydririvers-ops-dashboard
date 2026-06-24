'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import styles from './bottom-sheet.module.sass';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  ariaLabel?: string;
  size?: 'compact' | 'medium' | 'full';
};

export function BottomSheet({ open, onClose, title, children, ariaLabel, size = 'medium' }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={`${styles.sheet} ${size === 'compact' ? styles.sheetCompact : ''} ${size === 'full' ? styles.sheetFull : ''} ${size === 'medium' ? styles.sheetMedium : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden />
        {title ? <h2 className={styles.title}>{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
