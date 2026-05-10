'use client';

import { useEffect } from 'react';

function getScrollBarWidth() {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof window === 'undefined') return undefined;

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;
    const original = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
      overscrollBehavior: html.style.overscrollBehavior
    };

    const scrollbarWidth = getScrollBarWidth();
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : original.paddingRight;
    html.style.overscrollBehavior = 'contain';

    return () => {
      body.style.overflow = original.overflow;
      body.style.position = original.position;
      body.style.top = original.top;
      body.style.width = original.width;
      body.style.paddingRight = original.paddingRight;
      html.style.overscrollBehavior = original.overscrollBehavior;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
