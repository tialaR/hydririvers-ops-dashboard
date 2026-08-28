import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode;
  busy?: boolean;
};

/** Product-agnostic button primitive. Owns button semantics only; styling belongs to the consuming layer. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, busy = false, disabled = false, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      data-ui-component="button"
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      {...props}
    >
      {children}
    </button>
  );
});
