'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

import styles from './TextField.module.scss';

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  inputClassName?: string;
  describedById?: string;
};

export function TextField({
  label,
  hint,
  error,
  icon,
  trailing,
  className = '',
  inputClassName = '',
  describedById,
  id,
  'aria-invalid': ariaInvalid,
  ...inputProps
}: TextFieldProps) {
  const hintId = hint && id ? `${id}-hint` : undefined;
  const errorId = error && id ? `${id}-error` : undefined;
  const describedBy = [describedById, hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <label className={[styles.field, error ? styles.fieldInvalid : '', className].filter(Boolean).join(' ')} htmlFor={id}>
      <span className={styles.label}>{label}</span>
      <div className={styles.control}>
        {icon ? (
          <span className={styles.icon} aria-hidden>
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          className={[styles.input, inputClassName].filter(Boolean).join(' ')}
          aria-invalid={ariaInvalid ?? (error ? true : undefined)}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
      </div>
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </label>
  );
}
