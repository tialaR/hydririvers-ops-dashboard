import type { HTMLAttributes, ReactNode } from 'react';

export type InlineAlertPoliteness = 'assertive' | 'polite';
export type InlineAlertProps = Omit<HTMLAttributes<HTMLParagraphElement>, 'children' | 'role'> & {
  children: ReactNode;
  politeness?: InlineAlertPoliteness;
};

export function InlineAlert({ children, politeness = 'assertive', ...props }: InlineAlertProps) {
  return (
    <p role={politeness === 'assertive' ? 'alert' : 'status'} {...props}>
      {children}
    </p>
  );
}
