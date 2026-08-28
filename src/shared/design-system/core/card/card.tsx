import type { HTMLAttributes, ReactNode } from 'react';

export type CoreCardElement = 'div' | 'section' | 'article' | 'aside';
export type CoreCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: CoreCardElement;
};

export function Card({ children, as: Component = 'article', ...props }: CoreCardProps) {
  return <Component {...props}>{children}</Component>;
}
