'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefCallback,
} from 'react';

import {
  computeBottomNavActiveX,
  computeBottomNavContainerMinWidth,
  measureBottomNavSelectionWidth,
} from './bottom-nav-measurement';
import {
  BOTTOM_NAV_ICON_JUMP_DEBOUNCE_MS,
  BOTTOM_NAV_ICON_JUMP_DURATION_MS,
  BOTTOM_NAV_STRETCH_DURATION_MS,
} from './bottom-nav-motion-tokens';

export type UseBottomNavIndicatorResult = {
  navRef: React.RefObject<HTMLElement | null>;
  registerItemRef: (id: string) => RefCallback<HTMLElement>;
  navStyle: CSSProperties;
  isStretching: boolean;
  jumpingIndex: number | null;
};

const POSITION_EPSILON_PX = 0.5;

export function useBottomNavIndicator(
  activeItemId: string,
  activeIndex: number,
  itemCount: number,
  reducedMotion: boolean,
): UseBottomNavIndicatorResult {
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const selectionWidthRef = useRef(0);
  const containerMinWidthRef = useRef(0);
  const stretchPreviousIndexRef = useRef(activeIndex);
  const jumpPreviousIndexRef = useRef(activeIndex);
  const skipInitialJumpRef = useRef(true);
  const stretchTimerRef = useRef<number | null>(null);
  const jumpTimerRef = useRef<number | null>(null);
  const lastJumpRef = useRef<{ id: string; index: number; at: number } | null>(null);

  const [activeX, setActiveX] = useState(0);
  const [selectionWidth, setSelectionWidth] = useState(0);
  const [containerMinWidth, setContainerMinWidth] = useState(0);
  const [isStretching, setIsStretching] = useState(false);
  const [stretchDirection, setStretchDirection] = useState(1);
  const [jumpingIndex, setJumpingIndex] = useState<number | null>(null);

  const measureSelectionWidth = useCallback(() => {
    const nav = navRef.current;

    if (!nav || itemRefs.current.size === 0) {
      return 0;
    }

    const nextWidth = measureBottomNavSelectionWidth(nav, itemRefs.current.values());

    if (Math.abs(selectionWidthRef.current - nextWidth) > POSITION_EPSILON_PX) {
      selectionWidthRef.current = nextWidth;
      setSelectionWidth(nextWidth);
    }

    return nextWidth;
  }, []);

  const measureActivePosition = useCallback((id: string, widthOverride?: number) => {
    const nav = navRef.current;
    const activeItem = itemRefs.current.get(id);
    const width = widthOverride ?? selectionWidthRef.current;

    if (!nav || !activeItem || width <= 0) {
      return;
    }

    const nextX = computeBottomNavActiveX(nav, activeItem, width);

    setActiveX((previous) =>
      Math.abs(previous - nextX) > POSITION_EPSILON_PX ? nextX : previous,
    );
  }, []);

  const measureContainerMinWidth = useCallback(
    (width: number) => {
      const nav = navRef.current;

      if (!nav || width <= 0) {
        if (containerMinWidthRef.current !== 0) {
          containerMinWidthRef.current = 0;
          setContainerMinWidth(0);
        }
        return 0;
      }

      const nextMinWidth = computeBottomNavContainerMinWidth(nav, width, itemCount);

      if (Math.abs(containerMinWidthRef.current - nextMinWidth) > POSITION_EPSILON_PX) {
        containerMinWidthRef.current = nextMinWidth;
        setContainerMinWidth(nextMinWidth);
      }

      return nextMinWidth;
    },
    [itemCount],
  );

  const measureLayout = useCallback(
    (id: string) => {
      const width = measureSelectionWidth();
      measureContainerMinWidth(width);
      measureActivePosition(id, width);
    },
    [measureActivePosition, measureContainerMinWidth, measureSelectionWidth],
  );

  const registerItemRef = useCallback(
    (id: string): RefCallback<HTMLElement> =>
      (node) => {
        if (node) {
          itemRefs.current.set(id, node);
          return;
        }

        itemRefs.current.delete(id);
      },
    [],
  );

  const clearIconJump = useCallback(() => {
    if (jumpTimerRef.current) {
      window.clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = null;
    }

    setJumpingIndex(null);
  }, []);

  const triggerIconJump = useCallback(
    (itemId: string, itemIndex: number) => {
      if (reducedMotion) {
        return;
      }

      const now = Date.now();
      const lastJump = lastJumpRef.current;

      if (
        lastJump &&
        lastJump.id === itemId &&
        now - lastJump.at < BOTTOM_NAV_ICON_JUMP_DEBOUNCE_MS
      ) {
        return;
      }

      lastJumpRef.current = { id: itemId, index: itemIndex, at: now };

      if (jumpTimerRef.current) {
        window.clearTimeout(jumpTimerRef.current);
        jumpTimerRef.current = null;
      }

      setJumpingIndex(null);

      window.requestAnimationFrame(() => {
        setJumpingIndex(itemIndex);

        jumpTimerRef.current = window.setTimeout(() => {
          clearIconJump();
          lastJumpRef.current = null;
        }, BOTTOM_NAV_ICON_JUMP_DURATION_MS);
      });
    },
    [clearIconJump, reducedMotion],
  );

  useLayoutEffect(() => {
    measureLayout(activeItemId);
  }, [activeItemId, itemCount, measureLayout]);

  useLayoutEffect(() => {
    if (containerMinWidth <= 0) {
      return;
    }

    measureActivePosition(activeItemId, selectionWidthRef.current);
  }, [activeItemId, containerMinWidth, measureActivePosition]);

  useEffect(() => {
    const previousIndex = stretchPreviousIndexRef.current;

    if (previousIndex === activeIndex) {
      return;
    }

    if (!reducedMotion) {
      setStretchDirection(activeIndex > previousIndex ? 1 : -1);
      setIsStretching(false);

      window.requestAnimationFrame(() => {
        measureActivePosition(activeItemId);
        setIsStretching(true);
      });

      if (stretchTimerRef.current) {
        window.clearTimeout(stretchTimerRef.current);
      }

      stretchTimerRef.current = window.setTimeout(() => {
        setIsStretching(false);
      }, BOTTOM_NAV_STRETCH_DURATION_MS);
    } else {
      measureActivePosition(activeItemId);
    }

    stretchPreviousIndexRef.current = activeIndex;
  }, [activeItemId, activeIndex, measureActivePosition, reducedMotion]);

  useEffect(() => {
    if (skipInitialJumpRef.current) {
      skipInitialJumpRef.current = false;
      jumpPreviousIndexRef.current = activeIndex;
      return;
    }

    const previousIndex = jumpPreviousIndexRef.current;

    if (previousIndex !== activeIndex) {
      triggerIconJump(activeItemId, activeIndex);
      jumpPreviousIndexRef.current = activeIndex;
    }
  }, [activeItemId, activeIndex, triggerIconJump]);

  useEffect(() => {
    function handleResize() {
      measureLayout(activeItemId);
    }

    window.addEventListener('resize', handleResize);

    const nav = navRef.current;
    let navObserver: ResizeObserver | undefined;
    let itemObservers: ResizeObserver[] = [];

    if (typeof ResizeObserver !== 'undefined') {
      if (nav) {
        navObserver = new ResizeObserver(() => {
          measureLayout(activeItemId);
        });
        navObserver.observe(nav);
      }

      itemObservers = Array.from(itemRefs.current.values()).map((item) => {
        const observer = new ResizeObserver(() => {
          measureLayout(activeItemId);
        });
        observer.observe(item);
        return observer;
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      navObserver?.disconnect();
      itemObservers.forEach((observer) => observer.disconnect());

      if (stretchTimerRef.current) {
        window.clearTimeout(stretchTimerRef.current);
      }

      if (jumpTimerRef.current) {
        window.clearTimeout(jumpTimerRef.current);
      }
    };
  }, [activeItemId, itemCount, measureLayout]);

  const navStyle = {
    '--active-x': `${activeX}px`,
    '--active-width': selectionWidth > 0 ? `${selectionWidth}px` : undefined,
    '--menu-measured-min-width':
      containerMinWidth > 0 ? `${containerMinWidth}px` : undefined,
    '--stretch-direction': stretchDirection,
  } as CSSProperties;

  return {
    navRef,
    registerItemRef,
    navStyle,
    isStretching,
    jumpingIndex,
  };
}
