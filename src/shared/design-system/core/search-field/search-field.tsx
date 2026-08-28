'use client';

import type { ChangeEvent, ReactNode } from 'react';

export type SearchFieldClassNames = {
  root?: string;
  leading?: string;
  input?: string;
  rightSlot?: string;
};

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  rightSlot?: ReactNode;
  ariaLabel?: string;
  icon?: ReactNode;
  classNames?: SearchFieldClassNames;
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
  classNames = {},
}: SearchFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <label className={[classNames.root, className].filter(Boolean).join(' ')} data-ui-component="search-field">
      {icon ? <span className={classNames.leading} aria-hidden>{icon}</span> : null}
      <input
        type="search"
        className={[classNames.input, inputClassName].filter(Boolean).join(' ')}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
        enterKeyHint="search"
      />
      {rightSlot ? <span className={classNames.rightSlot}>{rightSlot}</span> : null}
    </label>
  );
}
