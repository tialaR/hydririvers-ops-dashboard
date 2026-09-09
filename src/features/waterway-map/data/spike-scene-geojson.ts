import type { HydrowayMapScene } from '../providers/map-provider.types';
import { SPIKE_DEFAULT_MAP_SCENE } from './spike-cargo-route.mock';
import { SPIKE_MAP_VIEWBOX } from './spike-amazon-river.mock';
import { schematicPathToLineString, schematicPointToLngLat } from '../utils/schematic-to-geo';

export const SPIKE_GEOJSON_SOURCE_IDS = {
  rivers: 'spike-rivers',
  routeTrack: 'spike-route-track',
  routeTraveled: 'spike-route-traveled',
  cities: 'spike-cities',
  origin: 'spike-origin',
  destination: 'spike-destination',
  vessel: 'spike-vessel',
} as const;

export type SpikeGeoJsonBundle = {
  rivers: GeoJSON.FeatureCollection;
  routeTrack: GeoJSON.FeatureCollection;
  routeTraveled: GeoJSON.FeatureCollection;
  cities: GeoJSON.FeatureCollection;
  origin: GeoJSON.FeatureCollection;
  destination: GeoJSON.FeatureCollection;
  vessel: GeoJSON.FeatureCollection;
  routeBounds: GeoJSON.FeatureCollection;
};

export function buildSpikeSceneGeoJson(scene: HydrowayMapScene = SPIKE_DEFAULT_MAP_SCENE): SpikeGeoJsonBundle {
  const rivers: GeoJSON.Feature[] = scene.corridors.map((corridor) => ({
    type: 'Feature',
    properties: { id: corridor.id, label: corridor.label, kind: 'river' },
    geometry: {
      type: 'LineString',
      coordinates: schematicPathToLineString(corridor.pathD, SPIKE_MAP_VIEWBOX),
    },
  }));

  const routeTrack = schematicPathToLineString(scene.route.routePathD, SPIKE_MAP_VIEWBOX);
  const routeTraveled = schematicPathToLineString(scene.route.traveledPathD, SPIKE_MAP_VIEWBOX);

  const cities: GeoJSON.Feature[] = scene.cities.map((city) => ({
    type: 'Feature',
    properties: { id: city.id, name: city.name, kind: 'city' },
    geometry: {
      type: 'Point',
      coordinates: schematicPointToLngLat(city.point, SPIKE_MAP_VIEWBOX),
    },
  }));

  const originCoord = schematicPointToLngLat(scene.route.origin, SPIKE_MAP_VIEWBOX);
  const destinationCoord = schematicPointToLngLat(scene.route.destination, SPIKE_MAP_VIEWBOX);
  const vesselCoord = schematicPointToLngLat(scene.route.vessel, SPIKE_MAP_VIEWBOX);

  const routeBounds: GeoJSON.Feature = {
    type: 'Feature',
    properties: { kind: 'route-bounds' },
    geometry: {
      type: 'LineString',
      coordinates: [originCoord, vesselCoord, destinationCoord],
    },
  };

  return {
    rivers: { type: 'FeatureCollection', features: rivers },
    routeTrack: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { cargoId: scene.route.cargoId, kind: 'route-track' },
          geometry: { type: 'LineString', coordinates: routeTrack },
        },
      ],
    },
    routeTraveled: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { cargoId: scene.route.cargoId, kind: 'route-traveled', progress01: scene.route.progress01 },
          geometry: { type: 'LineString', coordinates: routeTraveled },
        },
      ],
    },
    cities: { type: 'FeatureCollection', features: cities },
    origin: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { label: scene.route.originLabel, kind: 'origin' },
          geometry: { type: 'Point', coordinates: originCoord },
        },
      ],
    },
    destination: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { label: scene.route.destinationLabel, kind: 'destination' },
          geometry: { type: 'Point', coordinates: destinationCoord },
        },
      ],
    },
    vessel: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { cargoId: scene.route.cargoId, kind: 'vessel' },
          geometry: { type: 'Point', coordinates: vesselCoord },
        },
      ],
    },
    routeBounds: { type: 'FeatureCollection', features: [routeBounds] },
  };
}

export const SPIKE_DEFAULT_GEOJSON = buildSpikeSceneGeoJson();
