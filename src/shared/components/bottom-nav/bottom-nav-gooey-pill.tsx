'use client';

import { m } from 'motion/react';

import {
  BOTTOM_NAV_ACTIVE_PILL_LAYOUT_ID,
  BOTTOM_NAV_BUBBLE_PRESS_SCALE_X,
  BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y,
  BOTTOM_NAV_ROUTE_COMMIT_SCALE_X,
  BOTTOM_NAV_ROUTE_COMMIT_SCALE_Y,
  BOTTOM_NAV_ROUTE_COMMIT_TRANSLATE_Y_REM,
  bottomNavBubblePressInSpring,
  bottomNavBubblePressOutSpring,
  bottomNavPillSpring,
  bottomNavRouteCommitSpring,
} from './bottom-nav-motion';

type HyLiquidGlassPillLayerProps = {
  surfaceClassName?: string;
  rimClassName?: string;
  isRouteCommitCycle: boolean;
  isRouteCommitAnimating: boolean;
};

/** Decorative glass stack — surface + rim stay below icon/label. */
function HyLiquidGlassPillLayers({
  surfaceClassName,
  rimClassName,
  isRouteCommitCycle,
  isRouteCommitAnimating,
}: HyLiquidGlassPillLayerProps) {
  const liquidCommitActive = isRouteCommitCycle || isRouteCommitAnimating;

  return (
    <>
      {surfaceClassName ? (
        <span
          className={surfaceClassName}
          data-hy-liquid-glass-surface="true"
          data-hy-liquid-commit={liquidCommitActive ? 'true' : undefined}
          aria-hidden="true"
        />
      ) : null}
      {rimClassName ? (
        <span
          className={rimClassName}
          data-hy-liquid-glass-rim="true"
          data-hy-liquid-commit={liquidCommitActive ? 'true' : undefined}
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}

function elasticPillMotion(pressing: boolean, isRouteCommitAnimating: boolean) {
  if (isRouteCommitAnimating) {
    return {
      scaleX: BOTTOM_NAV_ROUTE_COMMIT_SCALE_X,
      scaleY: BOTTOM_NAV_ROUTE_COMMIT_SCALE_Y,
      y: `${BOTTOM_NAV_ROUTE_COMMIT_TRANSLATE_Y_REM}rem`,
    };
  }

  if (pressing) {
    return {
      scaleX: BOTTOM_NAV_BUBBLE_PRESS_SCALE_X,
      scaleY: BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y,
      y: 0,
    };
  }

  return {
    scaleX: 1,
    scaleY: 1,
    y: 0,
  };
}

export type BottomNavActivePillProps = {
  pressing: boolean;
  isRouteCommitAnimating: boolean;
  isRouteCommitCycle: boolean;
  reducedMotion: boolean;
  bubbleClassName: string;
  surfaceClassName?: string;
  rimClassName?: string;
};

/** Decorative active pill — local to confirmed route item, shared layoutId for slide. */
export function BottomNavActivePill({
  pressing,
  isRouteCommitAnimating,
  isRouteCommitCycle,
  reducedMotion,
  bubbleClassName,
  surfaceClassName,
  rimClassName,
}: BottomNavActivePillProps) {
  const pressTransition = pressing ? bottomNavBubblePressInSpring : bottomNavBubblePressOutSpring;
  const scaleTransition =
    isRouteCommitAnimating || isRouteCommitCycle ? bottomNavRouteCommitSpring : pressTransition;

  const layerProps = {
    surfaceClassName,
    rimClassName,
    isRouteCommitAnimating,
    isRouteCommitCycle,
  };

  if (reducedMotion) {
    return (
      <span
        className={bubbleClassName}
        data-bottom-nav-active-bubble="true"
        data-bottom-nav-bubble-pressing={pressing ? 'true' : undefined}
        data-bottom-nav-route-commit={isRouteCommitCycle ? 'true' : undefined}
        data-bottom-nav-route-commit-peak={isRouteCommitAnimating ? 'true' : undefined}
        aria-hidden="true"
      >
        <HyLiquidGlassPillLayers {...layerProps} />
      </span>
    );
  }

  return (
    <m.span
      layoutId={BOTTOM_NAV_ACTIVE_PILL_LAYOUT_ID}
      className={bubbleClassName}
      data-bottom-nav-active-bubble="true"
      data-bottom-nav-bubble-pressing={pressing ? 'true' : undefined}
      data-bottom-nav-route-commit={isRouteCommitCycle ? 'true' : undefined}
      data-bottom-nav-route-commit-peak={isRouteCommitAnimating ? 'true' : undefined}
      aria-hidden="true"
      layout="position"
      initial={false}
      animate={elasticPillMotion(pressing, isRouteCommitAnimating)}
      transition={{
        layout: bottomNavPillSpring,
        scaleX: scaleTransition,
        scaleY: scaleTransition,
        y: scaleTransition,
      }}
      style={{ transformOrigin: 'center center' }}
    >
      <HyLiquidGlassPillLayers {...layerProps} />
    </m.span>
  );
}
