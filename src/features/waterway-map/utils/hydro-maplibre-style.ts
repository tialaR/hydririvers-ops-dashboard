import type { StyleSpecification } from 'maplibre-gl';

import { hydroMapStyleTokens } from './hydro-map-style';
import { SPIKE_GEOJSON_SOURCE_IDS } from '../data/spike-scene-geojson';

/**
 * Style MapLibre local: fundo escuro HydroRivers, sem tiles comerciais.
 * Camadas GeoJSON são registradas pelo provider em runtime.
 */
export function createHydroMapLibreBaseStyle(): StyleSpecification {
  return {
    version: 8,
    name: 'hydroway-spike-dark',
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      [SPIKE_GEOJSON_SOURCE_IDS.rivers]: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      [SPIKE_GEOJSON_SOURCE_IDS.routeTrack]: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      [SPIKE_GEOJSON_SOURCE_IDS.routeTraveled]: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      [SPIKE_GEOJSON_SOURCE_IDS.cities]: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      [SPIKE_GEOJSON_SOURCE_IDS.origin]: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      [SPIKE_GEOJSON_SOURCE_IDS.destination]: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      [SPIKE_GEOJSON_SOURCE_IDS.vessel]: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
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
        source: SPIKE_GEOJSON_SOURCE_IDS.rivers,
        filter: ['==', ['get', 'id'], 'amazonas'],
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
        source: SPIKE_GEOJSON_SOURCE_IDS.rivers,
        filter: ['==', ['get', 'id'], 'para'],
        paint: {
          'line-color': hydroMapStyleTokens.corridorGlow,
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 3, 8, 8, 12, 12],
          'line-opacity': 0.75,
        },
      },
      {
        id: 'cargo-route-track',
        type: 'line',
        source: SPIKE_GEOJSON_SOURCE_IDS.routeTrack,
        paint: {
          'line-color': hydroMapStyleTokens.routeTrack,
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2, 10, 5],
          'line-opacity': 0.85,
        },
      },
      {
        id: 'cargo-route-traveled',
        type: 'line',
        source: SPIKE_GEOJSON_SOURCE_IDS.routeTraveled,
        paint: {
          'line-color': hydroMapStyleTokens.routeActive,
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 6],
          'line-opacity': 0.95,
        },
      },
      {
        id: 'ports',
        type: 'circle',
        source: SPIKE_GEOJSON_SOURCE_IDS.cities,
        paint: {
          'circle-color': hydroMapStyleTokens.cityDot,
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 2, 10, 4],
          'circle-opacity': 0.85,
        },
      },
      {
        id: 'city-labels',
        type: 'symbol',
        source: SPIKE_GEOJSON_SOURCE_IDS.cities,
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
        source: SPIKE_GEOJSON_SOURCE_IDS.origin,
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
        source: SPIKE_GEOJSON_SOURCE_IDS.destination,
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
        source: SPIKE_GEOJSON_SOURCE_IDS.vessel,
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
