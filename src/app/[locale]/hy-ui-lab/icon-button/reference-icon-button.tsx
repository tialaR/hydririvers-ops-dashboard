'use client';

import { SlidersHorizontal } from 'lucide-react';
import type { ButtonHTMLAttributes, SyntheticEvent } from 'react';

import { useIconButtonPress } from '@/shared/components/icon-button/use-icon-button-press';

import styles from './reference-icon-button.module.sass';

export type ReferenceIconButtonPressState = 'idle' | 'pressed' | 'release';

type ReferenceIconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  ariaLabel: string;
  /** Lab snapshot only — overrides hook press state for deterministic rows. */
  labPressState?: ReferenceIconButtonPressState;
  labFocusVisible?: boolean;
};

/**
 * DevTools literal reference — 76px shell, blur(14px), 34px icon.
 * Lives only in hy-ui-lab; production IconButton must not copy these literals globally.
 */
export function ReferenceIconButton({
  ariaLabel,
  labPressState,
  labFocusVisible = false,
  className = '',
  disabled = false,
  type = 'button',
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  ...props
}: ReferenceIconButtonProps) {
  const { pressState, pressHandlers } = useIconButtonPress({ disabled, enabled: labPressState == null });

  const resolvedPress = labPressState ?? pressState;

  const mergeHandlers = <T extends SyntheticEvent<HTMLButtonElement>>(
    ours: ((event: T) => void) | undefined,
    theirs: ((event: T) => void) | undefined,
  ) => {
    if (!ours) return theirs;
    if (!theirs) return ours;
    return (event: T) => {
      ours(event);
      theirs(event);
    };
  };

  return (
    <button
      type={type}
      className={[styles.button, labFocusVisible ? styles.labFocusVisible : '', className].filter(Boolean).join(' ')}
      data-reference-icon-button="true"
      data-press={resolvedPress}
      data-lab-focus={labFocusVisible ? 'true' : undefined}
      aria-label={ariaLabel}
      disabled={disabled}
      onPointerDown={mergeHandlers(pressHandlers.onPointerDown, onPointerDown)}
      onPointerUp={mergeHandlers(pressHandlers.onPointerUp, onPointerUp)}
      onPointerLeave={mergeHandlers(pressHandlers.onPointerLeave, onPointerLeave)}
      onPointerCancel={mergeHandlers(pressHandlers.onPointerCancel, onPointerCancel)}
      onKeyDown={mergeHandlers(pressHandlers.onKeyDown, onKeyDown)}
      onKeyUp={mergeHandlers(pressHandlers.onKeyUp, onKeyUp)}
      {...props}
    >
      <span className={styles.bubbleGlow} aria-hidden />
      <span className={styles.icon} aria-hidden>
        <SlidersHorizontal size={34} strokeWidth={2} aria-hidden />
      </span>
    </button>
  );
}
