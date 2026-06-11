'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  LayoutGroup,
  LazyMotion,
  domMax,
  m,
  useReducedMotion,
  type Transition,
} from 'motion/react';

import { Link } from '@/core/i18n/navigation';

export const BOTTOM_NAV_ACTIVE_PILL_LAYOUT_ID = 'hy-bottom-nav-active-pill';

export const BOTTOM_NAV_PRESS_SCALE = 0.98;

export const BOTTOM_NAV_ACTIVE_ICON_PRESS_SCALE = 1.04;

export const BOTTOM_NAV_ROUTE_COMMIT_SCALE_X = 1.04;
export const BOTTOM_NAV_ROUTE_COMMIT_SCALE_Y = 1.14;
export const BOTTOM_NAV_ROUTE_COMMIT_TRANSLATE_Y_REM = -0.09375;
export const BOTTOM_NAV_ROUTE_COMMIT_ICON_SCALE = 1.08;
export const BOTTOM_NAV_ROUTE_COMMIT_ICON_LIFT_REM = 0.125;
/** Full commit cycle — peak hold plus spring settle. */
export const BOTTOM_NAV_ROUTE_COMMIT_DURATION_MS = 520;
/** Hold expanded scale before spring release. */
export const BOTTOM_NAV_ROUTE_COMMIT_PEAK_MS = 420;

export const BOTTOM_NAV_BUBBLE_PRESS_SCALE_X = 1.02;
export const BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y = 1.08;

/** @deprecated Use BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y */
export const BOTTOM_NAV_BUBBLE_PRESS_SCALE = BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y;

/** Segmented pill slide — Apple-like spring between confirmed routes. */
export const bottomNavPillSpring: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 30,
  mass: 0.85,
};

/** Active icon/label settle when pill arrives on item. */
export const bottomNavContentSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 26,
  mass: 0.78,
};

/** Bubble press-in — expand on active item pointer down. */
export const bottomNavBubblePressInSpring: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 20,
  mass: 0.62,
};

/** Bubble release — soft return without bounce. */
export const bottomNavBubblePressOutSpring: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 24,
  mass: 0.88,
};

/** Item tap compression — no navigation bounce. */
export const bottomNavPressSpring: Transition = {
  type: 'spring',
  stiffness: 360,
  damping: 28,
  mass: 0.78,
};

/** Route commit morph — brief grow when pathname confirms, settles without bounce. */
export const bottomNavRouteCommitSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 26,
  mass: 0.68,
};

export function bottomNavItemTapProps(reducedMotion: boolean, isVisualActive: boolean) {
  if (reducedMotion || isVisualActive) {
    return {};
  }

  return {
    whileTap: { scale: BOTTOM_NAV_PRESS_SCALE },
    transition: bottomNavPressSpring,
  };
}

export function bottomNavActiveIconPressScale(pressing: boolean, reducedMotion: boolean): number {
  if (reducedMotion) {
    return 1;
  }

  return pressing ? BOTTOM_NAV_ACTIVE_ICON_PRESS_SCALE : 1;
}

export function useBottomNavReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}

/** Increments when confirmed activeId changes — drives route-commit morph on the new item. */
export function useBottomNavRouteCommitNonce(activeId: string): number {
  const [routeCommitNonce, setRouteCommitNonce] = useState(0);
  const previousActiveIdRef = useRef(activeId);

  useEffect(() => {
    if (previousActiveIdRef.current === activeId) {
      return;
    }

    previousActiveIdRef.current = activeId;
    setRouteCommitNonce((value) => value + 1);
  }, [activeId]);

  return routeCommitNonce;
}

/** Peak boolean — commit=true expands scale; commit=false springs back to 1. */
export function useBottomNavRouteCommitAnimating(routeCommitNonce: number): boolean {
  const [settledNonce, setSettledNonce] = useState(0);

  useEffect(() => {
    if (routeCommitNonce <= settledNonce) {
      return undefined;
    }

    const timer = window.setTimeout(
      () => setSettledNonce(routeCommitNonce),
      BOTTOM_NAV_ROUTE_COMMIT_PEAK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [routeCommitNonce, settledNonce]);

  return routeCommitNonce > settledNonce;
}

/** Whole commit cycle — markers and glass stay lit through peak + settle. */
export function useBottomNavRouteCommitCycle(routeCommitNonce: number): boolean {
  const [cycleNonce, setCycleNonce] = useState(0);

  useEffect(() => {
    if (routeCommitNonce <= cycleNonce) {
      return undefined;
    }

    const timer = window.setTimeout(
      () => setCycleNonce(routeCommitNonce),
      BOTTOM_NAV_ROUTE_COMMIT_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [routeCommitNonce, cycleNonce]);

  return routeCommitNonce > cycleNonce;
}

const MotionLink = m.create(Link);
const MotionButton = m.button;
const MotionSpan = m.span;

export function BottomNavMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}

export { LayoutGroup, MotionButton, MotionLink, MotionSpan };
