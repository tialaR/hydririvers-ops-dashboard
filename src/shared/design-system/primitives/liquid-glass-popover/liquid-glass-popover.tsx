import type { ReactNode } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-popover.module.scss';

export type LiquidGlassPopoverArrow = 'top' | 'bottom' | 'left' | 'right' | 'none';
export type LiquidGlassPopoverSize = 'sm' | 'md' | 'lg';
export type LiquidGlassPopoverTone = 'auto' | 'light' | 'dark';
export type LiquidGlassPopoverRole = 'dialog' | 'menu' | 'region';

export type LiquidGlassPopoverProps = {
  children: ReactNode;
  title?: string;
  open?: boolean;
  arrow?: LiquidGlassPopoverArrow;
  size?: LiquidGlassPopoverSize;
  tone?: LiquidGlassPopoverTone;
  className?: string;
  role?: LiquidGlassPopoverRole;
};

/**
 * Floating popover with Liquid Glass material (Figma iPad Popovers).
 *
 * Focus trap and focus return are the responsibility of composed components
 * (e.g. anchored menu, filter sheet trigger). This primitive only exposes
 * basic semantics via `role` and does not manage focus.
 */
export function LiquidGlassPopover({
  children,
  title,
  open = true,
  arrow = 'bottom',
  size = 'md',
  tone = 'auto',
  className = '',
  role = 'dialog',
}: LiquidGlassPopoverProps) {
  const classNames = [
    styles.popover,
    styles[`size_${size}`],
    styles[`arrow_${arrow}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      role={role}
      data-open={open ? 'true' : 'false'}
      data-tone={tone}
      data-size={size}
      data-arrow={arrow}
      aria-hidden={open ? undefined : true}
    >
      {title ? (
        <header className={styles.header}>
          <span className={styles.title}>{title}</span>
        </header>
      ) : null}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
