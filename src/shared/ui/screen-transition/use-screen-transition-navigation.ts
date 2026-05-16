'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  SCREEN_EXIT_ANIMATION_MS,
  SCREEN_TRANSITION_LEAVE_EVENT,
} from './screen-transition.constants';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function dispatchScreenLeaveEvent(): void {
  window.dispatchEvent(new Event(SCREEN_TRANSITION_LEAVE_EVENT));
}

export function useScreenTransitionNavigation() {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const clearPendingNavigation = useCallback(() => {
    if (timeoutRef.current === null) {
      return;
    }

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearPendingNavigation();
    };
  }, [clearPendingNavigation]);

  const navigateWithTransition = useCallback(
    (href: string) => {
      clearPendingNavigation();

      if (shouldReduceMotion()) {
        router.push(href);
        return;
      }

      setIsLeaving(true);
      dispatchScreenLeaveEvent();

      timeoutRef.current = window.setTimeout(() => {
        router.push(href);
      }, SCREEN_EXIT_ANIMATION_MS);
    },
    [clearPendingNavigation, router],
  );

  const prefetchScreen = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router],
  );

  return {
    isLeaving,
    navigateWithTransition,
    prefetchScreen,
  };
}
