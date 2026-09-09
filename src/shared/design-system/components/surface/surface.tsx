import type { HTMLAttributes, ReactNode } from 'react';

import { Surface as CoreSurface } from '@/shared/design-system/core/surface';

import styles from './surface.module.scss';

export type SurfaceTone = 'default' | 'glass' | 'elevated';
export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';
export type SurfaceSemanticRole = 'card' | 'cardElevated' | 'panel' | 'sheet' | 'overlay';

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  interactive?: boolean;
  semanticRole?: SurfaceSemanticRole;
};

export function Surface({
  children,
  tone = 'default',
  padding = 'md',
  interactive = false,
  semanticRole,
  className = '',
  ...props
}: SurfaceProps) {
  const classNames = [
    styles.surface,
    styles[`tone_${tone}`],
    styles[`padding_${padding}`],
    semanticRole ? styles[`role_${semanticRole}`] : '',
    interactive ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <CoreSurface className={classNames} {...props}>
      {children}
    </CoreSurface>
  );
}
