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

/** Tokens compartilhados entre SVG schematic (V2.1b) e style JSON MapLibre (V2.1c+). */
export const hydroMapStyleTokens = {
  background: '#060b10',
  gridLine: 'rgba(120, 170, 210, 0.08)',
  corridorStroke: 'rgba(47, 224, 208, 0.16)',
  corridorGlow: 'rgba(47, 120, 180, 0.22)',
  routeTrack: 'rgba(47, 224, 208, 0.22)',
  routeActive: 'rgba(47, 224, 208, 0.85)',
  routeProgress: 'rgba(170, 255, 240, 0.95)',
  cityDot: 'rgba(226, 240, 248, 0.72)',
  cityLabel: 'rgba(226, 240, 248, 0.78)',
  endpointOrigin: 'rgba(47, 224, 208, 0.9)',
  endpointDestination: 'rgba(120, 210, 255, 0.95)',
  vesselHalo: 'rgba(47, 224, 208, 0.42)',
  accent: '#2fe0d0',
  corridorLabel: 'rgba(226, 240, 248, 0.42)',
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
