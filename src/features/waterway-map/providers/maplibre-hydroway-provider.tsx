import maplibregl, { type LngLatBoundsLike, type Map, type PaddingOptions } from 'maplibre-gl';

import { HYDROWAY_MOCK_GEO_BBOX } from '../domain/hydroway-geo.types';
import type { HydrowayGeoBbox } from '../domain/hydroway-geo.types';
import type { HydrowayGeoJsonSources, HydrowayMapModel } from '../domain/hydroway-map-model.types';
import { DEV_BASEMAP_STYLE_URL } from '../utils/hydro-maplibre-dev-basemap';
import {
  buildHydrowayCameraChapters,
  fitHydrowayRoute,
  flyToHydrowayCameraChapter,
  type HydrowayCameraChapter,
  type HydrowayCameraChapterId,
} from '../utils/hydro-maplibre-camera-chapters';
import { resolveHydroMapLibreFitOptions } from '../utils/hydro-maplibre-camera';
import { enrichHydrowayGeoForMapLibre } from '../utils/hydro-maplibre-geo';
import {
  applyHydroLayerPaintMode,
  extractOverlayRouteTrackCoordinates,
  HYDROWAY_MVP_LAYER_GROUPS,
  installHydrowayMapLibreOverlay,
  layerExistsOnMap,
  syncHydrowayMapLibreOverlayData,
  syncRouteFlowPaint,
  syncRouteMarkerLayerVisibility,
  syncRoutePointPulsePaint,
} from '../utils/hydro-maplibre-overlay';
import { resolveRouteMarkerCoordinates } from '../utils/route-marker-geometry';
import {
  HydroMapLibreRouteMarkers,
  resolveRouteMarkerVisibleKinds,
} from '../utils/hydro-maplibre-route-markers';
import { HYDRO_MAP_VIEWBOX } from '../utils/hydro-map-style';
import { hydroMapTransitionMs, prefersReducedMotion } from '../utils/hydro-motion';
import { schematicPointToLngLat } from '../utils/schematic-to-geo';
import type {
  HydrowayLayerToggleResult,
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

function isMapLibreMapUsable(map: Map | null | undefined): map is Map {
  if (!map) return false;
  const removed = (map as Map & { _removed?: boolean })._removed;
  return removed !== true;
}

function finiteOrUndefined(value: number | null | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

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
  private reducedMotion = false;
  private cameraSettled = false;
  private overviewBounds: LngLatBoundsLike | null = null;
  private destroyed = true;
  private overlayReady = false;
  private mapLoadedOnce = false;
  private resizeObserver: ResizeObserver | null = null;
  private visualFrameId: number | null = null;
  private visualPhaseStartMs = 0;
  private renderedRouteCoordinates: GeoJSON.Position[] = [];
  private originMarker: maplibregl.Marker | null = null;
  private destinationMarker: maplibregl.Marker | null = null;
  private currentCargoMarker: maplibregl.Marker | null = null;
  private readonly routeIdentificationMarkers = new HydroMapLibreRouteMarkers();
  private routeIdentificationMarkerSyncScheduled = false;
  private routeMarkersDebugLoggedKey = '';

  private mountOnReadyHook: (() => void) | undefined;
  private pendingInitCamera: HydrowayMapCamera | undefined;

  private readonly handleMapMoveEnd = (): void => {
    const map = this.map;
    if (!this.canSyncMapState(map)) return;
    this.camera = boundsToSchematicCamera(map.getBounds());
  };

  private readonly handleMapLoad = (): void => {
    const map = this.map;
    if (this.destroyed || !isMapLibreMapUsable(map)) return;

    this.mapLoadedOnce = true;
    installHydrowayMapLibreOverlay(map, this.geo!);
    this.overlayReady = true;
    const { renderedRouteCoordinates } = syncHydrowayMapLibreOverlayData(
      map,
      this.geo!,
      this.progress01,
      this.routeTrackCoords,
    );
    this.renderedRouteCoordinates = renderedRouteCoordinates;
    this.syncRouteMarkerLayers(map);
    this.syncLayerVisibility(map);
    this.syncRouteIdentificationMarkersWhenReady(map);
    void this.routeIdentificationMarkers.prefetchSvgAssets().then(() => {
      if (this.destroyed || this.map !== map) return;
      this.syncRouteIdentificationMarkersWhenReady(map);
    });

    if (this.pendingInitCamera) {
      this.setCamera(this.pendingInitCamera);
      this.pendingInitCamera = undefined;
      this.onCameraSettled(map);
    } else {
      this.applyInitialRouteCamera(map);
    }
    this.mountOnReadyHook?.();
  };

  mount(init: HydrowayMapProviderInit, hooks?: { onReady?: () => void }): void {
    this.destroy();
    this.destroyed = false;
    this.overlayReady = false;
    this.mapLoadedOnce = false;
    this.container = init.container;
    this.progress01 = init.model.progress01;
    this.fitOptions = resolveHydroMapLibreFitOptions(init.model.cargoId);
    this.geo = enrichHydrowayGeoForMapLibre(init.model.geo, init.model.progress01);
    this.routeTrackCoords = extractOverlayRouteTrackCoordinates(this.geo);
    this.routeBbox = init.model.bbox;
    this.initFailed = false;
    this.reducedMotion = prefersReducedMotion();
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

      this.mountOnReadyHook = hooks?.onReady;
      this.pendingInitCamera = init.camera;
      map.on('load', this.handleMapLoad);
      map.on('moveend', this.handleMapMoveEnd);

      this.map = map;
    } catch {
      this.initFailed = true;
      throw new Error('maplibre-init-failed');
    }
  }

  isReady(): boolean {
    const map = this.map;
    return Boolean(this.overlayReady && this.geo && this.canRunMapOperations(map));
  }

  /** Sync route overlay + HTML boat marker when cargo/progress changes without remounting the map. */
  updateModel(model: HydrowayMapModel): void {
    if (this.destroyed) return;

    this.progress01 = model.progress01;
    this.fitOptions = resolveHydroMapLibreFitOptions(model.cargoId);
    this.geo = enrichHydrowayGeoForMapLibre(model.geo, model.progress01);
    this.routeTrackCoords = extractOverlayRouteTrackCoordinates(this.geo);
    this.routeBbox = model.bbox;
    this.overviewBounds = this.resolveRouteBounds();

    const map = this.getMountedMap();
    if (!map || !this.geo) return;

    const { renderedRouteCoordinates } = syncHydrowayMapLibreOverlayData(
      map,
      this.geo,
      this.progress01,
      this.routeTrackCoords,
    );
    this.renderedRouteCoordinates = renderedRouteCoordinates;
    this.syncRouteIdentificationMarkersWhenReady(map);

    if (!this.overlayReady || !map.loaded()) return;

    this.syncRouteMarkerLayers(map);

    try {
      syncRouteFlowPaint(map, this.progress01, this.resolveRouteFlowPaintOptions());
    } catch {
      // Best-effort during teardown or missing layers.
    }
  }

  jumpToChapter(chapterId: HydrowayCameraChapterId): void {
    const map = this.map;
    if (!map?.loaded() || !this.geo) return;

    const chapters = this.resolveCameraChapters();
    const chapter = chapters[chapterId];
    if (!chapter) return;

    this.applyCameraChapterImmediate(map, chapter);
  }

  jumpToRouteBounds(): void {
    const map = this.map;
    const bounds = this.overviewBounds;
    if (!map?.loaded() || !bounds) return;

    map.stop();
    fitHydrowayRoute(map, bounds, {
      padding: this.fitOptions.padding,
      maxZoom: this.fitOptions.maxZoom,
      duration: 0,
    });
  }

  zoomInImmediate(): void {
    const map = this.map;
    if (!map?.loaded()) return;
    map.stop();
    map.zoomIn({ duration: 0 });
  }

  zoomOutImmediate(): void {
    const map = this.map;
    if (!map?.loaded()) return;
    map.stop();
    map.zoomOut({ duration: 0 });
  }

  flyToChapter(chapterId: HydrowayCameraChapterId): void {
    const map = this.map;
    if (!map?.loaded() || !this.geo) return;

    const chapters = this.resolveCameraChapters();
    const chapter = chapters[chapterId];
    if (!chapter) return;

    flyToHydrowayCameraChapter(map, chapter, this.reducedMotion);
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

  setLayers(layers: HydrowayMapLayerId[]): HydrowayLayerToggleResult {
    this.visibleLayers = new Set(layers);
    const map = this.map;
    if (this.destroyed || !map?.loaded() || !this.overlayReady) {
      return { appliedLayerCount: 0, hydrographyAvailable: false };
    }
    return this.syncLayerVisibility(map);
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

  didInitFail(): boolean {
    return this.initFailed;
  }

  destroy(): void {
    this.stopVisualLoop();

    if (this.destroyed && !this.map && this.visualFrameId === null && !this.resizeObserver) {
      return;
    }

    this.destroyed = true;
    this.overlayReady = false;
    this.mapLoadedOnce = false;
    this.pendingInitCamera = undefined;
    this.renderedRouteCoordinates = [];
    this.routeIdentificationMarkerSyncScheduled = false;
    this.routeMarkersDebugLoggedKey = '';
    this.removeRouteIdentificationMarkers();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    const map = this.map;
    this.map = null;

    this.mountOnReadyHook = undefined;

    if (isMapLibreMapUsable(map)) {
      try {
        map.off('load', this.handleMapLoad);
        map.off('moveend', this.handleMapMoveEnd);
      } catch {
        // Map may already be tearing down.
      }
      try {
        map.remove();
      } catch {
        // Ignore double-remove during Fast Refresh.
      }
    }

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
    this.cameraSettled = false;
    this.visualPhaseStartMs = 0;
  }

  private syncRouteMarkerLayers(map: Map): void {
    if (this.destroyed || !isMapLibreMapUsable(map)) return;
    syncRouteMarkerLayerVisibility(map, resolveRouteMarkerVisibleKinds(this.visibleLayers));
  }

  private hasRouteIdentificationMarkerInputs(): boolean {
    return this.renderedRouteCoordinates.length >= 2 && Number.isFinite(this.progress01);
  }

  private isRouteMarkersMapReady(map: Map): boolean {
    return (
      isMapLibreMapUsable(map) &&
      this.hasRouteIdentificationMarkerInputs() &&
      (map.loaded() || this.mapLoadedOnce) &&
      this.overlayReady
    );
  }

  private syncRouteIdentificationMarkersWhenReady(map: Map): void {
    if (this.destroyed || !isMapLibreMapUsable(map)) return;
    if (!this.hasRouteIdentificationMarkerInputs()) return;

    if (!this.isRouteMarkersMapReady(map)) {
      this.scheduleRouteIdentificationMarkerSync(map);
      return;
    }

    this.routeIdentificationMarkerSyncScheduled = false;
    this.syncRouteIdentificationMarkers(map);
    this.logRouteIdentificationMarkerDebugOnce(map);
  }

  private scheduleRouteIdentificationMarkerSync(map: Map): void {
    if (this.routeIdentificationMarkerSyncScheduled) return;
    this.routeIdentificationMarkerSyncScheduled = true;

    const retry = (): void => {
      this.routeIdentificationMarkerSyncScheduled = false;
      if (this.destroyed || this.map !== map) return;
      this.syncRouteIdentificationMarkersWhenReady(map);
    };

    if (!map.loaded()) {
      map.once('load', retry);
      return;
    }

    map.once('idle', retry);
  }

  private syncRouteIdentificationMarkers(map: Map): void {
    if (this.destroyed || !isMapLibreMapUsable(map)) return;
    if (!this.hasRouteIdentificationMarkerInputs()) return;

    const markers = resolveRouteMarkerCoordinates(
      this.renderedRouteCoordinates,
      this.progress01,
    );

    this.routeIdentificationMarkers.sync({
      map,
      origin: markers.origin,
      destination: markers.destination,
      vessel: markers.vessel,
      visibleKinds: resolveRouteMarkerVisibleKinds(this.visibleLayers),
    });

    this.originMarker = this.routeIdentificationMarkers.getMarker('origin');
    this.destinationMarker = this.routeIdentificationMarkers.getMarker('destination');
    this.currentCargoMarker = this.routeIdentificationMarkers.getMarker('vessel');
  }

  private logRouteIdentificationMarkerDebugOnce(map: Map): void {
    if (process.env.NODE_ENV === 'production') return;

    const markers = resolveRouteMarkerCoordinates(
      this.renderedRouteCoordinates,
      this.progress01,
    );
    const stateKey = [
      map.loaded(),
      this.overlayReady,
      this.renderedRouteCoordinates.length,
      markers.origin?.join(','),
      markers.destination?.join(','),
      markers.vessel?.join(','),
    ].join('|');

    if (stateKey === this.routeMarkersDebugLoggedKey) return;
    this.routeMarkersDebugLoggedKey = stateKey;

    const markerCountAfterSync = document.querySelectorAll('.hydriRouteIdentificationMarker').length;

    console.debug('[hydroway-map] route identification markers sync', {
      routeCoordinatesLength: this.renderedRouteCoordinates.length,
      progress01: this.progress01,
      originValid: markers.origin !== null,
      destinationValid: markers.destination !== null,
      vesselValid: markers.vessel !== null,
      markerCountAfterSync,
    });
  }

  private removeRouteIdentificationMarkers(): void {
    this.routeIdentificationMarkers.destroy();
    this.originMarker = null;
    this.destinationMarker = null;
    this.currentCargoMarker = null;
  }

  private getMountedMap(): Map | null {
    if (this.destroyed) return null;
    const map = this.map;
    return isMapLibreMapUsable(map) ? map : null;
  }

  private getOperationalMap(): Map | null {
    const map = this.getMountedMap();
    if (!map || !this.overlayReady || !map.loaded()) return null;
    return map;
  }

  private resolveHydrographyEmphasis(): boolean {
    return (
      this.visibleLayers.has('waterway-main') || this.visibleLayers.has('waterway-tributary')
    );
  }

  private resolveRouteFlowPaintOptions(hydrographyEmphasis?: boolean) {
    const elapsedMs = this.visualPhaseStartMs
      ? performance.now() - this.visualPhaseStartMs
      : 0;
    const flowPhase = (elapsedMs % 9800) / 9800;

    return {
      hydrographyEmphasis: hydrographyEmphasis ?? this.resolveHydrographyEmphasis(),
      flowPhase01: flowPhase,
      elapsedMs,
      reducedMotion: this.reducedMotion,
    };
  }

  private setHydroLayerEmphasis(emphasis: boolean): boolean {
    const map = this.getOperationalMap();
    if (!map) return false;

    applyHydroLayerPaintMode(map, emphasis);
    try {
      syncRouteFlowPaint(map, this.progress01, this.resolveRouteFlowPaintOptions(emphasis));
    } catch {
      // Best-effort when layers are unavailable at extreme zoom.
    }
    return true;
  }

  toggleHydroLayerEmphasis(): boolean {
    const map = this.getOperationalMap();
    const emphasis = this.resolveHydrographyEmphasis();
    if (!map) return emphasis;

    this.setHydroLayerEmphasis(emphasis);
    return emphasis;
  }

  private canSyncMapState(map: Map | null | undefined): map is Map {
    return !this.destroyed && this.overlayReady && isMapLibreMapUsable(map) && map.loaded();
  }

  private canRunMapOperations(map: Map | null | undefined): map is Map {
    return !this.destroyed && isMapLibreMapUsable(map) && map.loaded();
  }

  private applyCameraChapterImmediate(map: Map, chapter: HydrowayCameraChapter): void {
    if (!this.canRunMapOperations(map)) return;

    map.stop();

    if (chapter.kind === 'bounds') {
      const fitOptions: Parameters<Map['fitBounds']>[1] = {
        duration: 0,
        essential: true,
      };
      if (chapter.padding) fitOptions.padding = chapter.padding;
      const maxZoom = finiteOrUndefined(chapter.maxZoom);
      if (maxZoom !== undefined) fitOptions.maxZoom = maxZoom;
      const pitch = finiteOrUndefined(chapter.pitch);
      if (pitch !== undefined) fitOptions.pitch = pitch;
      const bearing = finiteOrUndefined(chapter.bearing);
      if (bearing !== undefined) fitOptions.bearing = bearing;

      map.fitBounds(chapter.bounds, fitOptions);
      return;
    }

    const zoom = finiteOrUndefined(chapter.zoom);
    if (zoom === undefined) return;

    const jumpOptions: Parameters<Map['jumpTo']>[0] = {
      center: chapter.center,
      zoom,
    };
    const bearing = finiteOrUndefined(chapter.bearing);
    const mapBearing = finiteOrUndefined(map.getBearing());
    jumpOptions.bearing = bearing ?? mapBearing ?? 0;
    const pitch = finiteOrUndefined(chapter.pitch);
    const mapPitch = finiteOrUndefined(map.getPitch());
    jumpOptions.pitch = pitch ?? mapPitch ?? 0;
    map.jumpTo(jumpOptions);
  }

  private resolveCameraChapters(): Partial<Record<HydrowayCameraChapterId, HydrowayCameraChapter>> {
    if (!this.geo) return {};
    return buildHydrowayCameraChapters(this.geo, this.routeBbox, {
      maxZoom: this.fitOptions.maxZoom,
      padding: this.fitOptions.padding,
      progress01: this.progress01,
      routeTrackCoords: this.routeTrackCoords,
    });
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

    fitHydrowayRoute(map, bounds, {
      padding: this.fitOptions.padding,
      maxZoom: this.fitOptions.maxZoom,
      duration: this.reducedMotion ? 0 : 1400,
    });

    map.once('moveend', () => this.onCameraSettled(map));
  }

  private onCameraSettled(map: Map): void {
    if (this.destroyed || this.map !== map || !isMapLibreMapUsable(map)) return;

    this.cameraSettled = true;
    this.camera = boundsToSchematicCamera(map.getBounds());
    this.syncRouteMarkerLayers(map);
    this.syncRouteIdentificationMarkersWhenReady(map);
    this.startVisualLoop(map);
  }

  private readonly visualTick = (now: number): void => {
    this.visualFrameId = null;

    const map = this.map;
    if (!this.canSyncMapState(map)) return;

    if (!this.visualPhaseStartMs) {
      this.visualPhaseStartMs = now;
    }
    const elapsed = now - this.visualPhaseStartMs;
    try {
      syncRouteFlowPaint(map, this.progress01, {
        ...this.resolveRouteFlowPaintOptions(),
        elapsedMs: elapsed,
        reducedMotion: false,
      });
      syncRoutePointPulsePaint(map, elapsed);
      this.syncRouteIdentificationMarkers(map);
    } catch {
      // Best-effort during teardown or missing layers at extreme zoom.
    }

    if (!this.reducedMotion && !this.destroyed && this.canSyncMapState(this.map)) {
      this.visualFrameId = requestAnimationFrame(this.visualTick);
    }
  };

  private startVisualLoop(map: Map): void {
    if (this.visualFrameId !== null) return;
    if (!this.cameraSettled || !this.overlayReady) return;
    if (this.map !== map || !this.canSyncMapState(map)) return;

    syncRouteFlowPaint(map, this.progress01, this.resolveRouteFlowPaintOptions());
    syncRoutePointPulsePaint(map, 0);
    if (this.reducedMotion) return;

    this.visualPhaseStartMs = 0;
    this.visualFrameId = requestAnimationFrame(this.visualTick);
  }

  private stopVisualLoop(): void {
    if (this.visualFrameId !== null) {
      cancelAnimationFrame(this.visualFrameId);
      this.visualFrameId = null;
    }
    this.visualPhaseStartMs = 0;
  }

  private syncLayerVisibility(map: Map): HydrowayLayerToggleResult {
    if (!this.canSyncMapState(map)) {
      return { appliedLayerCount: 0, hydrographyAvailable: false };
    }

    let appliedLayerCount = 0;

    for (const layerId of ALL_LAYERS) {
      const visible = this.visibleLayers.has(layerId);
      for (const styleLayerId of STYLE_LAYER_BY_DOMAIN[layerId]) {
        if (!layerExistsOnMap(map, styleLayerId)) continue;
        try {
          map.setLayoutProperty(styleLayerId, 'visibility', visible ? 'visible' : 'none');
          appliedLayerCount += 1;
        } catch {
          // Layer may be gone during teardown or deep zoom.
        }
      }
    }

    const hydrographyEmphasis = this.resolveHydrographyEmphasis();
    const hydroPaint = applyHydroLayerPaintMode(map, hydrographyEmphasis);
    appliedLayerCount += hydroPaint.appliedLayerCount;

    try {
      syncRouteFlowPaint(map, this.progress01, this.resolveRouteFlowPaintOptions(hydrographyEmphasis));
    } catch {
      // Paint sync is best-effort during teardown.
    }

    this.syncRouteMarkerLayers(map);
    this.syncRouteIdentificationMarkersWhenReady(map);

    return {
      appliedLayerCount,
      hydrographyAvailable: hydroPaint.hydrographyAvailable,
    };
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
  const safeZoom = Number.isFinite(zoom) ? zoom : baseZoom;
  return Math.round((2 ** (safeZoom - baseZoom)) * 100);
}

export type { HydrowayCameraChapterId };
