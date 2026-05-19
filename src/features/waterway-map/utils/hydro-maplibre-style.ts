import type { StyleSpecification } from 'maplibre-gl';

import { HYDROWAY_GEOJSON_SOURCE_IDS } from '../data/hydroway-geo-source-ids';
import { hydroMapStyleTokens } from './hydro-map-style';

/**
 * Style MapLibre local: fundo escuro HydroRivers, sem tiles comerciais.
 * Fontes GeoJSON V2.2b (`hydroway-*`) são preenchidas pelo provider em runtime.
 */
export function createHydroMapLibreBaseStyle(): StyleSpecification {
  const emptyCollection = (): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: [],
  });

  return {
    version: 8,
    name: 'hydroway-spike-dark',
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      [HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers]: {
        type: 'geojson',
        data: emptyCollection(),
      },
      [HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors]: {
        type: 'geojson',
        data: emptyCollection(),
      },
      [HYDROWAY_GEOJSON_SOURCE_IDS.portsTerminals]: {
        type: 'geojson',
        data: emptyCollection(),
      },
      [HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack]: {
        type: 'geojson',
        data: emptyCollection(),
      },
      [HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled]: {
        type: 'geojson',
        data: emptyCollection(),
      },
      [HYDROWAY_GEOJSON_SOURCE_IDS.origin]: { type: 'geojson', data: emptyCollection() },
      [HYDROWAY_GEOJSON_SOURCE_IDS.destination]: { type: 'geojson', data: emptyCollection() },
      [HYDROWAY_GEOJSON_SOURCE_IDS.vessel]: { type: 'geojson', data: emptyCollection() },
    },
    layers: [
      {
        id: 'hydro-background',
        type: 'background',
        paint: { 'background-color': hydroMapStyleTokens.background },
      },
      {
        id: 'waterway-main',
        type: 'line',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
        filter: ['==', ['get', 'kind'], 'river'],
        paint: {
          'line-color': hydroMapStyleTokens.corridorStroke,
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 4, 8, 10, 12, 16],
          'line-opacity': 0.9,
          'line-blur': 1.2,
        },
      },
      {
        id: 'waterway-tributary',
        type: 'line',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.mainRivers,
        filter: ['==', ['get', 'kind'], 'tributary'],
        paint: {
          'line-color': hydroMapStyleTokens.corridorGlow,
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 3, 8, 8, 12, 12],
          'line-opacity': 0.75,
        },
      },
      {
        id: 'navigable-corridors',
        type: 'line',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.navigableCorridors,
        paint: {
          'line-color': 'rgba(80, 160, 200, 0.35)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.5, 10, 3],
          'line-dasharray': [2, 2],
          'line-opacity': 0.6,
        },
      },
      {
        id: 'cargo-route-track',
        type: 'line',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTrack,
        paint: {
          'line-color': hydroMapStyleTokens.routeTrack,
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2, 10, 5],
          'line-opacity': 0.85,
        },
      },
      {
        id: 'cargo-route-traveled',
        type: 'line',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.routeTraveled,
        paint: {
          'line-color': hydroMapStyleTokens.routeActive,
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 6],
          'line-opacity': 0.95,
        },
      },
      {
        id: 'ports',
        type: 'circle',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.portsTerminals,
        paint: {
          'circle-color': hydroMapStyleTokens.cityDot,
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 2, 10, 4],
          'circle-opacity': 0.85,
        },
      },
      {
        id: 'port-labels',
        type: 'symbol',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.portsTerminals,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0.6, -0.6],
          'text-anchor': 'left',
          'text-font': ['Open Sans Regular'],
        },
        paint: {
          'text-color': hydroMapStyleTokens.cityLabel,
          'text-halo-color': hydroMapStyleTokens.background,
          'text-halo-width': 1,
        },
      },
      {
        id: 'route-origin',
        type: 'circle',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.origin,
        paint: {
          'circle-color': hydroMapStyleTokens.endpointOrigin,
          'circle-radius': 8,
          'circle-stroke-color': hydroMapStyleTokens.endpointOrigin,
          'circle-stroke-width': 2,
          'circle-opacity': 0.95,
        },
      },
      {
        id: 'route-destination',
        type: 'circle',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.destination,
        paint: {
          'circle-color': hydroMapStyleTokens.endpointDestination,
          'circle-radius': 8,
          'circle-stroke-color': hydroMapStyleTokens.endpointDestination,
          'circle-stroke-width': 2,
          'circle-opacity': 0.95,
        },
      },
      {
        id: 'vessel',
        type: 'circle',
        source: HYDROWAY_GEOJSON_SOURCE_IDS.vessel,
        paint: {
          'circle-color': hydroMapStyleTokens.accent,
          'circle-radius': 9,
          'circle-stroke-color': '#041018',
          'circle-stroke-width': 2,
          'circle-opacity': 1,
        },
      },
    ],
  };
}
