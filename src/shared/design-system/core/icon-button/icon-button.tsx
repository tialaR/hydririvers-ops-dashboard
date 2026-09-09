import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  ariaLabel: string;
  children: ReactNode;
  busy?: boolean;
};

/** Product-agnostic icon-only button primitive. Owns native semantics and accessibility only. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { ariaLabel, children, busy = false, disabled = false, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-ui-component="icon-button"
      aria-label={ariaLabel}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      {...props}
    >
      {children}
    </button>
  );
});
