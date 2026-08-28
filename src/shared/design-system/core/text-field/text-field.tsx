import type { InputHTMLAttributes, ReactNode } from 'react';

export type TextFieldClassNames = {
  root?: string;
  invalid?: string;
  label?: string;
  control?: string;
  icon?: string;
  input?: string;
  trailing?: string;
  error?: string;
  hint?: string;
};

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  inputClassName?: string;
  describedById?: string;
  classNames?: TextFieldClassNames;
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
  classNames = {},
  id,
  'aria-invalid': ariaInvalid,
  ...inputProps
}: TextFieldProps) {
  const hintId = hint && id ? `${id}-hint` : undefined;
  const errorId = error && id ? `${id}-error` : undefined;
  const describedBy = [describedById, hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <label
      className={[classNames.root, error ? classNames.invalid : '', className].filter(Boolean).join(' ')}
      htmlFor={id}
      data-ui-component="text-field"
    >
      <span className={classNames.label}>{label}</span>
      <div className={classNames.control}>
        {icon ? <span className={classNames.icon} aria-hidden>{icon}</span> : null}
        <input
          id={id}
          className={[classNames.input, inputClassName].filter(Boolean).join(' ')}
          aria-invalid={ariaInvalid ?? (error ? true : undefined)}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {trailing ? <span className={classNames.trailing}>{trailing}</span> : null}
      </div>
      {error ? (
        <p className={classNames.error} id={errorId} role="alert">{error}</p>
      ) : hint ? (
        <p className={classNames.hint} id={hintId}>{hint}</p>
      ) : null}
    </label>
  );
}
