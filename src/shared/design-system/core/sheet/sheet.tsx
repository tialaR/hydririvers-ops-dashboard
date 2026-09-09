'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type SheetSemanticRole = 'dialog' | 'region';
export type SheetElement = 'section' | 'div';

export type SheetProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'role'> & {
  children: ReactNode;
  as?: SheetElement;
  role?: SheetSemanticRole;
  modal?: boolean;
  labelledBy?: string;
  describedBy?: string;
};

/**
 * Product-neutral semantic owner for sheet containers.
 *
 * Motion, portals, focus management, snap behavior and visual materials stay in adapters.
 */
export const Sheet = forwardRef<HTMLElement, SheetProps>(function Sheet(
  {
    children,
    as: Tag = 'section',
    role = 'dialog',
    modal = false,
    labelledBy,
    describedBy,
    ...props
  },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      role={role}
      aria-modal={modal && role === 'dialog' ? true : undefined}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      {...props}
    >
      {children}
    </Tag>
  );
});
