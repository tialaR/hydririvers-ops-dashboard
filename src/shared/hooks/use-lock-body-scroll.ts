'use client';

import { useEffect } from 'react';

function getScrollBarWidth() {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

/** Multiple overlays (e.g. fullscreen filter + nested picker) may request lock concurrently. */
let globalLockDepth = 0;
let savedScrollY = 0;
let capturedOriginal: {
  overflow: string;
  position: string;
  top: string;
  width: string;
  paddingRight: string;
  overscrollBehavior: string;
} | null = null;

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof window === 'undefined') return undefined;

    const body = document.body;
    const html = document.documentElement;

    if (globalLockDepth === 0) {
      savedScrollY = window.scrollY;
      capturedOriginal = {
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
      body.style.top = `-${savedScrollY}px`;
      body.style.width = '100%';
      body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : capturedOriginal.paddingRight;
      html.style.overscrollBehavior = 'contain';
    }

    globalLockDepth += 1;

    return () => {
      globalLockDepth -= 1;
      if (globalLockDepth > 0 || !capturedOriginal) return;

      const orig = capturedOriginal;
      capturedOriginal = null;
      body.style.overflow = orig.overflow;
      body.style.position = orig.position;
      body.style.top = orig.top;
      body.style.width = orig.width;
      body.style.paddingRight = orig.paddingRight;
      html.style.overscrollBehavior = orig.overscrollBehavior;
      window.scrollTo(0, savedScrollY);
    };
  }, [locked]);
}
