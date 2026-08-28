import type { HTMLAttributes, ReactNode } from 'react';

export type SurfaceElement = 'div' | 'section' | 'article';

export type SurfaceProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children: ReactNode;
  as?: SurfaceElement;
};

/** Product-agnostic surface primitive. Owns semantic container shape only. */
export function Surface({ children, as: Tag = 'div', ...props }: SurfaceProps) {
  return (
    <Tag data-ui-component="surface" {...props}>
      {children}
    </Tag>
  );
}
