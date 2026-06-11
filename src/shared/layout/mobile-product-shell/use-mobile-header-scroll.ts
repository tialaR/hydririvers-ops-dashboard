'use client';

import { useEffect, useState } from 'react';

export const MOBILE_HEADER_COMPACT_SCROLL_Y = 24;
export const MOBILE_PRODUCT_SCROLL_SELECTOR = '.hr-dashboard-scroll';

export function resolveMobileHeaderScrollOffset(scrollEl: Element | null) {
  if (scrollEl instanceof HTMLElement) {
    return scrollEl.scrollTop;
  }

  const offsets = [
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop,
  ];

  return Math.max(...offsets.filter((value) => Number.isFinite(value)));
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

        setIsCompact(
          resolveMobileHeaderScrollOffset(scrollEl) > MOBILE_HEADER_COMPACT_SCROLL_Y,
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
