'use client';

import type { ChangeEventHandler, ReactNode } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-search-field.module.scss';

export type LiquidGlassSearchFieldTone = 'auto' | 'light' | 'dark';
export type LiquidGlassSearchFieldState = 'placeholder' | 'typing' | 'value';

export type LiquidGlassSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tone?: LiquidGlassSearchFieldTone;
  state?: LiquidGlassSearchFieldState;
  disabled?: boolean;
  showMicrophone?: boolean;
  onMicrophoneClick?: () => void;
  searchIcon?: ReactNode;
  microphoneIcon?: ReactNode;
  'aria-label'?: string;
  className?: string;
  inputClassName?: string;
  name?: string;
  autoFocus?: boolean;
};

function DefaultSearchIcon() {
  return (
    <svg
      className={styles.searchGlyph}
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11.5 10.5h-.79l-.28-.27A5.5 5.5 0 1 0 10.5 11.5l.27.28v.79l3.5 3.5 1.06-1.06L11.5 10.5Zm-4.5 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DefaultMicrophoneIcon() {
  return (
    <svg
      className={styles.micGlyph}
      width="12"
      height="17"
      viewBox="0 0 12 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="3.5" y="1" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M1.5 8.5a4.5 4.5 0 0 0 9 0M6 13v3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Pill-shaped search field with Liquid Glass styling (Figma _Search - Top).
 * Uses a native `<input type="search">` — no fake cursor or contenteditable.
 */
export function LiquidGlassSearchField({
  value,
  onChange,
  placeholder = 'Search',
  tone = 'auto',
  state,
  disabled = false,
  showMicrophone = true,
  onMicrophoneClick,
  searchIcon,
  microphoneIcon,
  'aria-label': ariaLabel = 'Buscar',
  className = '',
  inputClassName = '',
  name,
  autoFocus = false,
}: LiquidGlassSearchFieldProps) {
  const resolvedState = state ?? (value.length > 0 ? 'value' : 'placeholder');
  const micIsButton = showMicrophone && onMicrophoneClick != null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.value);
  };

  const wrapperClassName = [
    styles.field,
    className,
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClassNames = [styles.input, inputClassName].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClassName}
      data-tone={tone}
      data-state={resolvedState}
    >
      <span className={styles.searchIcon} aria-hidden>
        {searchIcon ?? <DefaultSearchIcon />}
      </span>

      <input
        type="search"
        name={name}
        className={inputClassNames}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
      />

      {showMicrophone ? (
        micIsButton ? (
          <button
            type="button"
            className={styles.micButton}
            onClick={onMicrophoneClick}
            disabled={disabled}
            aria-label="Usar microfone"
          >
            {microphoneIcon ?? <DefaultMicrophoneIcon />}
          </button>
        ) : (
          <span className={styles.micDecor} aria-hidden>
            {microphoneIcon ?? <DefaultMicrophoneIcon />}
          </span>
        )
      ) : null}
    </div>
  );
}
