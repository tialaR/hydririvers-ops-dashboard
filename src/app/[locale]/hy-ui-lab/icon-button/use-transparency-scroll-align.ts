import { useLayoutEffect, useRef } from 'react';

function alignElementToScrollCenter(surface: HTMLElement, selector: string) {
  const target = surface.querySelector<HTMLElement>(selector);
  if (!target) {
    return 0;
  }

  const surfaceRect = surface.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const nextScrollTop =
    surface.scrollTop + targetRect.top - surfaceRect.top - surfaceRect.height / 2 + targetRect.height / 2;

  surface.scrollTop = Math.max(0, Math.round(nextScrollTop));
  return surface.scrollTop;
}

/** Alinha o card-probe ao centro do viewport de scroll na montagem (botões fixos por cima). */
export function useTransparencyScrollAlign() {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) {
      return;
    }

    alignElementToScrollCenter(surface, '[data-ui-glass-probe="true"]');
  }, []);

  return surfaceRef;
}

export function alignTransparencyProbe(surface: HTMLElement) {
  return alignElementToScrollCenter(surface, '[data-ui-glass-probe="true"]');
}

export function alignTransparencyRiverBand(surface: HTMLElement) {
  return alignElementToScrollCenter(surface, '[data-ui-scroll-river-band="true"]');
}

export function alignTransparencyAfterScrollTarget(surface: HTMLElement) {
  return alignElementToScrollCenter(surface, '[data-ui-after-scroll-target="true"]');
}
