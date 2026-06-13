'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

export type IconButtonPressState = 'idle' | 'pressed' | 'release';

export const ICON_BUTTON_PRESS_RELEASE_MS = 180;

type UseIconButtonPressOptions = {
  disabled?: boolean;
  enabled?: boolean;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', onStoreChange);

  return () => {
    mediaQuery.removeEventListener('change', onStoreChange);
  };
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
}

export function resolvePressStateAfterPointerDown(disabled: boolean): IconButtonPressState {
  return disabled ? 'idle' : 'pressed';
}

export function resolvePressStateAfterPointerUp(
  disabled: boolean,
  prefersReducedMotion: boolean,
): IconButtonPressState {
  if (disabled) {
    return 'idle';
  }

  return prefersReducedMotion ? 'idle' : 'release';
}

export function useIconButtonPress({
  disabled = false,
  enabled = true,
}: UseIconButtonPressOptions = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [pressState, setPressState] = useState<IconButtonPressState>('idle');
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPressingRef = useRef(false);

  const clearReleaseTimer = useCallback(() => {
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearReleaseTimer();
    };
  }, [clearReleaseTimer]);

  const startPress = useCallback(() => {
    if (!enabled || disabled) {
      return;
    }

    clearReleaseTimer();
    isPressingRef.current = true;
    setPressState(resolvePressStateAfterPointerDown(disabled));
  }, [clearReleaseTimer, disabled, enabled]);

  const endPress = useCallback(() => {
    if (!enabled || disabled || !isPressingRef.current) {
      return;
    }

    isPressingRef.current = false;
    clearReleaseTimer();

    const nextState = resolvePressStateAfterPointerUp(disabled, prefersReducedMotion);
    setPressState(nextState);

    if (nextState === 'release') {
      releaseTimerRef.current = setTimeout(() => {
        setPressState('idle');
        releaseTimerRef.current = null;
      }, ICON_BUTTON_PRESS_RELEASE_MS);
    }
  }, [clearReleaseTimer, disabled, enabled, prefersReducedMotion]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) {
        return;
      }

      startPress();
    },
    [startPress],
  );

  const handlePointerUp = useCallback(() => {
    endPress();
  }, [endPress]);

  const handlePointerLeave = useCallback(() => {
    endPress();
  }, [endPress]);

  const handlePointerCancel = useCallback(() => {
    endPress();
  }, [endPress]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      if (event.repeat) {
        return;
      }

      event.preventDefault();
      startPress();
    },
    [startPress],
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      endPress();
    },
    [endPress],
  );

  const resolvedPressState =
    !enabled || disabled ? ('idle' as const) : pressState;

  return {
    pressState: resolvedPressState,
    pressHandlers: enabled
      ? {
          onPointerDown: handlePointerDown,
          onPointerUp: handlePointerUp,
          onPointerLeave: handlePointerLeave,
          onPointerCancel: handlePointerCancel,
          onKeyDown: handleKeyDown,
          onKeyUp: handleKeyUp,
        }
      : {},
  };
}
