/**
 * Detecção de WebGL no browser (client-only).
 * Usada pelo spike para sinalizar readiness de MapLibre (V2.1c); V2.1b permanece em SVG.
 */
export function detectWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    return Boolean(context);
  } catch {
    return false;
  }
}
