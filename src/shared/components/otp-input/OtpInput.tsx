'use client';

import type { ClipboardEvent } from 'react';
import { OtpInput as CoreOtpInput, type OtpSlotsBox } from '@/shared/design-system/core/otp-input';
import styles from './OtpInput.module.scss';

export type { OtpSlotsBox };
export type OtpInputProps = {
  value: string; length?: number; onChange: (value: string) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void; disabled?: boolean; invalid?: boolean;
  groupLabel: string; digitAriaLabel: (index: number) => string; describedBy?: string; slotsBox?: OtpSlotsBox;
};

export function OtpInput(props: OtpInputProps) {
  return <CoreOtpInput {...props} className={styles.row} invalidClassName={styles.rowInvalid} inputClassName={styles.cell} />;
}
