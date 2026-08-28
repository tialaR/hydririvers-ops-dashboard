'use client';

import { SearchField as CoreSearchField, type SearchFieldProps as CoreSearchFieldProps } from '@/shared/design-system/core/search-field';
import styles from './SearchField.module.scss';

export type SearchFieldProps = Omit<CoreSearchFieldProps, 'classNames'>;

export function SearchField(props: SearchFieldProps) {
  return (
    <CoreSearchField
      {...props}
      classNames={{
        root: styles.field,
        leading: styles.leading,
        input: styles.input,
        rightSlot: styles.rightSlot,
      }}
    />
  );
}
