import type { ReactNode } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import { LiquidGlassResizeHandle } from './liquid-glass-resize-handle';
import styles from './liquid-glass-window.module.scss';

export type LiquidGlassWindowPanelSize = 'sm' | 'md' | 'lg';
export type LiquidGlassWindowPanelTone = 'auto' | 'light' | 'dark';

export type LiquidGlassWindowPanelProps = {
  children: ReactNode;
  controls?: ReactNode;
  resizeHandle?: boolean;
  size?: LiquidGlassWindowPanelSize;
  tone?: LiquidGlassWindowPanelTone;
  className?: string;
};

export function LiquidGlassWindowPanel({
  children,
  controls,
  resizeHandle = false,
  size = 'md',
  tone = 'auto',
  className = '',
}: LiquidGlassWindowPanelProps) {
  const classNames = [
    styles.panel,
    styles[`size_${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      data-size={size}
      data-tone={tone}
    >
      {controls ? (
        <div className={styles.controlsSlot}>{controls}</div>
      ) : null}
      <div className={styles.body}>{children}</div>
      {resizeHandle ? <LiquidGlassResizeHandle /> : null}
    </div>
  );
}
