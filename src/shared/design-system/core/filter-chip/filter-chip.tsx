'use client';

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

export type FilterChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode;
  selected?: boolean;
  ariaPressed?: boolean;
  pressFeedbackMs?: number;
};

export function FilterChip({
  children,
  selected = false,
  ariaPressed,
  pressFeedbackMs = 160,
  className = '',
  type = 'button',
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ...props
}: FilterChipProps) {
  const [pressing, setPressing] = useState(false);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (clearRef.current) clearTimeout(clearRef.current);
  }, []);

  function clearPress() {
    if (clearRef.current) clearTimeout(clearRef.current);
    clearRef.current = null;
    setPressing(false);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (clearRef.current) clearTimeout(clearRef.current);
    setPressing(true);
    clearRef.current = setTimeout(clearPress, pressFeedbackMs);
    event.currentTarget.setPointerCapture(event.pointerId);
    onPointerDown?.(event);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    clearPress();
    onPointerUp?.(event);
  }

  function handlePointerLeave(event: ReactPointerEvent<HTMLButtonElement>) {
    clearPress();
    onPointerLeave?.(event);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    clearPress();
    onPointerCancel?.(event);
  }

  return (
    <button
      type={type}
      className={className}
      data-ui-component="filter-chip"
      data-active={selected ? 'true' : undefined}
      data-pressing={pressing ? 'true' : undefined}
      aria-pressed={ariaPressed ?? (selected ? true : undefined)}
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
