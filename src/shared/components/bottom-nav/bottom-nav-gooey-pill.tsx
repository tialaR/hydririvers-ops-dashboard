'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import { m } from 'motion/react';

import {
  BOTTOM_NAV_BUBBLE_PRESS_SCALE_X,
  BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y,
  bottomNavBubblePressInSpring,
  bottomNavBubblePressOutSpring,
  bottomNavPillSpring,
} from './bottom-nav-motion';

const PILL_INSET_REM = 0.125;
const GOOEY_TAIL_CLEAR_MS = 520;

export type BottomNavGooeyPillMetrics = {
  x: number;
  width: number;
  height: number;
};

export function measureBottomNavGooeyPill(
  track: HTMLDivElement,
  cell: HTMLElement,
): BottomNavGooeyPillMetrics | null {
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const padPx = PILL_INSET_REM * rootFontSize;
  const trackRect = track.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();

  if (cellRect.width <= 0 || cellRect.height <= 0) {
    return null;
  }

  return {
    x: cellRect.left - trackRect.left + padPx,
    width: Math.max(cellRect.width - padPx * 2, 0),
    height: cellRect.height,
  };
}

export function useBottomNavGooeyPillMetrics(
  activeId: string,
  trackRef: RefObject<HTMLDivElement | null>,
  cellRefs: RefObject<Map<string, HTMLDivElement>>,
): BottomNavGooeyPillMetrics | null {
  const [metrics, setMetrics] = useState<BottomNavGooeyPillMetrics | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const cell = cellRefs.current.get(activeId);

    if (!track || !cell) {
      return undefined;
    }

    const update = () => {
      const next = measureBottomNavGooeyPill(track, cell);
      if (next) {
        setMetrics(next);
      }
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(track);
    resizeObserver.observe(cell);
    window.addEventListener('resize', update);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [activeId, cellRefs, trackRef]);

  return metrics;
}

function useBottomNavGooeyTailMetrics(
  activeId: string,
  trackRef: RefObject<HTMLDivElement | null>,
  cellRefs: RefObject<Map<string, HTMLDivElement>>,
  reducedMotion: boolean,
): BottomNavGooeyPillMetrics | null {
  const previousActiveIdRef = useRef(activeId);
  const [tailMetrics, setTailMetrics] = useState<BottomNavGooeyPillMetrics | null>(null);

  useLayoutEffect(() => {
    if (reducedMotion) {
      previousActiveIdRef.current = activeId;
      return undefined;
    }

    const previousActiveId = previousActiveIdRef.current;
    if (previousActiveId === activeId) {
      return undefined;
    }

    const track = trackRef.current;
    const previousCell = cellRefs.current.get(previousActiveId);
    previousActiveIdRef.current = activeId;

    if (!track || !previousCell) {
      return undefined;
    }

    const measured = measureBottomNavGooeyPill(track, previousCell);
    if (measured) {
      setTailMetrics(measured);
    }

    return undefined;
  }, [activeId, cellRefs, reducedMotion, trackRef]);

  useEffect(() => {
    if (!tailMetrics) {
      return undefined;
    }

    const timer = window.setTimeout(() => setTailMetrics(null), GOOEY_TAIL_CLEAR_MS);
    return () => window.clearTimeout(timer);
  }, [activeId, tailMetrics]);

  return tailMetrics;
}

type BottomNavGooeyPillLayerProps = {
  metrics: BottomNavGooeyPillMetrics;
  tailMetrics: BottomNavGooeyPillMetrics | null;
  bubblePressing: boolean;
  reducedMotion: boolean;
  bubbleClassName: string;
  liquidClassName?: string;
};

type GooeyLiquidLayerProps = {
  className?: string;
  bubblePressing: boolean;
  reducedMotion: boolean;
};

function GooeyLiquidLayer({ className, bubblePressing, reducedMotion }: GooeyLiquidLayerProps) {
  if (!className) {
    return null;
  }

  if (reducedMotion) {
    return <span className={className} aria-hidden="true" data-bottom-nav-active-liquid="true" />;
  }

  const pressTransition = bubblePressing ? bottomNavBubblePressInSpring : bottomNavBubblePressOutSpring;

  return (
    <m.span
      className={className}
      aria-hidden="true"
      data-bottom-nav-active-liquid="true"
      animate={liquidPressMotion(bubblePressing)}
      transition={{
        scaleX: pressTransition,
        scaleY: pressTransition,
        opacity: { duration: 0.16 },
      }}
      style={{ transformOrigin: 'center center', display: 'block' }}
    />
  );
}

const pillMotionStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  boxSizing: 'border-box' as const,
  transformOrigin: 'center center',
};

function pillPressMotion(bubblePressing: boolean) {
  return {
    scaleX: bubblePressing ? BOTTOM_NAV_BUBBLE_PRESS_SCALE_X : 1,
    scaleY: bubblePressing ? BOTTOM_NAV_BUBBLE_PRESS_SCALE_Y : 1,
  };
}

function liquidPressMotion(bubblePressing: boolean) {
  return {
    scaleX: bubblePressing ? 1.14 : 1,
    scaleY: bubblePressing ? 1.08 : 1,
    opacity: bubblePressing ? 1 : 0.88,
  };
}

export function BottomNavGooeyPillLayer({
  metrics,
  tailMetrics,
  bubblePressing,
  reducedMotion,
  bubbleClassName,
  liquidClassName,
}: BottomNavGooeyPillLayerProps) {
  const pressTransition = bubblePressing ? bottomNavBubblePressInSpring : bottomNavBubblePressOutSpring;

  if (reducedMotion) {
    return (
      <span
        className={bubbleClassName}
        data-bottom-nav-active-bubble="true"
        data-bottom-nav-bubble-pressing={bubblePressing ? 'true' : undefined}
        aria-hidden="true"
        style={{
          ...pillMotionStyle,
          transform: `translate3d(${metrics.x}px, 0, 0)`,
          width: metrics.width,
          height: metrics.height,
        }}
      >
        <GooeyLiquidLayer
          className={liquidClassName}
          bubblePressing={bubblePressing}
          reducedMotion={reducedMotion}
        />
      </span>
    );
  }

  return (
    <>
      {tailMetrics ? (
        <m.span
          key={`tail-${tailMetrics.x}`}
          className={bubbleClassName}
          data-bottom-nav-active-bubble-tail="true"
          aria-hidden="true"
          initial={false}
          animate={{
            x: tailMetrics.x,
            width: tailMetrics.width,
            height: tailMetrics.height,
            opacity: 1,
          }}
          transition={{ ...bottomNavPillSpring, opacity: { duration: 0.12, delay: 0.28 } }}
          style={pillMotionStyle}
        >
          <GooeyLiquidLayer
            className={liquidClassName}
            bubblePressing={false}
            reducedMotion={reducedMotion}
          />
        </m.span>
      ) : null}
      <m.span
        className={bubbleClassName}
        data-bottom-nav-active-bubble="true"
        data-bottom-nav-bubble-pressing={bubblePressing ? 'true' : undefined}
        aria-hidden="true"
        initial={
          tailMetrics
            ? {
                x: tailMetrics.x,
                width: tailMetrics.width,
                height: tailMetrics.height,
              }
            : false
        }
        animate={{
          x: metrics.x,
          width: metrics.width,
          height: metrics.height,
          ...pillPressMotion(bubblePressing),
        }}
        transition={{
          x: bottomNavPillSpring,
          width: bottomNavPillSpring,
          height: bottomNavPillSpring,
          scaleX: pressTransition,
          scaleY: pressTransition,
        }}
        style={pillMotionStyle}
      >
        <GooeyLiquidLayer
          className={liquidClassName}
          bubblePressing={bubblePressing}
          reducedMotion={reducedMotion}
        />
      </m.span>
    </>
  );
}

export function useBottomNavGooeyPillTransition(
  activeId: string,
  trackRef: RefObject<HTMLDivElement | null>,
  cellRefs: RefObject<Map<string, HTMLDivElement>>,
  reducedMotion: boolean,
) {
  const metrics = useBottomNavGooeyPillMetrics(activeId, trackRef, cellRefs);
  const tailMetrics = useBottomNavGooeyTailMetrics(activeId, trackRef, cellRefs, reducedMotion);

  return {
    metrics,
    tailMetrics: reducedMotion ? null : tailMetrics,
  };
}
