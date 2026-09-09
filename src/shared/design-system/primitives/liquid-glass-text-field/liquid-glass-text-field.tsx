'use client';

import type { ChangeEventHandler, ElementType } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-text-field.module.scss';

export type LiquidGlassTextFieldTone = 'auto' | 'light' | 'dark';

export type LiquidGlassTextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  tone?: LiquidGlassTextFieldTone;
  name?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password';
  'aria-label'?: string;
  className?: string;
  inputClassName?: string;
};

function DefaultClearIcon() {
  return (
    <svg
      className={styles.clearGlyph}
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8.5" cy="8.5" r="8" fill="currentColor" fillOpacity="0.24" />
      <path
        d="M6.2 6.2l4.6 4.6M10.8 6.2l-4.6 4.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Form text field row with Liquid Glass styling (Figma Text Field / Field Group).
 * Uses a native `<input>` — no fake cursor or contenteditable.
 */
export function LiquidGlassTextField({
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  clearable = false,
  onClear,
  tone = 'auto',
  name,
  type = 'text',
  'aria-label': ariaLabel,
  className = '',
  inputClassName = '',
}: LiquidGlassTextFieldProps) {
  const showClear = clearable && value.length > 0 && !disabled;
  const accessibleName = ariaLabel ?? placeholder;
  const RowTag: ElementType = label ? 'label' : 'div';

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.value);
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  const rowClassName = [
    styles.row,
    label ? styles.rowAsLabel : '',
    className,
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClassNames = [styles.input, inputClassName].filter(Boolean).join(' ');

  return (
    <RowTag className={rowClassName} data-tone={tone}>
      <div className={styles.contents}>
        <input
          type={type}
          name={name}
          className={inputClassNames}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={label ? undefined : accessibleName}
          autoComplete="off"
        />

        {showClear ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            disabled={disabled}
            aria-label="Limpar campo"
          >
            <DefaultClearIcon />
          </button>
        ) : null}
      </div>

      {label ? <span className={styles.label}>{label}</span> : null}
    </RowTag>
  );
}
