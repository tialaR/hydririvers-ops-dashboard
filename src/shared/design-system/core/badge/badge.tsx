import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeDensity = 'default' | 'compact';

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children: ReactNode;
  tone?: BadgeTone;
  density?: BadgeDensity;
};

/**
 * Product-agnostic badge primitive.
 *
 * This component owns semantics and DOM shape only. Visual identity belongs to
 * the consuming theme or compatibility layer so the primitive can be extracted
 * into a standalone UI package without carrying application-specific naming or
 * application-specific tokens with it.
 */
export function Badge({
  children,
  tone = 'neutral',
  density = 'default',
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={className}
      data-ui-component="badge"
      data-tone={tone}
      data-density={density}
      {...props}
    >
      {children}
    </span>
  );
}
