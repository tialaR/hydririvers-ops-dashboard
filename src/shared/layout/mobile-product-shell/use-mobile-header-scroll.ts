'use client';

import { useEffect, useState } from 'react';

export const MOBILE_HEADER_COMPACT_SCROLL_Y = 24;
/** Hysteresis band — avoids compact/rest flicker when scroll offset hovers near the threshold. */
export const MOBILE_HEADER_EXPAND_SCROLL_Y = 8;
export const MOBILE_PRODUCT_SCROLL_SELECTOR = '.hr-dashboard-scroll';

export function resolveMobileHeaderCompactState(
  scrollOffset: number,
  isCurrentlyCompact: boolean,
) {
  if (isCurrentlyCompact) {
    return scrollOffset > MOBILE_HEADER_EXPAND_SCROLL_Y;
  }

  return scrollOffset > MOBILE_HEADER_COMPACT_SCROLL_Y;
}

export function resolveMobileHeaderScrollOffset(scrollEl: Element | null) {
  const windowOffset = Math.max(
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop,
  );

  if (scrollEl instanceof HTMLElement) {
    const elementOffset = scrollEl.scrollTop;
    const elementScrolls = scrollEl.scrollHeight > scrollEl.clientHeight + 1;

    if (!elementScrolls) {
      return windowOffset;
    }

    return Math.max(elementOffset, windowOffset);
  }

  return windowOffset;
}

export function useMobileHeaderScroll() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    let frame = 0;
    let scrollEl = document.querySelector(MOBILE_PRODUCT_SCROLL_SELECTOR);

    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!scrollEl || !document.contains(scrollEl)) {
          scrollEl = document.querySelector(MOBILE_PRODUCT_SCROLL_SELECTOR);
        }

        setIsCompact((prev) =>
          resolveMobileHeaderCompactState(resolveMobileHeaderScrollOffset(scrollEl), prev),
        );
      });
    };

    const onScroll = () => {
      update();
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    scrollEl?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, { capture: true });
      scrollEl?.removeEventListener('scroll', onScroll);
    };
  }, []);

  return isCompact;
}
