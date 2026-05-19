import maplibregl, { type LngLatBoundsLike, type Map, type PaddingOptions } from 'maplibre-gl';

import { HYDROWAY_MOCK_GEO_BBOX } from '../domain/hydroway-geo.types';
import type { HydrowayGeoBbox } from '../domain/hydroway-geo.types';
import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import { DEV_BASEMAP_STYLE_URL } from '../utils/hydro-maplibre-dev-basemap';
import {
  buildHydrowayCameraChapters,
  fitHydrowayRoute,
  flyToHydrowayCameraChapter,
  type HydrowayCameraChapterId,
} from '../utils/hydro-maplibre-camera-chapters';
import { resolveAnimatedRouteProgress } from '../utils/hydro-maplibre-animation';
import { resolveHydroMapLibreFitOptions } from '../utils/hydro-maplibre-camera';
import { enrichHydrowayGeoForMapLibre } from '../utils/hydro-maplibre-geo';
import {
  extractOverlayRouteTrackCoordinates,
  HYDROWAY_MVP_LAYER_GROUPS,
  installHydrowayMapLibreOverlay,
  syncHydrowayMapLibreOverlayData,
} from '../utils/hydro-maplibre-overlay';
import { HYDRO_MAP_VIEWBOX } from '../utils/hydro-map-style';
import { hydroMapTransitionMs, prefersReducedMotion } from '../utils/hydro-motion';
import { schematicPointToLngLat } from '../utils/schematic-to-geo';
import type {
  HydrowayMapCamera,
  HydrowayMapLayerId,
  HydrowayMapPoint,
  HydrowayMapProvider,
  HydrowayMapProviderInit,
} from './map-provider.types';

import 'maplibre-gl/dist/maplibre-gl.css';

const ALL_LAYERS: HydrowayMapLayerId[] = [
  'waterway-main',
  'waterway-tributary',
  'cargo-route',
  'ports',
  'vessel',
];

const STYLE_LAYER_BY_DOMAIN: Record<HydrowayMapLayerId, readonly string[]> = {
  'waterway-main': [...HYDROWAY_MVP_LAYER_GROUPS.waterwayMain],
  'waterway-tributary': [...HYDROWAY_MVP_LAYER_GROUPS.waterwayTributary],
  'cargo-route': [...HYDROWAY_MVP_LAYER_GROUPS.cargoRoute],
  ports: [...HYDROWAY_MVP_LAYER_GROUPS.ports],
  vessel: [...HYDROWAY_MVP_LAYER_GROUPS.vessel],
};

const INITIAL_MAP_ZOOM = 5.2;
const MAX_BOUNDS: LngLatBoundsLike = [
  [HYDROWAY_MOCK_GEO_BBOX.west - 0.35, HYDROWAY_MOCK_GEO_BBOX.south - 0.35],
  [HYDROWAY_MOCK_GEO_BBOX.east + 0.35, HYDROWAY_MOCK_GEO_BBOX.north + 0.35],
];

export class MapLibreHydrowayProvider implements HydrowayMapProvider {
  readonly kind = 'maplibre' as const;

  private map: Map | null = null;
  private container: HTMLElement | null = null;
  private camera: HydrowayMapCamera = { x: 0, y: 0, width: 0, height: 0, zoom: 1 };
  private visibleLayers = new Set<HydrowayMapLayerId>(ALL_LAYERS);
  private geo: HydrowayGeoJsonSources | null = null;
  private routeTrackCoords: GeoJSON.Position[] = [];
  private progress01 = 0;
  private initFailed = false;
  private routeBbox: HydrowayGeoBbox | null = null;
  private fitOptions = resolveHydroMapLibreFitOptions('');
  private animationFrameId: number | null = null;
  private animationStartMs = 0;
  private animationPaused = false;
  private reducedMotion = false;
  private cameraSettled = false;
  private overviewBounds: LngLatBoundsLike | null = null;

  mount(init: HydrowayMapProviderInit, hooks?: { onReady?: () => void }): void {
    this.destroy();
    this.container = init.container;
    this.progress01 = init.model.progress01;
    this.fitOptions = resolveHydroMapLibreFitOptions(init.model.cargoId);
    this.geo = enrichHydrowayGeoForMapLibre(init.model.geo, init.model.progress01);
    this.routeTrackCoords = extractOverlayRouteTrackCoordinates(this.geo);
    this.routeBbox = init.model.bbox;
    this.initFailed = false;
    this.reducedMotion = prefersReducedMotion();
    this.animationPaused = this.reducedMotion;
    this.animationStartMs = 0;
    this.cameraSettled = false;
    this.overviewBounds = this.resolveRouteBounds();

    const viewBox = init.viewBox ?? HYDRO_MAP_VIEWBOX;
    const center = schematicPointToLngLat(
      { x: viewBox.width / 2, y: viewBox.height / 2 },
      viewBox,
    );

    try {
      const map = new maplibregl.Map({
        container: init.container,
        style: DEV_BASEMAP_STYLE_URL,
        center,
        zoom: INITIAL_MAP_ZOOM,
        minZoom: 4.2,
        maxZoom: 14,
        maxBounds: MAX_BOUNDS,
        attributionControl: false,
        interactive: true,
        fadeDuration: 0,
        pitch: 35,
        bearing: 0,
        scrollZoom: true,
        dragPan: true,
        dragRotate: true,
        touchPitch: true,
      });

      map.on('load', () => {
        installHydrowayMapLibreOverlay(map, this.geo!);
        syncHydrowayMapLibreOverlayData(map, this.geo!, this.progress01, this.routeTrackCoords);
        this.syncLayerVisibility(map);

        if (init.camera) {
          this.setCamera(init.camera);
          this.onCameraSettled(map);
        } else {
          this.applyInitialRouteCamera(map);
        }
        hooks?.onReady?.();
      });

      map.on('moveend', () => {
        this.camera = boundsToSchematicCamera(map.getBounds());
      });

      this.map = map;
    } catch {
      this.initFailed = true;
      throw new Error('maplibre-init-failed');
    }
  }

  flyToChapter(chapterId: HydrowayCameraChapterId): void {
    const map = this.map;
    if (!map?.loaded() || !this.geo) return;

    const chapters = buildHydrowayCameraChapters(this.geo, this.routeBbox, {
      maxZoom: this.fitOptions.maxZoom,
      padding: this.fitOptions.padding,
    });
    const chapter = chapters[chapterId];
    if (!chapter) return;

    flyToHydrowayCameraChapter(map, chapter);
  }

  setCamera(camera: Partial<HydrowayMapCamera>): void {
    this.camera = { ...this.camera, ...camera };
    const map = this.map;
    if (!map?.loaded() || !this.overviewBounds) return;

    fitHydrowayRoute(map, this.overviewBounds, {
      padding: this.fitOptions.padding,
      maxZoom: this.fitOptions.maxZoom,
      duration: 0,
    });
  }

  fitBounds(points: HydrowayMapPoint[], padding = 88): void {
    if (!points.length) return;
    const coords = points.map((point) => schematicPointToLngLat(point));
    const lngs = coords.map(([lng]) => lng);
    const lats = coords.map(([, lat]) => lat);
    const bounds: LngLatBoundsLike = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];
    const pad: PaddingOptions = { top: padding, bottom: padding, left: padding, right: padding };
    const map = this.map;
    if (!map?.loaded()) return;
    fitHydrowayRoute(map, bounds, { padding: pad, maxZoom: this.fitOptions.maxZoom });
  }

  fitGeoBbox(bbox: HydrowayGeoBbox, padding = 88, cinematic = false): void {
    const map = this.map;
    if (!map?.loaded()) return;
    const pad: PaddingOptions = { top: padding, bottom: padding, left: padding, right: padding };
    fitHydrowayRoute(map, [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]],
    ], {
      padding: pad,
      maxZoom: this.fitOptions.maxZoom,
      duration: cinematic && !this.reducedMotion ? 1400 : 0,
    });
  }

  setLayers(layers: HydrowayMapLayerId[]): void {
    this.visibleLayers = new Set(layers);
    const map = this.map;
    if (map?.loaded()) {
      this.syncLayerVisibility(map);
    }
  }

  getCamera(): HydrowayMapCamera {
    if (this.map?.loaded()) {
      return boundsToSchematicCamera(this.map.getBounds());
    }
    return { ...this.camera };
  }

  getMapZoom(): number {
    return this.map?.getZoom() ?? INITIAL_MAP_ZOOM;
  }

  zoomIn(): void {
    this.map?.zoomIn({ duration: hydroMapTransitionMs() });
  }

  zoomOut(): void {
    this.map?.zoomOut({ duration: hydroMapTransitionMs() });
  }

  resetView(): void {
    this.flyToChapter('overview');
  }

  pauseAnimation(): void {
    this.animationPaused = true;
    this.syncAnimatedGeo(this.progress01);
  }

  resumeAnimation(): void {
    if (this.reducedMotion) return;
    this.animationPaused = false;
    this.animationStartMs = 0;
    const map = this.map;
    if (map?.loaded() && this.cameraSettled) {
      this.startNativeAnimation(map);
    }
  }

  toggleAnimationPause(): boolean {
    if (this.animationPaused) {
      this.resumeAnimation();
    } else {
      this.pauseAnimation();
    }
    return this.animationPaused;
  }

  isAnimationPaused(): boolean {
    return this.animationPaused;
  }

  didInitFail(): boolean {
    return this.initFailed;
  }

  destroy(): void {
    this.stopNativeAnimation();
    this.map?.remove();
    this.map = null;
    this.container?.replaceChildren();
    this.container = null;
    this.geo = null;
    this.routeTrackCoords = [];
    this.routeBbox = null;
    this.overviewBounds = null;
    this.visibleLayers = new Set(ALL_LAYERS);
    this.initFailed = false;
    this.progress01 = 0;
    this.fitOptions = resolveHydroMapLibreFitOptions('');
    this.animationStartMs = 0;
    this.animationPaused = false;
    this.cameraSettled = false;
  }

  private resolveRouteBounds(): LngLatBoundsLike | null {
    const coords = this.routeTrackCoords;
    if (coords.length >= 2) {
      const lngs = coords.map(([lng]) => lng);
      const lats = coords.map(([, lat]) => lat);
      return [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];
    }

    if (this.routeBbox) {
      return [
        [this.routeBbox[0], this.routeBbox[1]],
        [this.routeBbox[2], this.routeBbox[3]],
      ];
    }

    return null;
  }

  private applyInitialRouteCamera(map: Map): void {
    const bounds = this.overviewBounds;
    if (!bounds) return;

    this.cameraSettled = false;
    this.stopNativeAnimation();

    fitHydrowayRoute(map, bounds, {
      padding: this.fitOptions.padding,
      maxZoom: this.fitOptions.maxZoom,
      duration: this.reducedMotion ? 0 : 1400,
    });

    map.once('moveend', () => this.onCameraSettled(map));
  }

  private onCameraSettled(map: Map): void {
    this.cameraSettled = true;
    this.camera = boundsToSchematicCamera(map.getBounds());
    if (!this.reducedMotion && !this.animationPaused) {
      this.startNativeAnimation(map);
    }
  }

  private syncAnimatedGeo(progress01: number): void {
    const map = this.map;
    const geo = this.geo;
    if (!map?.loaded() || !geo) return;
    syncHydrowayMapLibreOverlayData(map, geo, progress01, this.routeTrackCoords);
  }

  private syncLayerVisibility(map: Map): void {
    for (const layerId of ALL_LAYERS) {
      const visible = this.visibleLayers.has(layerId);
      for (const styleLayerId of STYLE_LAYER_BY_DOMAIN[layerId]) {
        if (!map.getLayer(styleLayerId)) continue;
        map.setLayoutProperty(styleLayerId, 'visibility', visible ? 'visible' : 'none');
      }
    }
  }

  private startNativeAnimation(map: Map): void {
    this.stopNativeAnimation();
    if (this.reducedMotion || !this.cameraSettled) return;

    const tick = (now: number) => {
      if (!this.map) {
        this.animationFrameId = null;
        return;
      }

      if (!this.animationPaused) {
        if (!this.animationStartMs) {
          this.animationStartMs = now;
        }
        const elapsed = now - this.animationStartMs;
        const animProgress = resolveAnimatedRouteProgress(this.progress01, elapsed);
        this.syncAnimatedGeo(animProgress);
      }

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private stopNativeAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

function boundsToSchematicCamera(bounds: maplibregl.LngLatBounds): HydrowayMapCamera {
  const { west, east, south, north } = HYDROWAY_MOCK_GEO_BBOX;
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const x = ((sw.lng - west) / (east - west)) * HYDRO_MAP_VIEWBOX.width;
  const y = ((north - ne.lat) / (north - south)) * HYDRO_MAP_VIEWBOX.height;
  const width = ((ne.lng - sw.lng) / (east - west)) * HYDRO_MAP_VIEWBOX.width;
  const height = ((sw.lat - ne.lat) / (north - south)) * HYDRO_MAP_VIEWBOX.height;

  const clampedWidth = Math.max(width, HYDRO_MAP_VIEWBOX.width * 0.12);
  const clampedHeight = Math.max(height, HYDRO_MAP_VIEWBOX.height * 0.12);

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: clampedWidth,
    height: clampedHeight,
    zoom: HYDRO_MAP_VIEWBOX.width / clampedWidth,
  };
}

export function getMapLibreZoomPercent(zoom: number, baseZoom = INITIAL_MAP_ZOOM): number {
  return Math.round((2 ** (zoom - baseZoom)) * 100);
}

export type { HydrowayCameraChapterId };
