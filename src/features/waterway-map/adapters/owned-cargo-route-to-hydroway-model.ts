import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';

import { buildHydrowayDynamicGeoSources } from './geojson-sources';
import { buildHydrowayRouteGeometry } from './route-geometry';
import type { HydrowayGeoFeatureCollection, HydrowayGeoKind } from '../domain/hydroway-geo.types';
import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import type { ShipperMapRouteData } from '../domain/owned-cargo-operation-route';
import { HYDRAWAY_MAP_CONTEXT_MOCK } from '../mocks/hydroway-map-context.mock';

const CORRIDOR_ID_MAP: Record<ShipperMapRouteData['corridorId'], WaterwayCorridorId> = {
  'amazonas-solimoes': 'amazonas',
  madeira: 'madeira',
  tapajos: 'tapajos-teles-pires',
  'tocantins-araguaia': 'tocantins-araguaia',
};

function enrichCollection(
  collection: GeoJSON.FeatureCollection,
  kind: HydrowayGeoKind,
): HydrowayGeoFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: collection.features.map((feature, index) => ({
      ...feature,
      properties: {
        ...(feature.properties ?? {}),
        id: String(feature.properties?.id ?? 'overview-context-' + kind + '-' + index),
        name: String(feature.properties?.name ?? feature.properties?.id ?? kind),
        kind,
      },
    })),
  } as HydrowayGeoFeatureCollection;
}

/**
 * Adapta a rota determinística da experiência Minhas Cargas para o modelo real do mapa.
 * O cargo operacional interno permanece DEMO para reutilizar camadas/controles homologados;
 * o contexto visível da carga selecionada continua vindo da própria Overview.
 */
export function adaptOwnedCargoRouteToHydrowayMapModel(
  routeData: ShipperMapRouteData,
  operationalCargoId = 'CARGO-001',
): HydrowayMapModel {
  const corridorId = CORRIDOR_ID_MAP[routeData.corridorId];
  const progress01 = Math.max(0, Math.min(1, routeData.progressRatio));
  const geometry = buildHydrowayRouteGeometry(routeData.routeCoordinates, progress01);
  const routeName = routeData.origin.label + ' → ' + routeData.destination.label;

  const dynamic = buildHydrowayDynamicGeoSources({
    cargoId: operationalCargoId,
    corridorId,
    routeName,
    originLabel: routeData.origin.label,
    destinationLabel: routeData.destination.label,
    progress01,
    geometry,
    routeSource: 'fallback-line',
    originUsedFallback: false,
    destinationUsedFallback: false,
  });

  return {
    cargoId: operationalCargoId,
    corridorId,
    progress01,
    metadata: {
      originLabel: routeData.origin.label,
      destinationLabel: routeData.destination.label,
      progress01,
      routeName,
      routeTechnicalRef: routeData.routeLabelKey,
      routeSource: 'fallback-line',
      operationalStatus: routeData.riskSegment ? 'attention' : 'in-transit',
      locationFallbacks: { origin: false, destination: false },
    },
    geo: {
      mainRivers: enrichCollection(HYDRAWAY_MAP_CONTEXT_MOCK.corridors, 'river'),
      navigableCorridors: enrichCollection(HYDRAWAY_MAP_CONTEXT_MOCK.corridors, 'corridor'),
      portsTerminals: enrichCollection(HYDRAWAY_MAP_CONTEXT_MOCK.terminals, 'terminal'),
      riskZones: enrichCollection(HYDRAWAY_MAP_CONTEXT_MOCK.alertZones, 'risk-zone'),
      ...dynamic,
    },
    bbox: geometry.bbox,
  };
}
