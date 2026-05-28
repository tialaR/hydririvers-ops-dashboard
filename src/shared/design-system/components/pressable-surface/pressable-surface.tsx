import type { ButtonHTMLAttributes, ReactNode } from 'react';

import surfaceStyles from '../surface/surface.module.scss';
import styles from './pressable-surface.module.scss';

export type PressableSurfaceSemanticRole = 'card' | 'cardElevated' | 'panel';
export type PressableSurfacePadding = 'none' | 'sm' | 'md' | 'lg';

export type PressableSurfaceProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  semanticRole?: PressableSurfaceSemanticRole;
  padding?: PressableSurfacePadding;
  selected?: boolean;
};

export function PressableSurface({
  children,
  semanticRole = 'card',
  padding = 'md',
  selected = false,
  className = '',
  type = 'button',
  ...props
}: PressableSurfaceProps) {
  const classNames = [
    surfaceStyles.surface,
    surfaceStyles[`role_${semanticRole}`],
    surfaceStyles[`padding_${padding}`],
    styles.pressable,
    selected ? styles.selected : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} aria-pressed={selected || undefined} {...props}>
      {children}
    </button>
  );
}
