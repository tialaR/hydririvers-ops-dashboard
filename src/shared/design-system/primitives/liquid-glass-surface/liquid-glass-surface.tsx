import type { HTMLAttributes, ReactNode } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-surface.module.scss';

export type LiquidGlassSurfaceSize = 'small' | 'medium' | 'large';
export type LiquidGlassSurfaceVariant = 'dynamic' | 'tinted' | 'plain';
export type LiquidGlassSurfaceTone = 'auto' | 'light' | 'dark';
export type LiquidGlassSurfaceRadius = 'pill' | 'md' | 'lg' | 'xl';
export type LiquidGlassSurfaceElement = 'div' | 'section' | 'article' | 'aside';

export type LiquidGlassSurfaceProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children: ReactNode;
  size?: LiquidGlassSurfaceSize;
  variant?: LiquidGlassSurfaceVariant;
  tone?: LiquidGlassSurfaceTone;
  radius?: LiquidGlassSurfaceRadius;
  elevated?: boolean;
  className?: string;
  as?: LiquidGlassSurfaceElement;
};

export function LiquidGlassSurface({
  children,
  size = 'medium',
  variant = 'dynamic',
  tone = 'auto',
  radius = 'xl',
  elevated = true,
  className = '',
  as: Component = 'div',
  ...props
}: LiquidGlassSurfaceProps) {
  const classNames = [
    styles.surface,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    styles[`radius_${radius}`],
    elevated ? '' : styles.flat,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      className={classNames}
      data-size={size}
      data-variant={variant}
      data-tone={tone}
      data-radius={radius}
      data-elevated={elevated ? 'true' : 'false'}
      {...props}
    >
      <div className={styles.content}>{children}</div>
    </Component>
  );
}
