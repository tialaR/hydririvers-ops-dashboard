'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map } from 'maplibre-gl';

import type { ShipperMapRouteData } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { buildShipperMapGeoJson, collectShipperMapCoordinates } from '@/features/waterway-map/adapters/owned-cargo-operation-geojson';
import { DEV_BASEMAP_STYLE_URL } from '@/features/waterway-map/utils/hydro-maplibre-dev-basemap';

import { ShipperOperationMapFallback } from './owned-cargo-operation-map-fallback';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './owned-cargo-operation-map.module.sass';

const SHIPPER_OP_MAP_SOURCE = 'shipper-op-map-source';
const SHIPPER_OP_ROUTE_LAYER = 'shipper-op-route';
const SHIPPER_OP_RISK_LAYER = 'shipper-op-risk';
const SHIPPER_OP_CHECKPOINT_LAYER = 'shipper-op-checkpoints';
const SHIPPER_OP_MARKER_LAYER = 'shipper-op-markers';

const ROUTE_LINE_COLOR = '#0a84ff';
const RISK_LINE_COLOR = '#ff453a';
const CHECKPOINT_COLOR = '#8e8e93';
const ORIGIN_COLOR = '#30d158';
const DESTINATION_COLOR = '#ff453a';
const CURRENT_COLOR = '#0a84ff';

type ShipperOperationMapProps = {
  routeData: ShipperMapRouteData;
  ariaLabel: string;
  fallbackHintLabel?: string;
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function addOperationalLayers(map: Map, geoJson: ReturnType<typeof buildShipperMapGeoJson>): void {
  const existing = map.getSource(SHIPPER_OP_MAP_SOURCE) as maplibregl.GeoJSONSource | undefined;
  if (existing) {
    existing.setData(geoJson.collection);
    return;
  }

  map.addSource(SHIPPER_OP_MAP_SOURCE, { type: 'geojson', data: geoJson.collection });

  map.addLayer({
    id: SHIPPER_OP_ROUTE_LAYER,
    type: 'line',
    source: SHIPPER_OP_MAP_SOURCE,
    filter: ['==', ['get', 'kind'], 'route'],
    paint: {
      'line-color': ROUTE_LINE_COLOR,
      'line-width': 4,
      'line-opacity': 0.9
    }
  });

  map.addLayer({
    id: SHIPPER_OP_RISK_LAYER,
    type: 'line',
    source: SHIPPER_OP_MAP_SOURCE,
    filter: ['==', ['get', 'kind'], 'risk'],
    paint: {
      'line-color': RISK_LINE_COLOR,
      'line-width': 5,
      'line-dasharray': [2, 1.5],
      'line-opacity': 0.95
    }
  });

  map.addLayer({
    id: SHIPPER_OP_CHECKPOINT_LAYER,
    type: 'circle',
    source: SHIPPER_OP_MAP_SOURCE,
    filter: ['==', ['get', 'kind'], 'checkpoint'],
    paint: {
      'circle-radius': 3,
      'circle-color': CHECKPOINT_COLOR,
      'circle-opacity': 0.65
    }
  });

  map.addLayer({
    id: SHIPPER_OP_MARKER_LAYER,
    type: 'circle',
    source: SHIPPER_OP_MAP_SOURCE,
    filter: ['in', ['get', 'kind'], ['literal', ['origin', 'destination', 'current']]],
    paint: {
      'circle-radius': [
        'match',
        ['get', 'kind'],
        'current',
        8,
        'origin',
        7,
        'destination',
        7,
        6
      ],
      'circle-color': [
        'match',
        ['get', 'kind'],
        'origin',
        ORIGIN_COLOR,
        'destination',
        DESTINATION_COLOR,
        'current',
        CURRENT_COLOR,
        '#ffffff'
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });
}

function fitRouteBounds(map: Map, routeData: ShipperMapRouteData): void {
  const bounds = new maplibregl.LngLatBounds();
  collectShipperMapCoordinates(routeData).forEach(([lng, lat]) => {
    bounds.extend([lng, lat]);
  });
  map.fitBounds(bounds, {
    padding: { top: 72, bottom: 160, left: 24, right: 72 },
    duration: prefersReducedMotion() ? 0 : 0,
    maxZoom: 7
  });
}

function applyRouteToMap(map: Map, routeData: ShipperMapRouteData): void {
  const geoJson = buildShipperMapGeoJson(routeData);
  addOperationalLayers(map, geoJson);
  fitRouteBounds(map, routeData);
}

export function ShipperOperationMap({ routeData, ariaLabel, fallbackHintLabel }: ShipperOperationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const routeDataRef = useRef(routeData);
  const [hasMapFailed, setHasMapFailed] = useState(false);
  const routeKey = `${routeData.corridorId}:${routeData.progressRatio}`;

  useEffect(() => {
    routeDataRef.current = routeData;
  }, [routeData]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasMapFailed) {
      return undefined;
    }

    const map = mapRef.current;

    if (!map) {
      try {
        const mapInstance = new maplibregl.Map({
          container,
          style: DEV_BASEMAP_STYLE_URL,
          center: routeDataRef.current.currentPosition.coordinates,
          zoom: 5,
          attributionControl: false,
          interactive: true,
          dragRotate: false,
          pitchWithRotate: false
        });
        mapRef.current = mapInstance;

        mapInstance.on('error', () => {
          setHasMapFailed(true);
        });

        mapInstance.on('load', () => {
          if (!mapRef.current) return;
          applyRouteToMap(mapRef.current, routeDataRef.current);
        });
      } catch {
        queueMicrotask(() => {
          setHasMapFailed(true);
        });
      }
      return undefined;
    }

    if (map.isStyleLoaded()) {
      applyRouteToMap(map, routeDataRef.current);
    } else {
      map.once('load', () => {
        if (mapRef.current) applyRouteToMap(mapRef.current, routeDataRef.current);
      });
    }

    return undefined;
  }, [hasMapFailed, routeKey]);

  if (hasMapFailed) {
    return (
      <ShipperOperationMapFallback routeData={routeData} ariaLabel={ariaLabel} hintLabel={fallbackHintLabel} />
    );
  }

  return (
    <div className={styles.mapRoot} aria-label={ariaLabel}>
      <div ref={containerRef} className={styles.mapViewport} />
    </div>
  );
}
