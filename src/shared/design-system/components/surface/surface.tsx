import type { HTMLAttributes, ReactNode } from 'react';

import styles from './surface.module.scss';

export type SurfaceTone = 'default' | 'glass' | 'elevated';
export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  interactive?: boolean;
};

export function Surface({
  children,
  tone = 'default',
  padding = 'md',
  interactive = false,
  className = '',
  ...props
}: SurfaceProps) {
  const classNames = [
    styles.surface,
    styles[`tone_${tone}`],
    styles[`padding_${padding}`],
    interactive ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
