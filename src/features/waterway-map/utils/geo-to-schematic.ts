import { HYDROWAY_MOCK_GEO_BBOX } from '../domain/hydroway-geo.types';
import type { HydrowayMapPoint, HydrowayMapViewBox } from '../providers/map-provider.types';
import { HYDRO_MAP_VIEWBOX } from './hydro-map-style';

function roundCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Projeção inversa WGS84 fictício → coordenadas schematic (determinístico). */
export function lngLatToSchematicPoint(
  coord: GeoJSON.Position,
  viewBox: HydrowayMapViewBox = HYDRO_MAP_VIEWBOX,
): HydrowayMapPoint {
  const [lng, lat] = coord;
  const { west, east, south, north } = HYDROWAY_MOCK_GEO_BBOX;
  const x = ((lng - west) / (east - west)) * viewBox.width;
  const y = ((north - lat) / (north - south)) * viewBox.height;
  return { x: roundCoord(x), y: roundCoord(y) };
}

/** Converte LineString GeoJSON em path SVG `M/L` no espaço schematic. */
export function lineStringToSvgPathD(
  coordinates: GeoJSON.Position[],
  viewBox: HydrowayMapViewBox = HYDRO_MAP_VIEWBOX,
): string {
  if (coordinates.length === 0) return '';

  const first = lngLatToSchematicPoint(coordinates[0], viewBox);
  const segments = [`M ${first.x} ${first.y}`];

  for (let index = 1; index < coordinates.length; index += 1) {
    const point = lngLatToSchematicPoint(coordinates[index], viewBox);
    segments.push(`L ${point.x} ${point.y}`);
  }

  return segments.join(' ');
}

export function extractLineStringCoordinates(
  collection: GeoJSON.FeatureCollection,
): GeoJSON.Position[] {
  const feature = collection.features[0];
  if (!feature || feature.geometry.type !== 'LineString') return [];
  return feature.geometry.coordinates;
}

export function extractPointCoordinate(
  collection: GeoJSON.FeatureCollection,
): GeoJSON.Position | undefined {
  const feature = collection.features[0];
  if (!feature || feature.geometry.type !== 'Point') return undefined;
  return feature.geometry.coordinates;
}
