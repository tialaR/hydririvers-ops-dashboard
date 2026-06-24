import type {
  ShipperCorridorId,
  ShipperOwnedCargo,
  ShipperRiskLevel
} from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export type ShipperMapLngLat = [number, number];

export type ShipperMapCheckpoint = {
  id: string;
  labelKey: string;
  coordinates: ShipperMapLngLat;
};

export type ShipperMapRouteData = {
  corridorId: ShipperCorridorId;
  routeLabelKey: string;
  origin: { label: string; coordinates: ShipperMapLngLat };
  destination: { label: string; coordinates: ShipperMapLngLat };
  currentPosition: { coordinates: ShipperMapLngLat };
  routeCoordinates: ShipperMapLngLat[];
  checkpoints: ShipperMapCheckpoint[];
  riskSegment?: {
    coordinates: ShipperMapLngLat[];
    level: ShipperRiskLevel;
  };
  progressRatio: number;
};

type CorridorRouteTemplate = Omit<ShipperMapRouteData, 'currentPosition' | 'progressRatio' | 'riskSegment'> & {
  defaultProgressRatio: number;
  riskSegmentIndices?: [number, number];
  riskLevel?: ShipperRiskLevel;
};

const SHIPPER_CORRIDOR_ROUTES: Record<ShipperCorridorId, CorridorRouteTemplate> = {
  tapajos: {
    corridorId: 'tapajos',
    routeLabelKey: 'tapajos',
    origin: { label: 'Miritituba', coordinates: [-55.2833, -4.3167] },
    destination: { label: 'Barcarena', coordinates: [-48.6167, -1.5058] },
    routeCoordinates: [
      [-55.2833, -4.3167],
      [-55.01, -3.85],
      [-54.7333, -2.4431],
      [-55.5167, -1.9011],
      [-52.4, -1.65],
      [-48.6167, -1.5058]
    ],
    checkpoints: [
      { id: 'tap-miritituba', labelKey: 'miritituba', coordinates: [-55.2833, -4.3167] },
      { id: 'tap-santarem', labelKey: 'santarem', coordinates: [-54.7333, -2.4431] },
      { id: 'tap-obidos', labelKey: 'obidos', coordinates: [-55.5167, -1.9011] },
      { id: 'tap-barcarena', labelKey: 'barcarena', coordinates: [-48.6167, -1.5058] }
    ],
    defaultProgressRatio: 0.35,
    riskSegmentIndices: [1, 3],
    riskLevel: 'medium'
  },
  madeira: {
    corridorId: 'madeira',
    routeLabelKey: 'madeira',
    origin: { label: 'Porto Velho', coordinates: [-63.9039, -8.7619] },
    destination: { label: 'Itacoatiara', coordinates: [-58.4442, -3.1431] },
    routeCoordinates: [
      [-63.9039, -8.7619],
      [-63.0317, -7.5117],
      [-61.2, -5.4],
      [-60.0253, -3.119],
      [-59.1, -3.05],
      [-58.4442, -3.1431]
    ],
    checkpoints: [
      { id: 'mad-porto-velho', labelKey: 'portoVelho', coordinates: [-63.9039, -8.7619] },
      { id: 'mad-humaita', labelKey: 'humaita', coordinates: [-63.0317, -7.5117] },
      { id: 'mad-manaus', labelKey: 'manausLeg', coordinates: [-60.0253, -3.119] },
      { id: 'mad-itacoatiara', labelKey: 'itacoatiara', coordinates: [-58.4442, -3.1431] }
    ],
    defaultProgressRatio: 0.52,
    riskSegmentIndices: [2, 4],
    riskLevel: 'high'
  },
  'amazonas-solimoes': {
    corridorId: 'amazonas-solimoes',
    routeLabelKey: 'amazonasSolimoes',
    origin: { label: 'Manaus', coordinates: [-60.0253, -3.119] },
    destination: { label: 'Tabatinga', coordinates: [-69.9361, -4.2317] },
    routeCoordinates: [
      [-60.0253, -3.119],
      [-61.5, -3.45],
      [-63.1414, -4.085],
      [-64.7111, -3.3542],
      [-67.2, -3.9],
      [-69.9361, -4.2317]
    ],
    checkpoints: [
      { id: 'amz-manaus', labelKey: 'manaus', coordinates: [-60.0253, -3.119] },
      { id: 'amz-coari', labelKey: 'coari', coordinates: [-63.1414, -4.085] },
      { id: 'amz-tefe', labelKey: 'tefe', coordinates: [-64.7111, -3.3542] },
      { id: 'amz-tabatinga', labelKey: 'tabatinga', coordinates: [-69.9361, -4.2317] }
    ],
    defaultProgressRatio: 0.58,
    riskSegmentIndices: [3, 4],
    riskLevel: 'medium'
  },
  'tocantins-araguaia': {
    corridorId: 'tocantins-araguaia',
    routeLabelKey: 'tocantinsAraguaia',
    origin: { label: 'Marabá', coordinates: [-49.1322, -5.3686] },
    destination: { label: 'Vila do Conde', coordinates: [-48.3833, -1.5333] },
    routeCoordinates: [
      [-49.1322, -5.3686],
      [-49.2647, -6.75],
      [-49.05, -8.1],
      [-48.75, -3.2],
      [-48.5044, -1.4558],
      [-48.3833, -1.5333]
    ],
    checkpoints: [
      { id: 'toc-maraba', labelKey: 'maraba', coordinates: [-49.1322, -5.3686] },
      { id: 'toc-conceicao', labelKey: 'conceicaoAraguaia', coordinates: [-49.2647, -8.2578] },
      { id: 'toc-belem', labelKey: 'belemLeg', coordinates: [-48.5044, -1.4558] },
      { id: 'toc-vila-conde', labelKey: 'vilaDoConde', coordinates: [-48.3833, -1.5333] }
    ],
    defaultProgressRatio: 0.41,
    riskSegmentIndices: [1, 2],
    riskLevel: 'high'
  }
};

const CARGO_PROGRESS_OVERRIDES: Record<string, number> = {
  'hr-4821': 0.48,
  'hr-4770': 0.62,
  'hr-4699': 0.28
};

function interpolateOnRoute(route: ShipperMapLngLat[], ratio: number): ShipperMapLngLat {
  if (route.length === 0) return [0, 0];
  if (route.length === 1) return route[0];
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const scaled = clamped * (route.length - 1);
  const lowerIndex = Math.floor(scaled);
  const upperIndex = Math.min(lowerIndex + 1, route.length - 1);
  const segmentRatio = scaled - lowerIndex;
  const [lngA, latA] = route[lowerIndex];
  const [lngB, latB] = route[upperIndex];
  return [lngA + (lngB - lngA) * segmentRatio, latA + (latB - latA) * segmentRatio];
}

function sliceRouteSegment(route: ShipperMapLngLat[], startIndex: number, endIndex: number): ShipperMapLngLat[] {
  const start = Math.max(0, Math.min(startIndex, route.length - 1));
  const end = Math.max(start, Math.min(endIndex, route.length - 1));
  return route.slice(start, end + 1);
}

export function getShipperCorridorRoute(corridorId: ShipperCorridorId): ShipperMapRouteData {
  const template = SHIPPER_CORRIDOR_ROUTES[corridorId];
  const progressRatio = template.defaultProgressRatio;
  return buildRouteFromTemplate(template, progressRatio);
}

export function getShipperMapRouteForCargo(cargo: ShipperOwnedCargo): ShipperMapRouteData {
  const template = SHIPPER_CORRIDOR_ROUTES[cargo.corridorId];
  const progressRatio = CARGO_PROGRESS_OVERRIDES[cargo.id] ?? template.defaultProgressRatio;
  const route = buildRouteFromTemplate(template, progressRatio);

  if (cargo.riskLevel === 'low') {
    return { ...route, riskSegment: undefined };
  }

  if (template.riskSegmentIndices && template.riskLevel) {
    const [start, end] = template.riskSegmentIndices;
    return {
      ...route,
      riskSegment: {
        coordinates: sliceRouteSegment(route.routeCoordinates, start, end),
        level: cargo.riskLevel === 'critical' ? 'critical' : template.riskLevel
      }
    };
  }

  return route;
}

function buildRouteFromTemplate(template: CorridorRouteTemplate, progressRatio: number): ShipperMapRouteData {
  const currentPosition = interpolateOnRoute(template.routeCoordinates, progressRatio);
  const riskSegment =
    template.riskSegmentIndices && template.riskLevel
      ? {
          coordinates: sliceRouteSegment(
            template.routeCoordinates,
            template.riskSegmentIndices[0],
            template.riskSegmentIndices[1]
          ),
          level: template.riskLevel
        }
      : undefined;

  return {
    corridorId: template.corridorId,
    routeLabelKey: template.routeLabelKey,
    origin: template.origin,
    destination: template.destination,
    routeCoordinates: template.routeCoordinates,
    checkpoints: template.checkpoints,
    currentPosition: { coordinates: currentPosition },
    progressRatio,
    riskSegment
  };
}
