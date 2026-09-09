import type { HTMLAttributes, ReactNode } from 'react';

export type StatusBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children: ReactNode;
  statusKey?: string;
  tone?: string;
  showDot?: boolean;
  dotClassName?: string;
};

export function StatusBadge({
  children,
  statusKey,
  tone,
  showDot = false,
  dotClassName = '',
  className = '',
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={className}
      data-ui-component="status-badge"
      data-status={statusKey}
      data-status-tone={tone}
      {...props}
    >
      {showDot ? <span className={dotClassName} aria-hidden /> : null}
      {children}
    </span>
  );
}
