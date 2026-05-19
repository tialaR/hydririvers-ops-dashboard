import type { HydrowayMapCamera, HydrowayMapViewBox } from '../providers/map-provider.types';

export const HYDRO_MAP_VIEWBOX: HydrowayMapViewBox = {
  width: 1600,
  height: 900,
} as const;

export const HYDRO_MAP_INITIAL_CAMERA: HydrowayMapCamera = {
  x: 0,
  y: 0,
  width: HYDRO_MAP_VIEWBOX.width,
  height: HYDRO_MAP_VIEWBOX.height,
  zoom: 1,
};

/** Tokens compartilhados entre SVG schematic e style MapLibre (spike V2.3x). */
export const hydroMapStyleTokens = {
  background: '#04080d',
  backgroundDeep: '#020508',
  depthGlow: 'rgba(18, 52, 78, 0.55)',
  gridLine: 'rgba(90, 140, 185, 0.07)',
  gridLineBright: 'rgba(47, 224, 208, 0.05)',
  riverCasing: 'rgba(12, 48, 72, 0.85)',
  riverStroke: 'rgba(32, 118, 158, 0.55)',
  riverGlow: 'rgba(47, 224, 208, 0.18)',
  tributaryCasing: 'rgba(10, 36, 58, 0.75)',
  tributaryStroke: 'rgba(58, 108, 148, 0.42)',
  tributaryGlow: 'rgba(80, 150, 200, 0.12)',
  corridorStroke: 'rgba(47, 224, 208, 0.22)',
  corridorGlow: 'rgba(47, 120, 180, 0.28)',
  hydroviaStroke: 'rgba(120, 210, 255, 0.35)',
  canalStroke: 'rgba(170, 200, 230, 0.28)',
  routeTrack: 'rgba(47, 224, 208, 0.16)',
  routeTrackCasing: 'rgba(8, 28, 42, 0.65)',
  routeActive: 'rgba(47, 224, 208, 0.92)',
  routeActiveGlow: 'rgba(47, 224, 208, 0.38)',
  routeProgress: 'rgba(170, 255, 240, 0.95)',
  cityDot: 'rgba(226, 240, 248, 0.55)',
  cityLabel: 'rgba(226, 240, 248, 0.82)',
  endpointOrigin: '#2fe0d0',
  endpointOriginRing: 'rgba(47, 224, 208, 0.35)',
  endpointDestination: '#78d4ff',
  endpointDestinationRing: 'rgba(120, 210, 255, 0.35)',
  vesselHalo: 'rgba(47, 224, 208, 0.42)',
  vesselCore: '#2fe0d0',
  accent: '#2fe0d0',
  accentMuted: 'rgba(47, 224, 208, 0.55)',
  corridorLabel: 'rgba(226, 240, 248, 0.38)',
  hudBorder: 'rgba(47, 224, 208, 0.2)',
  hudSurface: 'rgba(6, 12, 20, 0.82)',
} as const;

export function cameraToSvgViewBox(camera: HydrowayMapCamera): string {
  return `${camera.x} ${camera.y} ${camera.width} ${camera.height}`;
}

export function getHydrowayMapZoomPercent(camera: HydrowayMapCamera): number {
  const scale = HYDRO_MAP_VIEWBOX.width / camera.width;
  return Math.round(scale * 100);
}

export function zoomHydrowayMapCameraIn(camera: HydrowayMapCamera, factor = 0.82): HydrowayMapCamera {
  const centerX = camera.x + camera.width / 2;
  const centerY = camera.y + camera.height / 2;
  const width = Math.max(camera.width * factor, HYDRO_MAP_VIEWBOX.width * 0.18);
  const height = Math.max(camera.height * factor, HYDRO_MAP_VIEWBOX.height * 0.18);
  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
    zoom: HYDRO_MAP_VIEWBOX.width / width,
  };
}

export function zoomHydrowayMapCameraOut(camera: HydrowayMapCamera, factor = 1.22): HydrowayMapCamera {
  const centerX = camera.x + camera.width / 2;
  const centerY = camera.y + camera.height / 2;
  const width = Math.min(camera.width * factor, HYDRO_MAP_VIEWBOX.width * 1.35);
  const height = Math.min(camera.height * factor, HYDRO_MAP_VIEWBOX.height * 1.35);
  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
    zoom: HYDRO_MAP_VIEWBOX.width / width,
  };
}

export function resetHydrowayMapCamera(): HydrowayMapCamera {
  return { ...HYDRO_MAP_INITIAL_CAMERA };
}
