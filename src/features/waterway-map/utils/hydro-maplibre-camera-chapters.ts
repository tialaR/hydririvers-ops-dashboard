import type { LngLatBoundsLike, Map, PaddingOptions } from 'maplibre-gl';

import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import { resolveEffectiveRouteTrack } from './hydro-maplibre-geo';
import { resolveRouteMarkerCoordinates } from './route-marker-geometry';
import { prefersReducedMotion } from './hydro-motion';

export type HydrowayCameraChapterId = 'overview' | 'origin' | 'current' | 'destination';

export type HydrowayCameraChapter =
  | {
      kind: 'bounds';
      bounds: LngLatBoundsLike;
      padding?: PaddingOptions;
      maxZoom?: number;
      pitch?: number;
      bearing?: number;
      duration?: number;
    }
  | {
      kind: 'point';
      center: [number, number];
      zoom: number;
      pitch?: number;
      bearing?: number;
      duration?: number;
      speed?: number;
    };

const DEFAULT_FIT_PADDING: PaddingOptions = {
  top: 96,
  right: 96,
  bottom: 120,
  left: 96,
};

const DEFAULT_OVERVIEW_PITCH = 30;
const DEFAULT_OVERVIEW_BEARING = 0;
const DEFAULT_FLY_DURATION_MS = 2400;
const DEFAULT_CURRENT_FLY_DURATION_MS = 2600;
const DEFAULT_FIT_DURATION_MS = 1400;

function asLngLat(coordinates: GeoJSON.Position | null | undefined): [number, number] | null {
  if (!coordinates || coordinates.length < 2) return null;
  const [lng, lat] = coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') return null;
  return [lng, lat];
}

function resolveRouteBounds(
  routeTrack: GeoJSON.FeatureCollection,
  routeBbox?: readonly [number, number, number, number] | null,
): LngLatBoundsLike | null {
  const feature = routeTrack.features[0];
  if (feature?.geometry.type === 'LineString' && feature.geometry.coordinates.length >= 2) {
    const coords = feature.geometry.coordinates;
    const lngs = coords.map(([lng]) => lng);
    const lats = coords.map(([, lat]) => lat);
    return [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];
  }

  if (routeBbox) {
    return [
      [routeBbox[0], routeBbox[1]],
      [routeBbox[2], routeBbox[3]],
    ];
  }

  return null;
}

export function buildHydrowayCameraChapters(
  geo: HydrowayGeoJsonSources,
  routeBbox?: readonly [number, number, number, number] | null,
  options?: {
    maxZoom?: number;
    padding?: PaddingOptions;
    /** Progress along route — aligns "current" chapter with the HTML boat marker. */
    progress01?: number;
    routeTrackCoords?: GeoJSON.Position[];
  },
): Partial<Record<HydrowayCameraChapterId, HydrowayCameraChapter>> {
  const bounds = resolveRouteBounds(geo.routeTrack, routeBbox);
  const routeTrackCoords = options?.routeTrackCoords ?? [];
  const track = resolveEffectiveRouteTrack(geo, routeTrackCoords);
  const progress01 =
    typeof options?.progress01 === 'number' && Number.isFinite(options.progress01)
      ? options.progress01
      : 0;
  const markers = resolveRouteMarkerCoordinates(track, progress01);
  const origin = asLngLat(markers.origin);
  const destination = asLngLat(markers.destination);
  const vessel = asLngLat(markers.vessel);

  const chapters: Partial<Record<HydrowayCameraChapterId, HydrowayCameraChapter>> = {};

  if (bounds) {
    chapters.overview = {
      kind: 'bounds',
      bounds,
      padding: options?.padding ?? DEFAULT_FIT_PADDING,
      maxZoom: options?.maxZoom ?? 10.5,
      pitch: DEFAULT_OVERVIEW_PITCH,
      bearing: DEFAULT_OVERVIEW_BEARING,
      duration: DEFAULT_FIT_DURATION_MS,
    };
  }

  if (origin) {
    chapters.origin = {
      kind: 'point',
      center: origin,
      zoom: 10,
      pitch: 35,
      bearing: 30,
      duration: DEFAULT_FLY_DURATION_MS,
    };
  }

  if (vessel) {
    chapters.current = {
      kind: 'point',
      center: vessel,
      zoom: 12,
      pitch: 45,
      bearing: 60,
      duration: DEFAULT_CURRENT_FLY_DURATION_MS,
    };
  }

  if (destination) {
    chapters.destination = {
      kind: 'point',
      center: destination,
      zoom: 10,
      pitch: 35,
      bearing: 120,
      duration: DEFAULT_FLY_DURATION_MS,
    };
  }

  return chapters;
}

function jumpToHydrowayCameraChapter(map: Map, chapter: HydrowayCameraChapter): void {
  if (chapter.kind === 'bounds') {
    map.fitBounds(chapter.bounds, {
      padding: chapter.padding ?? DEFAULT_FIT_PADDING,
      maxZoom: chapter.maxZoom ?? 10.5,
      pitch: chapter.pitch ?? DEFAULT_OVERVIEW_PITCH,
      bearing: chapter.bearing ?? DEFAULT_OVERVIEW_BEARING,
      duration: 0,
      essential: true,
    });
    return;
  }

  map.jumpTo({
    center: chapter.center,
    zoom: chapter.zoom,
    bearing: chapter.bearing ?? map.getBearing(),
    pitch: chapter.pitch ?? map.getPitch(),
  });
}

/** Flies the map to a cargo chapter; uses jump when reduced motion is preferred. */
export function flyToHydrowayCameraChapter(
  map: Map,
  chapter: HydrowayCameraChapter,
  reducedMotion = prefersReducedMotion(),
): void {
  map.stop();

  if (reducedMotion) {
    jumpToHydrowayCameraChapter(map, chapter);
    return;
  }

  if (chapter.kind === 'bounds') {
    map.fitBounds(chapter.bounds, {
      padding: chapter.padding ?? DEFAULT_FIT_PADDING,
      maxZoom: chapter.maxZoom ?? 10.5,
      pitch: chapter.pitch ?? DEFAULT_OVERVIEW_PITCH,
      bearing: chapter.bearing ?? DEFAULT_OVERVIEW_BEARING,
      duration: chapter.duration ?? DEFAULT_FIT_DURATION_MS,
      essential: true,
    });
    return;
  }

  map.flyTo({
    center: chapter.center,
    zoom: chapter.zoom,
    bearing: chapter.bearing ?? map.getBearing(),
    pitch: chapter.pitch ?? map.getPitch(),
    duration: chapter.duration ?? DEFAULT_FLY_DURATION_MS,
    speed: chapter.speed,
    essential: true,
  });
}

export function fitHydrowayRoute(
  map: Map,
  bounds: LngLatBoundsLike,
  options?: { padding?: PaddingOptions; maxZoom?: number; duration?: number },
): void {
  map.stop();
  map.fitBounds(bounds, {
    padding: options?.padding ?? DEFAULT_FIT_PADDING,
    maxZoom: options?.maxZoom ?? 10.5,
    duration: options?.duration ?? DEFAULT_FIT_DURATION_MS,
    pitch: DEFAULT_OVERVIEW_PITCH,
    bearing: DEFAULT_OVERVIEW_BEARING,
    essential: true,
  });
}
