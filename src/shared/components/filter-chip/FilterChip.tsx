'use client';

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import styles from './FilterChip.module.scss';

const PRESS_FEEDBACK_MS = 160;

export type FilterChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaPressed?: boolean;
};

export function FilterChip({
  children,
  isSelected = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ariaPressed,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ...props
}: FilterChipProps) {
  const [isPressing, setIsPressing] = useState(false);
  const pressClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pressClearTimeoutRef.current) {
        clearTimeout(pressClearTimeoutRef.current);
      }
    };
  }, []);

  function clearPressTimeout() {
    if (pressClearTimeoutRef.current) {
      clearTimeout(pressClearTimeoutRef.current);
      pressClearTimeoutRef.current = null;
    }
  }

  function endPress() {
    clearPressTimeout();
    setIsPressing(false);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    clearPressTimeout();
    setIsPressing(true);
    pressClearTimeoutRef.current = setTimeout(() => {
      setIsPressing(false);
      pressClearTimeoutRef.current = null;
    }, PRESS_FEEDBACK_MS);

    event.currentTarget.setPointerCapture(event.pointerId);
    onPointerDown?.(event);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    endPress();
    onPointerUp?.(event);
  }

  function handlePointerLeave(event: ReactPointerEvent<HTMLButtonElement>) {
    endPress();
    onPointerLeave?.(event);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    endPress();
    onPointerCancel?.(event);
  }

  return (
    <button
      type={type}
      className={[styles.chip, className].filter(Boolean).join(' ')}
      data-active={isSelected ? 'true' : undefined}
      data-pressing={isPressing ? 'true' : undefined}
      aria-pressed={ariaPressed ?? (isSelected ? true : undefined)}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      {...props}
    >
      {children}
    </button>
  );
}
