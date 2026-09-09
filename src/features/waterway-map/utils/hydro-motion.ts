/** Detecta prefers-reduced-motion (client-only; default false no SSR). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hydroMapTransitionMs(reduced = prefersReducedMotion()): number {
  return reduced ? 0 : 1200;
}

/** Entrada cinematográfica curta após fit instantâneo (spike V2.7). */
export function hydroMapIntroEaseMs(reduced = prefersReducedMotion()): number {
  return reduced ? 0 : 850;
}
