'use client';

import type { ChangeEvent, ReactNode } from 'react';

import styles from './SearchField.module.scss';

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  rightSlot?: ReactNode;
  onClear?: () => void;
  ariaLabel?: string;
  icon?: ReactNode;
};

export function SearchField({
  value,
  onChange,
  placeholder,
  disabled = false,
  autoFocus = false,
  className = '',
  inputClassName = '',
  rightSlot,
  ariaLabel,
  icon,
}: SearchFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')}>
      {icon ? (
        <span className={styles.leading} aria-hidden>
          {icon}
        </span>
      ) : null}
      <input
        type="search"
        className={[styles.input, inputClassName].filter(Boolean).join(' ')}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
        enterKeyHint="search"
      />
      {rightSlot ? <span className={styles.rightSlot}>{rightSlot}</span> : null}
    </label>
  );
}
