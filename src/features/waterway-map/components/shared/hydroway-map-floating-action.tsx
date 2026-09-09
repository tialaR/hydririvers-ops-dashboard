'use client';

import type { MouseEvent, PointerEvent, ReactNode } from 'react';

import styles from './hydroway-map-floating-action.module.scss';

export type HydrowayMapFloatingActionSize = 'mobile' | 'desktop';

export type HydrowayMapFloatingActionProps = {
  icon: ReactNode;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerDownCapture?: (event: PointerEvent<HTMLButtonElement>) => void;
  onMouseDownCapture?: (event: MouseEvent<HTMLButtonElement>) => void;
  onDoubleClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  size?: HydrowayMapFloatingActionSize;
  className?: string;
  'data-testid'?: string;
  'data-control-key'?: string;
  'data-tooltip'?: string;
  ariaPressed?: boolean;
};

export function HydrowayMapFloatingAction({
  icon,
  ariaLabel,
  active = false,
  disabled = false,
  onClick,
  onPointerDown,
  onPointerDownCapture,
  onMouseDownCapture,
  onDoubleClick,
  title,
  size = 'mobile',
  className,
  'data-testid': dataTestId,
  'data-control-key': dataControlKey,
  'data-tooltip': dataTooltip,
  ariaPressed,
}: HydrowayMapFloatingActionProps) {
  return (
    <button
      type="button"
      className={[
        styles.action,
        size === 'desktop' ? styles.sizeDesktop : styles.sizeMobile,
        active ? styles.active : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerDownCapture={onPointerDownCapture}
      onMouseDownCapture={onMouseDownCapture}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      title={title}
      data-testid={dataTestId}
      data-control-key={dataControlKey}
      data-tooltip={dataTooltip}
    >
      <span className={styles.surface}>
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      </span>
    </button>
  );
}
