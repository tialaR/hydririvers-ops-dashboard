import { describe, expect, it } from 'vitest';

import {
  HYDROWAY_V26_DEMO_CARGO_IDS,
  HYDROWAY_V26_MIN_ROUTE_COORDINATES,
  HYDROWAY_V26_MOCK_GEO_FILES,
  HYDROWAY_V26_REQUIRED_CORRIDOR_IDS,
  HYDROWAY_V26_REQUIRED_CORRIDOR_KINDS,
  HYDROWAY_V26_REQUIRED_GOV_FIELDS,
  HYDROWAY_V26_REQUIRED_NODE_IDS,
  HYDROWAY_V26_REQUIRED_RIVER_IDS,
} from '@/features/waterway-map/data/hydroway-mock-coverage';
import {
  findHydrowayCargoRouteFeature,
  loadHydrowayCargoRoutesMock,
  loadHydrowayGeoJsonSources,
  loadHydrowayMainRiversMock,
  loadHydrowayNavigableCorridorsMock,
  loadHydrowayOperationalChannelsMock,
  loadHydrowayPortsTerminalsMock,
  loadHydrowayRiskZonesMock,
  loadHydrowaySecondaryRiversMock,
  loadHydrowayStaticGeoBundle,
} from '@/features/waterway-map/data/load-mock-geojson';
import {
  validateHydrowayGeoFeatureCollection,
  validateHydrowayMockCorpus,
} from '@/features/waterway-map/data/validate-mock-geojson';
import {
  HYDROWAY_DEMO_CARGO_IDS,
  isHydrowayDemoCargoId,
} from '@/features/waterway-map/domain/hydroway-entities.types';
import { HYDROWAY_MOCK_GEO_BBOX } from '@/features/waterway-map/domain/hydroway-geo.types';

describe('hydroway mock geojson schema', () => {
  it('valida os sete artefatos mock versionados V2.6', () => {
    const collections = [
      ['secondary rivers', loadHydrowaySecondaryRiversMock()],
      ['operational channels', loadHydrowayOperationalChannelsMock()],
      ['navigable corridors', loadHydrowayNavigableCorridorsMock()],
      ['logistics nodes', loadHydrowayPortsTerminalsMock()],
      ['risk zones', loadHydrowayRiskZonesMock()],
      ['cargo routes', loadHydrowayCargoRoutesMock()],
    ] as const;

    for (const [label, collection] of collections) {
      const result = validateHydrowayGeoFeatureCollection(collection, label, { requireGov: true });
      expect(result.valid, result.issues.map((i) => i.message).join('; ')).toBe(true);
    }

    expect(HYDROWAY_V26_MOCK_GEO_FILES).toHaveLength(7);
  });

  it('valida corpus GOV-enriched (rios, corredores, nós, zonas, rotas)', () => {
    const bundle = loadHydrowayStaticGeoBundle();
    const result = validateHydrowayMockCorpus({
      mainRivers: bundle.mainRivers,
      navigableCorridors: bundle.navigableCorridors,
      portsTerminals: bundle.portsTerminals,
      riskZones: bundle.riskZones,
      cargoRoutes: loadHydrowayCargoRoutesMock(),
    });
    expect(result.valid, result.issues.map((i) => i.message).join('; ')).toBe(true);
  });

  it('expõe rede hidroviária densa com kinds esperados (V2.6)', () => {
    const rivers = loadHydrowayMainRiversMock();
    const kinds = [...new Set(rivers.features.map((f) => f.properties?.kind))].sort();
    expect(kinds).toEqual(
      expect.arrayContaining(['river', 'tributary', 'secondary', 'channel']),
    );
    expect(rivers.features.length).toBeGreaterThanOrEqual(20);
    expect(rivers.features.filter((f) => f.properties?.kind === 'river').length).toBeGreaterThanOrEqual(5);
    expect(rivers.features.filter((f) => f.properties?.kind === 'tributary').length).toBeGreaterThanOrEqual(5);
    expect(rivers.features.filter((f) => f.properties?.kind === 'secondary').length).toBeGreaterThanOrEqual(8);
    expect(rivers.features.filter((f) => f.properties?.kind === 'channel').length).toBeGreaterThanOrEqual(4);

    const corridors = loadHydrowayNavigableCorridorsMock();
    expect(corridors.features.every((f) => f.properties?.kind === 'corridor')).toBe(true);
    expect(corridors.features.length).toBe(5);

    const nodes = loadHydrowayPortsTerminalsMock();
    expect(nodes.features.length).toBeGreaterThanOrEqual(20);
    const nodeKinds = nodes.features.map((f) => f.properties?.kind);
    expect(nodeKinds).toContain('port');
    expect(nodeKinds).toContain('terminal');
    expect(nodeKinds).toContain('transshipment');

    const risk = loadHydrowayRiskZonesMock();
    expect(risk.features.some((f) => f.properties?.kind === 'risk-zone')).toBe(true);
    expect(risk.features.some((f) => f.properties?.kind === 'floodplain')).toBe(true);
  });

  it('cobre hidrovias prioritárias Arco Norte e nós logísticos V2.6', () => {
    const rivers = loadHydrowayMainRiversMock();
    const riverIds = rivers.features.map((f) => f.properties?.id);
    for (const id of HYDROWAY_V26_REQUIRED_RIVER_IDS) {
      expect(riverIds, `missing river ${id}`).toContain(id);
    }

    const corridors = loadHydrowayNavigableCorridorsMock();
    const corridorIds = corridors.features.map((f) => f.properties?.id);
    for (const id of HYDROWAY_V26_REQUIRED_CORRIDOR_IDS) {
      expect(corridorIds, `missing corridor ${id}`).toContain(id);
    }
    const corridorKinds = corridors.features.map((f) => f.properties?.corridorId);
    for (const kind of HYDROWAY_V26_REQUIRED_CORRIDOR_KINDS) {
      expect(corridorKinds, `missing corridor kind ${kind}`).toContain(kind);
    }

    const nodes = loadHydrowayPortsTerminalsMock();
    const nodeIds = nodes.features.map((f) => f.properties?.id);
    for (const id of HYDROWAY_V26_REQUIRED_NODE_IDS) {
      expect(nodeIds, `missing node ${id}`).toContain(id);
    }
  });

  it('features estáticas carregam metadados GOV-enriched obrigatórios', () => {
    const rivers = loadHydrowayMainRiversMock();
    const amazonas = rivers.features.find((f) => f.properties?.id === 'amazonas-solimoes');
    expect(amazonas?.properties?.waterwayCode).toBe('HN-100');
    expect(amazonas?.properties?.sourceInspiration).toBeTruthy();
    expect(amazonas?.properties?.sourceType).toBe('official-inspired');
    expect(amazonas?.properties?.confidence).toBeTruthy();
    expect(amazonas?.properties?.mockLevel).toBe('enriched');

    for (const field of HYDROWAY_V26_REQUIRED_GOV_FIELDS) {
      expect(amazonas?.properties?.[field], `missing ${field}`).toBeTruthy();
    }

    const corridors = loadHydrowayNavigableCorridorsMock();
    expect(corridors.features.every((f) => f.properties?.waterwayFamily && f.properties?.region)).toBe(
      true,
    );

    const nodes = loadHydrowayPortsTerminalsMock();
    expect(nodes.features.every((f) => f.properties?.city && f.properties?.state)).toBe(true);
    expect(nodes.features.every((f) => f.properties?.operationalRole)).toBe(true);
  });

  it('define rotas distintas e curvilíneas para CARGO-001, CARGO-002 e CARGO-004', () => {
    const routes = loadHydrowayCargoRoutesMock();
    expect(routes.features).toHaveLength(3);

    const byCargo = HYDROWAY_DEMO_CARGO_IDS.map((cargoId) => findHydrowayCargoRouteFeature(cargoId));
    expect(byCargo.every(Boolean)).toBe(true);

    const coords001 = byCargo[0]?.geometry.coordinates[0];
    const coords002 = byCargo[1]?.geometry.coordinates[0];
    const coords004 = byCargo[2]?.geometry.coordinates[0];

    expect(coords001).not.toEqual(coords002);
    expect(coords001).not.toEqual(coords004);
    expect(coords002).not.toEqual(coords004);

    expect(byCargo[0]?.properties?.corridorId).toBe('amazonas');
    expect(byCargo[0]?.properties?.originNodeId).toBe('port-belem');
    expect(byCargo[0]?.properties?.destinationNodeId).toBe('port-santarem');
    expect(byCargo[1]?.properties?.corridorId).toBe('amazonas');
    expect(byCargo[1]?.properties?.originNodeId).toBe('port-manaus');
    expect(byCargo[1]?.properties?.destinationNodeId).toBe('port-belem');
    expect(byCargo[2]?.properties?.corridorId).toBe('tocantins-araguaia');
    expect(byCargo[2]?.properties?.originNodeId).toBe('port-maraba');
    expect(byCargo[2]?.properties?.destinationNodeId).toBe('terminal-vila-conde');

    for (const route of byCargo) {
      if (!route || route.geometry.type !== 'LineString') continue;
      expect(route.geometry.coordinates.length).toBeGreaterThanOrEqual(HYDROWAY_V26_MIN_ROUTE_COORDINATES);
      expect(route.properties?.bbox).toHaveLength(4);
      expect(route.properties?.distanceKmApprox).toBeGreaterThan(0);
      expect(route.properties?.etaWindowMock).toBeTruthy();
    }

    expect(HYDROWAY_V26_DEMO_CARGO_IDS).toEqual(HYDROWAY_DEMO_CARGO_IDS);
  });

  it('mantém coordenadas dentro do bbox fictício amazônico', () => {
    const { west, east, south, north } = HYDROWAY_MOCK_GEO_BBOX;
    const routes = loadHydrowayCargoRoutesMock();

    for (const feature of routes.features) {
      if (feature.geometry.type !== 'LineString') continue;
      for (const [lng, lat] of feature.geometry.coordinates) {
        expect(lng).toBeGreaterThanOrEqual(west);
        expect(lng).toBeLessThanOrEqual(east);
        expect(lat).toBeGreaterThanOrEqual(south);
        expect(lat).toBeLessThanOrEqual(north);
      }
    }
  });

  it('IDs de features são únicos no corpus carregado', () => {
    const bundle = loadHydrowayStaticGeoBundle();
    const routes = loadHydrowayCargoRoutesMock();
    const ids = [
      ...bundle.mainRivers.features,
      ...bundle.navigableCorridors.features,
      ...bundle.portsTerminals.features,
      ...bundle.riskZones.features,
      ...routes.features,
    ].map((f) => f.properties?.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('loadHydrowayGeoJsonSources retorna bundle com estáticos, riskZones e dinâmicos vazios', () => {
    const sources = loadHydrowayGeoJsonSources();
    const staticBundle = loadHydrowayStaticGeoBundle();

    expect(sources.mainRivers).toBe(staticBundle.mainRivers);
    expect(sources.navigableCorridors).toBe(staticBundle.navigableCorridors);
    expect(sources.portsTerminals).toBe(staticBundle.portsTerminals);
    expect(sources.riskZones).toBe(staticBundle.riskZones);
    expect(sources.routeTrack.features).toHaveLength(0);
    expect(sources.vessel.features).toHaveLength(0);
  });

  it('reconhece ids demo de carga', () => {
    expect(isHydrowayDemoCargoId('CARGO-001')).toBe(true);
    expect(isHydrowayDemoCargoId('CARGO-999')).toBe(false);
  });
});
