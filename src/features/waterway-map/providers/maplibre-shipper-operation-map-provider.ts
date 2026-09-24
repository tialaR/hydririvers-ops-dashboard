import maplibregl, { type Map } from 'maplibre-gl';

import { buildShipperMapGeoJson, collectShipperMapCoordinates } from '@/features/waterway-map/adapters/owned-cargo-operation-geojson';
import type { ShipperMapRouteData } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { DEV_BASEMAP_STYLE_URL } from '@/features/waterway-map/utils/hydro-maplibre-dev-basemap';

import type { ShipperOperationMapProvider } from './shipper-operation-map-provider';

import 'maplibre-gl/dist/maplibre-gl.css';

const SOURCE = 'shipper-op-map-source';
const ROUTE_LAYER = 'shipper-op-route';
const RISK_LAYER = 'shipper-op-risk';
const CHECKPOINT_LAYER = 'shipper-op-checkpoints';
const MARKER_LAYER = 'shipper-op-markers';

const ROUTE_LINE_COLOR = '#0a84ff';
const RISK_LINE_COLOR = '#ff453a';
const CHECKPOINT_COLOR = '#8e8e93';
const ORIGIN_COLOR = '#30d158';
const DESTINATION_COLOR = '#ff453a';
const CURRENT_COLOR = '#0a84ff';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function addOperationalLayers(map: Map, geoJson: ReturnType<typeof buildShipperMapGeoJson>): void {
  const existing = map.getSource(SOURCE) as maplibregl.GeoJSONSource | undefined;
  if (existing) {
    existing.setData(geoJson.collection);
    return;
  }

  map.addSource(SOURCE, { type: 'geojson', data: geoJson.collection });

  map.addLayer({
    id: ROUTE_LAYER,
    type: 'line',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'route'],
    paint: { 'line-color': ROUTE_LINE_COLOR, 'line-width': 4, 'line-opacity': 0.9 },
  });

  map.addLayer({
    id: RISK_LAYER,
    type: 'line',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'risk'],
    paint: {
      'line-color': RISK_LINE_COLOR,
      'line-width': 5,
      'line-dasharray': [2, 1.5],
      'line-opacity': 0.95,
    },
  });

  map.addLayer({
    id: CHECKPOINT_LAYER,
    type: 'circle',
    source: SOURCE,
    filter: ['==', ['get', 'kind'], 'checkpoint'],
    paint: {
      'circle-radius': 3,
      'circle-color': CHECKPOINT_COLOR,
      'circle-opacity': 0.65,
    },
  });

  map.addLayer({
    id: MARKER_LAYER,
    type: 'circle',
    source: SOURCE,
    filter: ['in', ['get', 'kind'], ['literal', ['origin', 'destination', 'current']]],
    paint: {
      'circle-radius': ['match', ['get', 'kind'], 'current', 8, 'origin', 7, 'destination', 7, 6],
      'circle-color': [
        'match',
        ['get', 'kind'],
        'origin',
        ORIGIN_COLOR,
        'destination',
        DESTINATION_COLOR,
        'current',
        CURRENT_COLOR,
        '#ffffff',
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  });
}

function fitRouteBounds(map: Map, routeData: ShipperMapRouteData): void {
  const bounds = new maplibregl.LngLatBounds();
  collectShipperMapCoordinates(routeData).forEach(([lng, lat]) => bounds.extend([lng, lat]));
  map.fitBounds(bounds, {
    padding: { top: 72, bottom: 160, left: 24, right: 72 },
    duration: prefersReducedMotion() ? 0 : 0,
    maxZoom: 7,
  });
}

function applyRouteToMap(map: Map, routeData: ShipperMapRouteData): void {
  addOperationalLayers(map, buildShipperMapGeoJson(routeData));
  fitRouteBounds(map, routeData);
}

export class MapLibreShipperOperationMapProvider implements ShipperOperationMapProvider {
  private map: Map | null = null;
  private routeData: ShipperMapRouteData | null = null;
  private onError: (() => void) | null = null;

  mount(container: HTMLElement, routeData: ShipperMapRouteData, onError: () => void): void {
    this.destroy();
    this.routeData = routeData;
    this.onError = onError;

    try {
      const map = new maplibregl.Map({
        container,
        style: DEV_BASEMAP_STYLE_URL,
        center: routeData.currentPosition.coordinates,
        zoom: 5,
        attributionControl: false,
        interactive: true,
        dragRotate: false,
        pitchWithRotate: false,
      });
      this.map = map;

      map.on('error', this.handleError);
      map.on('load', this.handleLoad);
    } catch {
      this.onError?.();
    }
  }

  update(routeData: ShipperMapRouteData): void {
    this.routeData = routeData;
    const map = this.map;
    if (!map) return;

    if (map.isStyleLoaded()) {
      applyRouteToMap(map, routeData);
      return;
    }

    map.once('load', this.handleLoad);
  }

  destroy(): void {
    const map = this.map;
    if (map) {
      map.off('error', this.handleError);
      map.off('load', this.handleLoad);
      map.remove();
    }
    this.map = null;
    this.routeData = null;
    this.onError = null;
  }

  private readonly handleError = (): void => {
    this.onError?.();
  };

  private readonly handleLoad = (): void => {
    if (!this.map || !this.routeData) return;
    applyRouteToMap(this.map, this.routeData);
  };
}
