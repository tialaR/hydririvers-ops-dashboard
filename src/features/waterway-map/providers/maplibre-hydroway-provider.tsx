import maplibregl, { type LngLatBoundsLike, type Map, type PaddingOptions, type StyleSpecification } from 'maplibre-gl';

import { HYDROWAY_GEOJSON_SOURCE_IDS } from '../data/hydroway-geo-source-ids';
import { HYDROWAY_MOCK_GEO_BBOX } from '../domain/hydroway-geo.types';
import type { HydrowayGeoBbox } from '../domain/hydroway-geo.types';
import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
import {
  buildRouteTraveledGeoJson,
  buildVesselGeoJson,
  resolveAnimatedRouteProgress,
} from '../utils/hydro-maplibre-animation';
import { resolveHydroMapLibreFitOptions } from '../utils/hydro-maplibre-camera';
import { registerHydroMapLibreImages } from '../utils/hydro-maplibre-icons';
import {
  enrichHydrowayGeoForMapLibre,
  extractRouteTrackCoordinates,
} from '../utils/hydro-maplibre-geo';
import {
  buildRouteGradientPaint,
  createHydroMapLibreBaseStyle,
  HYDRO_MAPLIBRE_LAYER_GROUPS,
} from '../utils/hydro-maplibre-style';
import { HYDRO_MAP_INITIAL_CAMERA, HYDRO_MAP_VIEWBOX } from '../utils/hydro-map-style';
import { hydroMapIntroEaseMs, hydroMapTransitionMs, prefersReducedMotion } from '../utils/hydro-motion';
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
  'waterway-main': [...HYDRO_MAPLIBRE_LAYER_GROUPS.waterwayMain, 'waterway-river-label'],
  'waterway-tributary': [
    ...HYDRO_MAPLIBRE_LAYER_GROUPS.waterwaySecondary,
    ...HYDRO_MAPLIBRE_LAYER_GROUPS.waterwayTributary,
  ],
  'cargo-route': [
    ...HYDRO_MAPLIBRE_LAYER_GROUPS.route,
    'ops-origin-label',
    'ops-destination-label',
  ],
  ports: [
    ...HYDRO_MAPLIBRE_LAYER_GROUPS.ports,
    ...HYDRO_MAPLIBRE_LAYER_GROUPS.corridors,
    'waterway-corridor-label',
    'ports-label',
  ],
  vessel: [
    ...HYDRO_MAPLIBRE_LAYER_GROUPS.operations.filter((id) => id.includes('vessel')),
    'ops-vessel-label',
  ],
};

const OPS_ROUTE_LAYERS = HYDRO_MAPLIBRE_LAYER_GROUPS.operations.filter(
  (id) => id.includes('origin') || id.includes('destination'),
);

const INITIAL_MAP_ZOOM = 5.2;
const MAX_BOUNDS: LngLatBoundsLike = [
  [HYDROWAY_MOCK_GEO_BBOX.west - 0.35, HYDROWAY_MOCK_GEO_BBOX.south - 0.35],
  [HYDROWAY_MOCK_GEO_BBOX.east + 0.35, HYDROWAY_MOCK_GEO_BBOX.north + 0.35],
];

export class MapLibreHydrowayProvider implements HydrowayMapProvider {
  readonly kind = 'maplibre' as const;

  private map: Map | null = null;
  private container: HTMLElement | null = null;
  private camera: HydrowayMapCamera = { ...HYDRO_MAP_INITIAL_CAMERA };
  private visibleLayers = new Set<HydrowayMapLayerId>(ALL_LAYERS);
  private geo: HydrowayGeoJsonSources | null = null;
  private routeTrackCoords: GeoJSON.Position[] = [];
  private vesselLabel = 'Embarcação';
  private progress01 = 0;
  private initFailed = false;
  private routeBbox: HydrowayGeoBbox | null = null;
  private fitOptions = resolveHydroMapLibreFitOptions('');
  private animationFrameId: number | null = null;
  private animationStartMs = 0;
  private animationPaused = false;
  private reducedMotion = false;
  private cameraSettled = false;
  private introMoveHandler: (() => void) | null = null;

  mount(init: HydrowayMapProviderInit, hooks?: { onReady?: () => void }): void {
    this.destroy();
    this.container = init.container;
    this.camera = init.camera ? { ...init.camera } : { ...HYDRO_MAP_INITIAL_CAMERA };
    this.progress01 = init.model.progress01;
    this.fitOptions = resolveHydroMapLibreFitOptions(init.model.cargoId);
    this.geo = enrichHydrowayGeoForMapLibre(init.model.geo, init.model.progress01);
    this.routeTrackCoords = extractRouteTrackCoordinates(this.geo);
    this.vesselLabel =
      String(this.geo.vessel.features[0]?.properties?.displayLabel ?? '') || 'Embarcação';
    this.routeBbox = init.model.bbox;
    this.initFailed = false;
    this.reducedMotion = prefersReducedMotion();
    this.animationPaused = this.reducedMotion;
    this.animationStartMs = 0;
    this.cameraSettled = false;

    const viewBox = init.viewBox ?? HYDRO_MAP_VIEWBOX;
    const style = createHydroMapLibreBaseStyle(init.model.progress01) as StyleSpecification;
    const center = schematicPointToLngLat(
      { x: viewBox.width / 2, y: viewBox.height / 2 },
      viewBox,
    );

    try {
      const map = new maplibregl.Map({
        container: init.container,
        style,
        center,
        zoom: INITIAL_MAP_ZOOM,
        minZoom: 4.2,
        maxZoom: 12,
        maxBounds: MAX_BOUNDS,
        attributionControl: false,
        interactive: true,
        fadeDuration: 0,
        pitch: 0,
        bearing: 0,
        scrollZoom: true,
        dragPan: true,
        dragRotate: true,
        touchPitch: true,
      });

      map.on('load', () => {
        registerHydroMapLibreImages(map);
        this.applyGeoJson(map);
        this.syncLayerVisibility(map);
        this.applyAtmosphere(map);

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

  setCamera(camera: Partial<HydrowayMapCamera>): void {
    this.camera = { ...this.camera, ...camera };
    const map = this.map;
    if (!map?.loaded()) return;

    const sw = schematicPointToLngLat({ x: this.camera.x, y: this.camera.y + this.camera.height });
    const ne = schematicPointToLngLat({ x: this.camera.x + this.camera.width, y: this.camera.y });
    this.flyToBounds([sw, ne] as LngLatBoundsLike, false);
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
    this.flyToBounds(bounds, true, pad);
  }

  fitGeoBbox(bbox: HydrowayGeoBbox, padding = 88, cinematic = false): void {
    const [west, south, east, north] = bbox;
    const pad: PaddingOptions = { top: padding, bottom: padding, left: padding, right: padding };
    this.flyToBounds(
      [
        [west, south],
        [east, north],
      ],
      cinematic,
      pad,
    );
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
    this.fitRouteTrack(true);
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
    this.clearIntroMoveHandler();
    this.stopNativeAnimation();
    this.map?.remove();
    this.map = null;
    this.container?.replaceChildren();
    this.container = null;
    this.geo = null;
    this.routeTrackCoords = [];
    this.routeBbox = null;
    this.camera = { ...HYDRO_MAP_INITIAL_CAMERA };
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
    const bounds = this.resolveRouteBounds();
    if (!bounds) return;

    this.cameraSettled = false;
    this.stopNativeAnimation();
    this.fitRouteBounds(bounds, false);

    if (this.reducedMotion) {
      this.onCameraSettled(map);
      return;
    }

    this.clearIntroMoveHandler();
    const onMoveEnd = () => {
      this.clearIntroMoveHandler();
      this.fitRouteBounds(bounds, true);
      map.once('moveend', () => this.onCameraSettled(map));
    };
    this.introMoveHandler = onMoveEnd;
    map.once('moveend', onMoveEnd);
  }

  private onCameraSettled(map: Map): void {
    this.cameraSettled = true;
    this.camera = boundsToSchematicCamera(map.getBounds());
    if (!this.reducedMotion && !this.animationPaused) {
      this.startNativeAnimation(map);
    }
  }

  private clearIntroMoveHandler(): void {
    if (!this.map || !this.introMoveHandler) {
      this.introMoveHandler = null;
      return;
    }
    this.map.off('moveend', this.introMoveHandler);
    this.introMoveHandler = null;
  }

  private fitRouteTrack(cinematic: boolean): void {
    const bounds = this.resolveRouteBounds();
    if (!bounds) return;
    this.fitRouteBounds(bounds, cinematic);
  }

  private fitRouteBounds(bounds: LngLatBoundsLike, cinematic: boolean): void {
    this.flyToBounds(bounds, cinematic, this.fitOptions.padding);
  }

  private flyToBounds(
    bounds: LngLatBoundsLike,
    cinematic: boolean,
    padding: PaddingOptions = this.fitOptions.padding,
  ): void {
    const map = this.map;
    if (!map) return;

    const { maxZoom, pitch, bearing } = this.fitOptions;

    if (!cinematic || this.reducedMotion) {
      map.fitBounds(bounds, {
        padding,
        maxZoom,
        duration: 0,
        pitch: this.reducedMotion ? pitch : 0,
        bearing: this.reducedMotion ? bearing : 0,
        essential: true,
      });
      this.camera = boundsToSchematicCamera(map.getBounds());
      return;
    }

    const camera = map.cameraForBounds(bounds, { padding, maxZoom });
    if (!camera) {
      map.fitBounds(bounds, { padding, duration: 0, maxZoom, pitch, bearing, essential: true });
      this.camera = boundsToSchematicCamera(map.getBounds());
      return;
    }

    map.easeTo({
      center: camera.center,
      zoom: Math.min(camera.zoom ?? INITIAL_MAP_ZOOM, maxZoom),
      bearing,
      pitch,
      padding,
      duration: hydroMapIntroEaseMs(),
      essential: true,
    });
  }

  private applyAtmosphere(map: Map): void {
    const mapWithFog = map as Map & {
      setFog?: (options: {
        color: string;
        'high-color': string;
        'horizon-blend': number;
        range: [number, number];
      }) => void;
    };
    mapWithFog.setFog?.({
      color: '#04080d',
      'high-color': '#0d1a28',
      'horizon-blend': 0.12,
      range: [0.8, 12],
    });
  }

  private applyGeoJson(map: Map): void {
    const geo = this.geo;
    if (!geo) return;

    const setSource = (sourceId: string, data: GeoJSON.FeatureCollection) => {
      const source = map.getSource(sourceId);
      if (source && 'setData' in source) {
        (source as maplibregl.GeoJSONSource).setData(data);
      }
    };

    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers, geo.mainRivers);
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors, geo.navigableCorridors);
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.portsTerminals, geo.portsTerminals);
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack, geo.routeTrack);
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled, geo.routeTraveled);
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.origin, geo.origin);
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.destination, geo.destination);
    setSource(HYDROWAY_GEOJSON_SOURCE_IDS.vessel, geo.vessel);

    if (map.getLayer('route-planned-gradient')) {
      map.setPaintProperty(
        'route-planned-gradient',
        'line-gradient',
        buildRouteGradientPaint(this.progress01)['line-gradient'],
      );
    }
  }

  private syncAnimatedGeo(progress01: number): void {
    const map = this.map;
    const coords = this.routeTrackCoords;
    if (!map?.loaded() || coords.length < 2) return;

    const routeProps = this.geo?.routeTraveled.features[0]?.properties ?? {};
    const vesselProps = this.geo?.vessel.features[0]?.properties ?? {};

    const routeTraveled = buildRouteTraveledGeoJson(coords, progress01, routeProps);
    const vessel = buildVesselGeoJson(coords, progress01, this.vesselLabel, vesselProps);

    const routeSource = map.getSource(HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled);
    if (routeSource && 'setData' in routeSource) {
      (routeSource as maplibregl.GeoJSONSource).setData(routeTraveled);
    }

    const vesselSource = map.getSource(HYDROWAY_GEOJSON_SOURCE_IDS.vessel);
    if (vesselSource && 'setData' in vesselSource) {
      (vesselSource as maplibregl.GeoJSONSource).setData(vessel);
    }

    if (map.getLayer('route-planned-gradient')) {
      map.setPaintProperty(
        'route-planned-gradient',
        'line-gradient',
        buildRouteGradientPaint(progress01)['line-gradient'],
      );
    }
  }

  private syncLayerVisibility(map: Map): void {
    for (const layerId of ALL_LAYERS) {
      const visible = this.visibleLayers.has(layerId);
      const styleLayers = [...STYLE_LAYER_BY_DOMAIN[layerId]];
      if (layerId === 'cargo-route') {
        styleLayers.push(...OPS_ROUTE_LAYERS);
      }
      for (const styleLayerId of styleLayers) {
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

        const phase = elapsed * 0.0018;
        const pulse = 0.82 + Math.sin(phase) * 0.14;
        const traveledPulse = 0.55 + Math.sin(phase * 1.4) * 0.2;
        const zoom = map.getZoom();
        const base = zoom < 6 ? 0.75 : zoom < 9 ? 0.95 : 1.15;

        if (map.getLayer('ops-vessel-halo-symbol')) {
          map.setLayoutProperty('ops-vessel-halo-symbol', 'icon-size', pulse * base);
        }

        if (map.getLayer('route-traveled-pulse')) {
          map.setPaintProperty('route-traveled-pulse', 'line-opacity', traveledPulse);
          map.setPaintProperty(
            'route-traveled-pulse',
            'line-width',
            (4 + Math.sin(phase * 1.2) * 0.8) * (zoom < 7 ? 0.85 : 1),
          );
        }

        if (map.getLayer('route-traveled-glow')) {
          map.setPaintProperty('route-traveled-glow', 'line-opacity', 0.5 + Math.sin(phase) * 0.12);
        }
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
