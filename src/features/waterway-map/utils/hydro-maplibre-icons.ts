import type { Map as MapLibreMap } from 'maplibre-gl';

const ICON_IDS = [
  'hydro-origin',
  'hydro-destination',
  'hydro-vessel',
  'hydro-vessel-halo',
  'hydro-port',
  'hydro-terminal',
] as const;

export type HydroMapLibreIconId = (typeof ICON_IDS)[number];

function drawRingIcon(
  ctx: CanvasRenderingContext2D,
  size: number,
  fill: string,
  ring: string,
): void {
  const center = size / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(center, center, size * 0.34, 0, Math.PI * 2);
  ctx.strokeStyle = ring;
  ctx.lineWidth = size * 0.07;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(center, center, size * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = '#041018';
  ctx.lineWidth = size * 0.04;
  ctx.stroke();
}

function drawVesselIcon(ctx: CanvasRenderingContext2D, size: number, halo: boolean): void {
  const center = size / 2;
  ctx.clearRect(0, 0, size, size);

  if (halo) {
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.46);
    gradient.addColorStop(0, 'rgba(47, 224, 208, 0.55)');
    gradient.addColorStop(1, 'rgba(47, 224, 208, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.44, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillStyle = '#2fe0d0';
  ctx.strokeStyle = '#041018';
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.moveTo(center, size * 0.22);
  ctx.lineTo(center + size * 0.16, center + size * 0.08);
  ctx.lineTo(center + size * 0.1, size * 0.72);
  ctx.lineTo(center - size * 0.1, size * 0.72);
  ctx.lineTo(center - size * 0.16, center + size * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawPortIcon(ctx: CanvasRenderingContext2D, size: number, terminal: boolean): void {
  const center = size / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = '#041018';
  ctx.lineWidth = size * 0.06;

  if (terminal) {
    ctx.fillStyle = 'rgba(120, 210, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(center, size * 0.22);
    ctx.lineTo(size * 0.78, center);
    ctx.lineTo(center, size * 0.78);
    ctx.lineTo(size * 0.22, center);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(4, 16, 24, 0.85)';
    ctx.fillRect(center - size * 0.06, center - size * 0.06, size * 0.12, size * 0.12);
    return;
  }

  ctx.fillStyle = 'rgba(226, 240, 248, 0.9)';
  ctx.beginPath();
  ctx.arc(center, center, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(center, center, size * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(47, 224, 208, 0.85)';
  ctx.fill();
}

function iconToImageData(size: number, draw: (ctx: CanvasRenderingContext2D) => void): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('canvas-2d-unavailable');
  }
  draw(ctx);
  return ctx.getImageData(0, 0, size, size);
}

const ICON_BUILDERS: Record<HydroMapLibreIconId, () => ImageData> = {
  'hydro-origin': () => iconToImageData(64, (ctx) => drawRingIcon(ctx, 64, '#2fe0d0', 'rgba(47, 224, 208, 0.65)')),
  'hydro-destination': () => iconToImageData(64, (ctx) => drawRingIcon(ctx, 64, '#78d4ff', 'rgba(120, 210, 255, 0.65)')),
  'hydro-vessel': () => iconToImageData(64, (ctx) => drawVesselIcon(ctx, 64, false)),
  'hydro-vessel-halo': () => iconToImageData(96, (ctx) => drawVesselIcon(ctx, 96, true)),
  'hydro-port': () => iconToImageData(40, (ctx) => drawPortIcon(ctx, 40, false)),
  'hydro-terminal': () => iconToImageData(40, (ctx) => drawPortIcon(ctx, 40, true)),
};

/** Registra ícones gerados por canvas (sem sprite externo). */
export function registerHydroMapLibreImages(map: MapLibreMap): void {
  for (const iconId of ICON_IDS) {
    if (map.hasImage(iconId)) continue;
    map.addImage(iconId, ICON_BUILDERS[iconId](), { pixelRatio: 2 });
  }
}
