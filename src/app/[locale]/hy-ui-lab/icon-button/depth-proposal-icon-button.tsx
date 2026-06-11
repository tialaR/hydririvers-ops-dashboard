'use client';

import { SlidersHorizontal } from 'lucide-react';
import type { ButtonHTMLAttributes, SyntheticEvent } from 'react';

import { useIconButtonPress } from '@/shared/components/icon-button/use-icon-button-press';

import styles from './depth-proposal-icon-button.module.sass';

export type DepthProposalPressState = 'idle' | 'pressed' | 'release';

type DepthProposalIconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  ariaLabel: string;
  /** Lab snapshot only — overrides hook press state for deterministic rows. */
  labPressState?: DepthProposalPressState;
  labFocusVisible?: boolean;
};

/**
 * Lab-only depth candidate — BottomMenu glass density at production IconButton size.
 * Not for production until explicitly authorized.
 */
export function DepthProposalIconButton({
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
}: DepthProposalIconButtonProps) {
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
      data-depth-proposal-icon-button="true"
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
        <SlidersHorizontal size={21} strokeWidth={2} aria-hidden />
      </span>
    </button>
  );
}
