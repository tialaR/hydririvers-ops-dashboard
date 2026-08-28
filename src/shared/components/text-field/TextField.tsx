'use client';

import { TextField as CoreTextField, type TextFieldProps as CoreTextFieldProps } from '@/shared/design-system/core/text-field';
import styles from './TextField.module.scss';

export type TextFieldProps = Omit<CoreTextFieldProps, 'classNames'>;

export function TextField(props: TextFieldProps) {
  return (
    <CoreTextField
      {...props}
      classNames={{
        root: styles.field,
        invalid: styles.fieldInvalid,
        label: styles.label,
        control: styles.control,
        icon: styles.icon,
        input: styles.input,
        trailing: styles.trailing,
        error: styles.error,
        hint: styles.hint,
      }}
    />
  );
}
