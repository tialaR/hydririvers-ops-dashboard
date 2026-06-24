'use client';

import { BottomSheet } from '@/features/shipper-mobile-flow/components/bottom-sheet/bottom-sheet';
import { PrimaryButton } from '@/features/shipper-mobile-flow/components/primary-button/primary-button';

import styles from '../bottom-sheet/bottom-sheet.module.sass';

type ConfirmationSheetProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationSheet({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel
}: ConfirmationSheetProps) {
  return (
    <BottomSheet open={open} onClose={onCancel} title={title}>
      <p className={styles.body}>{description}</p>
      <div className={styles.actions}>
        <PrimaryButton label={confirmLabel} onClick={onConfirm} variant="primary" />
        <PrimaryButton label={cancelLabel} onClick={onCancel} variant="secondary" />
      </div>
    </BottomSheet>
  );
}
