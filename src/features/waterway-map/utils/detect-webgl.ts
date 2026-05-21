/**
 * Detecção de WebGL no browser (client-only).
 * Resultado em cache no módulo — não criar contexto WebGL a cada render.
 */
let cachedWebGLSupport: boolean | null = null;

function releaseWebGLProbeContext(
  context: WebGLRenderingContext | WebGL2RenderingContext | null,
): void {
  if (!context) return;

  const loseExtension = context.getExtension('WEBGL_lose_context');
  loseExtension?.loseContext();
}

export function detectWebGLSupport(): boolean {
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  if (typeof window === 'undefined') {
    cachedWebGLSupport = false;
    return cachedWebGLSupport;
  }

  let context: WebGLRenderingContext | WebGL2RenderingContext | null = null;

  try {
    const canvas = document.createElement('canvas');
    context =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    releaseWebGLProbeContext(context);
    canvas.width = 0;
    canvas.height = 0;
    cachedWebGLSupport = Boolean(context);
  } catch {
    cachedWebGLSupport = false;
  }

  return cachedWebGLSupport;
}

/** Apenas testes — reinicia cache de detecção. */
export function resetWebGLSupportCacheForTests(): void {
  cachedWebGLSupport = null;
}
