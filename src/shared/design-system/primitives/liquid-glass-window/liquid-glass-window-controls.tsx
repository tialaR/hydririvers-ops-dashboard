import type { MouseEventHandler } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-window.module.scss';

export type LiquidGlassWindowControlsState = 'active' | 'inactive';

export type LiquidGlassWindowControlsProps = {
  state?: LiquidGlassWindowControlsState;
  onClose?: () => void;
  onMinimize?: () => void;
  onExpand?: () => void;
  className?: string;
};

export function LiquidGlassWindowControls({
  state = 'active',
  onClose,
  onMinimize,
  onExpand,
  className = '',
}: LiquidGlassWindowControlsProps) {
  const classNames = [styles.controls, className].filter(Boolean).join(' ');
  const hasCallbacks = Boolean(onClose || onMinimize || onExpand);

  const renderDot = (
    dotClass: string,
    ariaLabel: string,
    onClick?: MouseEventHandler<HTMLButtonElement>,
  ) => {
    const classes = [styles.dot, dotClass, onClick ? styles.dotButton : '']
      .filter(Boolean)
      .join(' ');

    if (onClick) {
      return (
        <button
          type="button"
          className={classes}
          aria-label={ariaLabel}
          onClick={onClick}
        />
      );
    }

    return <span className={classes} aria-hidden />;
  };

  return (
    <div
      className={classNames}
      data-state={state}
      role={hasCallbacks ? 'group' : undefined}
      aria-label={hasCallbacks ? 'Controles da janela' : undefined}
    >
      {renderDot(styles.dotClose, 'Fechar', onClose)}
      {renderDot(styles.dotMinimize, 'Minimizar', onMinimize)}
      {renderDot(styles.dotExpand, 'Expandir', onExpand)}
    </div>
  );
}
