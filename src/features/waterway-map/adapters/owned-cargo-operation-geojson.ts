import type { ShipperMapLngLat, ShipperMapRouteData } from '@/features/waterway-map/domain/owned-cargo-operation-route';

export type ShipperMapGeoJsonKind =
  | 'route'
  | 'origin'
  | 'destination'
  | 'current'
  | 'checkpoint'
  | 'risk';

export type ShipperMapGeoJsonBundle = {
  route: GeoJSON.Feature<GeoJSON.LineString>;
  origin: GeoJSON.Feature<GeoJSON.Point>;
  destination: GeoJSON.Feature<GeoJSON.Point>;
  current: GeoJSON.Feature<GeoJSON.Point>;
  checkpoints: GeoJSON.Feature<GeoJSON.Point>[];
  riskSegment?: GeoJSON.Feature<GeoJSON.LineString>;
  collection: GeoJSON.FeatureCollection;
};

export type ShipperMapSvgProjection = {
  viewBox: string;
  routePath: string;
  riskPath?: string;
  origin: { x: number; y: number };
  destination: { x: number; y: number };
  current: { x: number; y: number };
  checkpoints: Array<{ id: string; x: number; y: number }>;
};

const SVG_VIEW_WIDTH = 320;
const SVG_VIEW_HEIGHT = 200;
const SVG_PADDING = 16;

function pointFeature(
  kind: ShipperMapGeoJsonKind,
  coordinates: ShipperMapLngLat,
  properties: Record<string, string | number> = {}
): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: 'Feature',
    properties: { kind, ...properties },
    geometry: { type: 'Point', coordinates }
  };
}

function lineFeature(
  kind: ShipperMapGeoJsonKind,
  coordinates: ShipperMapLngLat[],
  properties: Record<string, string | number> = {}
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    properties: { kind, ...properties },
    geometry: { type: 'LineString', coordinates }
  };
}

export function buildShipperMapGeoJson(routeData: ShipperMapRouteData): ShipperMapGeoJsonBundle {
  const route = lineFeature('route', routeData.routeCoordinates, {
    corridorId: routeData.corridorId
  });
  const origin = pointFeature('origin', routeData.origin.coordinates, {
    label: routeData.origin.label
  });
  const destination = pointFeature('destination', routeData.destination.coordinates, {
    label: routeData.destination.label
  });
  const current = pointFeature('current', routeData.currentPosition.coordinates, {
    progress: routeData.progressRatio
  });
  const checkpoints = routeData.checkpoints.map((checkpoint) =>
    pointFeature('checkpoint', checkpoint.coordinates, {
      checkpointId: checkpoint.id,
      labelKey: checkpoint.labelKey
    })
  );
  const riskSegment = routeData.riskSegment
    ? lineFeature('risk', routeData.riskSegment.coordinates, {
        riskLevel: routeData.riskSegment.level
      })
    : undefined;

  const features: GeoJSON.Feature[] = [route, origin, destination, current, ...checkpoints];
  if (riskSegment) features.push(riskSegment);

  return {
    route,
    origin,
    destination,
    current,
    checkpoints,
    riskSegment,
    collection: { type: 'FeatureCollection', features }
  };
}

export function collectShipperMapCoordinates(routeData: ShipperMapRouteData): ShipperMapLngLat[] {
  const coords: ShipperMapLngLat[] = [
    ...routeData.routeCoordinates,
    routeData.origin.coordinates,
    routeData.destination.coordinates,
    routeData.currentPosition.coordinates,
    ...routeData.checkpoints.map((c) => c.coordinates)
  ];
  if (routeData.riskSegment) {
    coords.push(...routeData.riskSegment.coordinates);
  }
  return coords;
}

export function projectShipperMapToSvg(routeData: ShipperMapRouteData): ShipperMapSvgProjection {
  const allCoords = collectShipperMapCoordinates(routeData);
  const lngValues = allCoords.map(([lng]) => lng);
  const latValues = allCoords.map(([, lat]) => lat);
  const minLng = Math.min(...lngValues);
  const maxLng = Math.max(...lngValues);
  const minLat = Math.min(...latValues);
  const maxLat = Math.max(...latValues);
  const lngSpan = maxLng - minLng || 1;
  const latSpan = maxLat - minLat || 1;

  const project = ([lng, lat]: ShipperMapLngLat) => {
    const x = SVG_PADDING + ((lng - minLng) / lngSpan) * (SVG_VIEW_WIDTH - SVG_PADDING * 2);
    const y =
      SVG_PADDING +
      (1 - (lat - minLat) / latSpan) * (SVG_VIEW_HEIGHT - SVG_PADDING * 2);
    return { x, y };
  };

  const toPath = (coords: ShipperMapLngLat[]) =>
    coords
      .map((coord, index) => {
        const { x, y } = project(coord);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');

  return {
    viewBox: `0 0 ${SVG_VIEW_WIDTH} ${SVG_VIEW_HEIGHT}`,
    routePath: toPath(routeData.routeCoordinates),
    riskPath: routeData.riskSegment ? toPath(routeData.riskSegment.coordinates) : undefined,
    origin: project(routeData.origin.coordinates),
    destination: project(routeData.destination.coordinates),
    current: project(routeData.currentPosition.coordinates),
    checkpoints: routeData.checkpoints.map((checkpoint) => {
      const { x, y } = project(checkpoint.coordinates);
      return { id: checkpoint.id, x, y };
    })
  };
}
