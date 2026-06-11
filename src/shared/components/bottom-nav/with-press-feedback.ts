import type { MouseEvent } from 'react';

/** Aligned to `--hy-motion-press-duration` (160ms); clamp for nav feedback. */
export const BOTTOM_NAV_PRESS_DELAY_MS = 140;

export function shouldBypassPressFeedback(event: Pick<MouseEvent, 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'button'>): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

export function runWithPressFeedback(
  event: MouseEvent,
  action: () => void,
  options?: {
    delayMs?: number;
    onPressStart?: () => void;
    onPressEnd?: () => void;
  },
): void {
  if (shouldBypassPressFeedback(event)) {
    action();
    return;
  }

  event.preventDefault();
  options?.onPressStart?.();

  window.setTimeout(() => {
    options?.onPressEnd?.();
    action();
  }, options?.delayMs ?? BOTTOM_NAV_PRESS_DELAY_MS);
}
