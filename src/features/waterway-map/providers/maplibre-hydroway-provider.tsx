import maplibregl, { type LngLatBoundsLike, type Map, type StyleSpecification } from 'maplibre-gl';

import { buildSpikeSceneGeoJson, SPIKE_GEOJSON_SOURCE_IDS, type SpikeGeoJsonBundle } from '../data/spike-scene-geojson';
import { SPIKE_MAP_VIEWBOX } from '../data/spike-amazon-river.mock';
import { createHydroMapLibreBaseStyle } from '../utils/hydro-maplibre-style';
import {
  HYDRO_MAP_INITIAL_CAMERA,
  HYDRO_MAP_VIEWBOX,
  hydroMapStyleTokens,
} from '../utils/hydro-map-style';
import { schematicPointToLngLat, SPIKE_GEO_BBOX, type LngLat } from '../utils/schematic-to-geo';
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

const STYLE_LAYER_BY_DOMAIN: Record<HydrowayMapLayerId, string[]> = {
  'waterway-main': ['waterway-main'],
  'waterway-tributary': ['waterway-tributary'],
  'cargo-route': ['cargo-route-track', 'cargo-route-traveled', 'route-origin', 'route-destination'],
  ports: ['ports', 'city-labels'],
  vessel: ['vessel'],
};

const INITIAL_MAP_ZOOM = 5.4;

export class MapLibreHydrowayProvider implements HydrowayMapProvider {
  readonly kind = 'maplibre' as const;

  private map: Map | null = null;
  private container: HTMLElement | null = null;
  private camera: HydrowayMapCamera = { ...HYDRO_MAP_INITIAL_CAMERA };
  private visibleLayers = new Set<HydrowayMapLayerId>(ALL_LAYERS);
  private geojson: SpikeGeoJsonBundle | null = null;
  private initFailed = false;

  mount(init: HydrowayMapProviderInit, hooks?: { onReady?: () => void }): void {
    this.destroy();
    this.container = init.container;
    this.camera = init.camera ? { ...init.camera } : { ...HYDRO_MAP_INITIAL_CAMERA };
    this.geojson = buildSpikeSceneGeoJson(init.scene);
    this.initFailed = false;

    const style = createHydroMapLibreBaseStyle() as StyleSpecification;
    const center = schematicPointToLngLat(
      {
        x: HYDRO_MAP_VIEWBOX.width / 2,
        y: HYDRO_MAP_VIEWBOX.height / 2,
      },
      init.viewBox,
    );

    try {
      const map = new maplibregl.Map({
        container: init.container,
        style,
        center,
        zoom: INITIAL_MAP_ZOOM,
        minZoom: 3.5,
        maxZoom: 12,
        attributionControl: false,
        interactive: true,
        fadeDuration: 0,
      });

      map.on('load', () => {
        this.applyGeoJson(map);
        this.syncLayerVisibility(map);
        if (init.camera) {
          this.setCamera(init.camera);
        } else {
          this.fitBounds(
            [init.scene.route.origin, init.scene.route.destination, init.scene.route.vessel],
            80,
          );
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
    map.fitBounds([sw, ne] as LngLatBoundsLike, { padding: 24, duration: 0, maxZoom: 11 });
  }

  fitBounds(points: HydrowayMapPoint[], padding = 72): void {
    if (!points.length) return;
    const map = this.map;
    if (!map) return;

    const coords = points.map((point) => schematicPointToLngLat(point));
    const lngs = coords.map(([lng]) => lng);
    const lats = coords.map(([, lat]) => lat);
    const bounds: LngLatBoundsLike = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];

    map.fitBounds(bounds, { padding, duration: 0, maxZoom: 10.5 });
    this.camera = boundsToSchematicCamera(map.getBounds());
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
    this.map?.zoomIn({ duration: 0 });
  }

  zoomOut(): void {
    this.map?.zoomOut({ duration: 0 });
  }

  resetView(): void {
    this.setCamera({ ...HYDRO_MAP_INITIAL_CAMERA });
  }

  didInitFail(): boolean {
    return this.initFailed;
  }

  destroy(): void {
    this.map?.remove();
    this.map = null;
    this.container?.replaceChildren();
    this.container = null;
    this.geojson = null;
    this.camera = { ...HYDRO_MAP_INITIAL_CAMERA };
    this.visibleLayers = new Set(ALL_LAYERS);
    this.initFailed = false;
  }

  private applyGeoJson(map: Map): void {
    const geojson = this.geojson;
    if (!geojson) return;

    const setSource = (sourceId: string, data: GeoJSON.FeatureCollection) => {
      const source = map.getSource(sourceId);
      if (source && 'setData' in source) {
        (source as maplibregl.GeoJSONSource).setData(data);
      }
    };

    setSource(SPIKE_GEOJSON_SOURCE_IDS.rivers, geojson.rivers);
    setSource(SPIKE_GEOJSON_SOURCE_IDS.routeTrack, geojson.routeTrack);
    setSource(SPIKE_GEOJSON_SOURCE_IDS.routeTraveled, geojson.routeTraveled);
    setSource(SPIKE_GEOJSON_SOURCE_IDS.cities, geojson.cities);
    setSource(SPIKE_GEOJSON_SOURCE_IDS.origin, geojson.origin);
    setSource(SPIKE_GEOJSON_SOURCE_IDS.destination, geojson.destination);
    setSource(SPIKE_GEOJSON_SOURCE_IDS.vessel, geojson.vessel);
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
}

function boundsToSchematicCamera(bounds: maplibregl.LngLatBounds): HydrowayMapCamera {
  const { west, east, south, north } = SPIKE_GEO_BBOX;
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
