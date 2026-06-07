'use client';

import { type ReactNode } from 'react';
import {
  LazyMotion,
  domMax,
  m,
  useReducedMotion,
  type Transition,
} from 'motion/react';

import { Link } from '@/core/i18n/navigation';

export const BOTTOM_NAV_ACTIVE_PILL_LAYOUT_ID = 'hy-bottom-nav-active-pill';

export const BOTTOM_NAV_PRESS_SCALE = 0.97;

export const BOTTOM_NAV_ACTIVE_ICON_PRESS_SCALE = 1.04;

export const BOTTOM_NAV_BUBBLE_PRESS_SCALE_X = 1.08;
export const BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y = 1.1;

/** @deprecated Use BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y */
export const BOTTOM_NAV_BUBBLE_PRESS_SCALE = BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y;

/** Gooey slide — viscous stretch between confirmed routes. */
export const bottomNavPillSpring: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 20,
  mass: 1.05,
};

/** Active icon/label settle when pill arrives on item. */
export const bottomNavContentSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
  mass: 0.72,
};

/** Bubble press-in — expand on active item pointer down. */
export const bottomNavBubblePressInSpring: Transition = {
  type: 'spring',
  stiffness: 680,
  damping: 28,
  mass: 0.48,
};

/** Bubble release — elastic return to rest. */
export const bottomNavBubblePressOutSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 16,
  mass: 0.78,
};

/** Item tap compression — no navigation bounce. */
export const bottomNavPressSpring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.72,
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

export { MotionButton, MotionLink, MotionSpan };
