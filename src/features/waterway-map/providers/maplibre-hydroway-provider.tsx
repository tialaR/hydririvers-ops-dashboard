import maplibregl, { type LngLatBoundsLike, type Map, type PaddingOptions, type StyleSpecification } from 'maplibre-gl';

import { HYDROWAY_GEOJSON_SOURCE_IDS } from '../data/hydroway-geo-source-ids';
import { HYDROWAY_MOCK_GEO_BBOX } from '../domain/hydroway-geo.types';
import type { HydrowayGeoBbox } from '../domain/hydroway-geo.types';
import type { HydrowayGeoJsonSources } from '../domain/hydroway-map-model.types';
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
  'waterway-main': HYDRO_MAPLIBRE_LAYER_GROUPS.waterwayMain,
  'waterway-tributary': HYDRO_MAPLIBRE_LAYER_GROUPS.waterwayTributary,
  'cargo-route': HYDRO_MAPLIBRE_LAYER_GROUPS.route,
  ports: [...HYDRO_MAPLIBRE_LAYER_GROUPS.ports, ...HYDRO_MAPLIBRE_LAYER_GROUPS.corridors],
  vessel: [
    ...HYDRO_MAPLIBRE_LAYER_GROUPS.operations.filter((id) => id.includes('vessel')),
  ],
};

const OPS_ROUTE_LAYERS = HYDRO_MAPLIBRE_LAYER_GROUPS.operations.filter(
  (id) => id.includes('origin') || id.includes('destination'),
);

const INITIAL_MAP_ZOOM = 5.2;
const FIT_PADDING: PaddingOptions = { top: 150, bottom: 90, left: 340, right: 100 };
const MAX_BOUNDS: LngLatBoundsLike = [
  [HYDROWAY_MOCK_GEO_BBOX.west - 0.35, HYDROWAY_MOCK_GEO_BBOX.south - 0.35],
  [HYDROWAY_MOCK_GEO_BBOX.east + 0.35, HYDROWAY_MOCK_GEO_BBOX.north + 0.35],
];
const IMMERSIVE_PITCH = 32;
const IMMERSIVE_BEARING = -14;

export class MapLibreHydrowayProvider implements HydrowayMapProvider {
  readonly kind = 'maplibre' as const;

  private map: Map | null = null;
  private container: HTMLElement | null = null;
  private camera: HydrowayMapCamera = { ...HYDRO_MAP_INITIAL_CAMERA };
  private visibleLayers = new Set<HydrowayMapLayerId>(ALL_LAYERS);
  private geo: HydrowayGeoJsonSources | null = null;
  private progress01 = 0;
  private initFailed = false;
  private routeBbox: HydrowayGeoBbox | null = null;
  private animationFrameId: number | null = null;
  private animationPhase = 0;

  mount(init: HydrowayMapProviderInit, hooks?: { onReady?: () => void }): void {
    this.destroy();
    this.container = init.container;
    this.camera = init.camera ? { ...init.camera } : { ...HYDRO_MAP_INITIAL_CAMERA };
    this.progress01 = init.model.progress01;
    this.geo = enrichHydrowayGeoForMapLibre(init.model.geo, init.model.progress01);
    this.routeBbox = init.model.bbox;
    this.initFailed = false;

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
      });

      map.on('load', () => {
        registerHydroMapLibreImages(map);
        this.applyGeoJson(map);
        this.syncLayerVisibility(map);
        this.startVesselPulse(map);

        if (init.camera) {
          this.setCamera(init.camera);
        } else {
          this.fitRouteTrack(true);
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

  didInitFail(): boolean {
    return this.initFailed;
  }

  destroy(): void {
    this.stopVesselPulse();
    this.map?.remove();
    this.map = null;
    this.container?.replaceChildren();
    this.container = null;
    this.geo = null;
    this.routeBbox = null;
    this.camera = { ...HYDRO_MAP_INITIAL_CAMERA };
    this.visibleLayers = new Set(ALL_LAYERS);
    this.initFailed = false;
    this.progress01 = 0;
    this.animationPhase = 0;
  }

  private fitRouteTrack(cinematic: boolean): void {
    const geo = this.geo;
    if (!geo) {
      if (this.routeBbox) {
        this.flyToBounds(
          [
            [this.routeBbox[0], this.routeBbox[1]],
            [this.routeBbox[2], this.routeBbox[3]],
          ],
          cinematic,
          FIT_PADDING,
        );
      }
      return;
    }

    const coords = extractRouteTrackCoordinates(geo);
    if (coords.length < 2) {
      if (this.routeBbox) {
        this.flyToBounds(
          [
            [this.routeBbox[0], this.routeBbox[1]],
            [this.routeBbox[2], this.routeBbox[3]],
          ],
          cinematic,
          FIT_PADDING,
        );
      }
      return;
    }

    const lngs = coords.map(([lng]) => lng);
    const lats = coords.map(([, lat]) => lat);
    this.flyToBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      cinematic,
      FIT_PADDING,
    );
  }

  private flyToBounds(bounds: LngLatBoundsLike, cinematic: boolean, padding: PaddingOptions = FIT_PADDING): void {
    const map = this.map;
    if (!map) return;

    const duration = cinematic ? hydroMapTransitionMs() : 0;
    const camera = map.cameraForBounds(bounds, { padding });

    if (!camera) {
      map.fitBounds(bounds, { padding, duration, maxZoom: 10.5 });
      this.camera = boundsToSchematicCamera(map.getBounds());
      return;
    }

    map.flyTo({
      center: camera.center,
      zoom: Math.min(camera.zoom ?? INITIAL_MAP_ZOOM, 10.5),
      bearing: cinematic ? IMMERSIVE_BEARING : (camera.bearing ?? 0),
      pitch: cinematic ? IMMERSIVE_PITCH : 0,
      padding,
      duration,
      essential: true,
    });

    if (!cinematic) {
      this.camera = boundsToSchematicCamera(map.getBounds());
    }
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
      map.setPaintProperty('route-planned-gradient', 'line-gradient', buildRouteGradientPaint(this.progress01)['line-gradient']);
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

  private startVesselPulse(map: Map): void {
    this.stopVesselPulse();
    if (prefersReducedMotion()) return;

    const tick = () => {
      if (!this.map || !map.getLayer('ops-vessel-halo-symbol')) {
        this.animationFrameId = null;
        return;
      }

      this.animationPhase += 1;
      const pulse = 0.82 + Math.sin(this.animationPhase * 0.045) * 0.14;
      const zoom = map.getZoom();
      const base = zoom < 6 ? 0.75 : zoom < 9 ? 0.95 : 1.15;

      map.setLayoutProperty('ops-vessel-halo-symbol', 'icon-size', pulse * base);

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private stopVesselPulse(): void {
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
