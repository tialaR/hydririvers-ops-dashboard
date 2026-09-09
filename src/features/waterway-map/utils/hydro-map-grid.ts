import { HYDROWAY_MOCK_GEO_BBOX } from '../domain/hydroway-geo.types';

const GRID_LNG_STEP = 0.75;
const GRID_LAT_STEP = 0.5;

/** Grade fictícia WGS84 para o basemap escuro do spike (determinística). */
export function createHydroMapGridGeoJson(): GeoJSON.FeatureCollection {
  const { west, east, south, north } = HYDROWAY_MOCK_GEO_BBOX;
  const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];

  for (let lng = west; lng <= east + 1e-6; lng += GRID_LNG_STEP) {
    features.push({
      type: 'Feature',
      properties: { id: `grid-lng-${lng}`, kind: 'grid' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [lng, south],
          [lng, north],
        ],
      },
    });
  }

  for (let lat = south; lat <= north + 1e-6; lat += GRID_LAT_STEP) {
    features.push({
      type: 'Feature',
      properties: { id: `grid-lat-${lat}`, kind: 'grid' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [west, lat],
          [east, lat],
        ],
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

/** Máscara de profundidade — bacia central mais iluminada (sem buraco). */
export function createHydroMapDepthMaskGeoJson(): GeoJSON.FeatureCollection {
  const { west, east, south, north } = HYDROWAY_MOCK_GEO_BBOX;
  const midLng = (west + east) / 2;
  const midLat = (south + north) / 2;

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { id: 'depth-outer', kind: 'depth' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: { id: 'depth-focus', kind: 'depth-focus' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [midLng - 4.2, midLat - 0.85],
              [midLng + 4.2, midLat - 0.85],
              [midLng + 4.2, midLat + 0.85],
              [midLng - 4.2, midLat + 0.85],
              [midLng - 4.2, midLat - 0.85],
            ],
          ],
        },
      },
    ],
  };
}
