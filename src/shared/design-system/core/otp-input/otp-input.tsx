'use client';

import { useMemo, type ClipboardEvent, type KeyboardEvent } from 'react';

export type OtpSlotsBox = { slots: (HTMLInputElement | null)[] };
export type OtpInputProps = {
  value: string;
  length?: number;
  onChange: (value: string) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  invalid?: boolean;
  groupLabel: string;
  digitAriaLabel: (index: number) => string;
  describedBy?: string;
  slotsBox?: OtpSlotsBox;
  className?: string;
  invalidClassName?: string;
  inputClassName?: string;
};

export function OtpInput({
  value,
  length = 6,
  onChange,
  onPaste,
  disabled = false,
  invalid = false,
  groupLabel,
  digitAriaLabel,
  describedBy,
  slotsBox,
  className = '',
  invalidClassName = '',
  inputClassName = '',
}: OtpInputProps) {
  const indices = useMemo(() => Array.from({ length }, (_, index) => index), [length]);
  const refCallbacks = useMemo(
    () => indices.map((index) => (el: HTMLInputElement | null) => {
      if (slotsBox) slotsBox.slots[index] = el;
    }),
    [indices, slotsBox],
  );

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const chars = value.padEnd(length, ' ').split('');
    chars[index] = digit || '';
    onChange(chars.join('').trimEnd());
    if (digit && index < length - 1) slotsBox?.slots[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !value[index] && index > 0) slotsBox?.slots[index - 1]?.focus();
  }

  return (
    <div
      className={[className, invalid ? invalidClassName : ''].filter(Boolean).join(' ')}
      role="group"
      aria-label={groupLabel}
      aria-describedby={describedBy}
    >
      {indices.map((index) => (
        <input
          key={`otp-slot-${index}`}
          ref={refCallbacks[index]}
          className={inputClassName}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          pattern="\d*"
          aria-label={digitAriaLabel(index + 1)}
          aria-invalid={invalid || undefined}
          value={value[index] ?? ''}
          disabled={disabled}
          onPaste={onPaste}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
        />
      ))}
    </div>
  );
}
