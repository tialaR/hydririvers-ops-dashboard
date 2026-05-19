import { describe, expect, it } from 'vitest';

import {
  HYDROWAY_DEMO_CARGO_IDS,
  isHydrowayDemoCargoId,
} from '@/features/waterway-map/domain/hydroway-entities.types';
import { HYDROWAY_MOCK_GEO_BBOX } from '@/features/waterway-map/domain/hydroway-geo.types';
import {
  findHydrowayCargoRouteFeature,
  loadHydrowayCargoRoutesMock,
  loadHydrowayGeoJsonSources,
  loadHydrowayMainRiversMock,
  loadHydrowayNavigableCorridorsMock,
  loadHydrowayPortsTerminalsMock,
  loadHydrowayStaticGeoBundle,
} from '@/features/waterway-map/data/load-mock-geojson';
import { validateHydrowayGeoFeatureCollection } from '@/features/waterway-map/data/validate-mock-geojson';

describe('hydroway mock geojson schema', () => {
  it('valida os quatro artefatos mock versionados', () => {
    const collections = [
      ['main rivers', loadHydrowayMainRiversMock()],
      ['navigable corridors', loadHydrowayNavigableCorridorsMock()],
      ['ports terminals', loadHydrowayPortsTerminalsMock()],
      ['cargo routes', loadHydrowayCargoRoutesMock()],
    ] as const;

    for (const [label, collection] of collections) {
      const result = validateHydrowayGeoFeatureCollection(collection, label);
      expect(result.valid, result.issues.map((i) => i.message).join('; ')).toBe(true);
    }
  });

  it('expõe rios, corredores e portos/terminais com kinds esperados', () => {
    const rivers = loadHydrowayMainRiversMock();
    const riverKinds = [...new Set(rivers.features.map((f) => f.properties?.kind))].sort();
    expect(riverKinds).toEqual(['river', 'secondary', 'tributary']);
    expect(rivers.features.filter((f) => f.properties?.kind === 'river').length).toBeGreaterThanOrEqual(1);
    expect(rivers.features.filter((f) => f.properties?.kind === 'tributary').length).toBeGreaterThanOrEqual(3);
    expect(rivers.features.filter((f) => f.properties?.kind === 'secondary').length).toBeGreaterThanOrEqual(2);

    const corridors = loadHydrowayNavigableCorridorsMock();
    expect(corridors.features.every((f) => f.properties?.kind === 'corridor')).toBe(true);
    expect(corridors.features.length).toBeGreaterThanOrEqual(3);

    const ports = loadHydrowayPortsTerminalsMock();
    const kinds = ports.features.map((f) => f.properties?.kind).sort();
    expect(kinds).toContain('port');
    expect(kinds).toContain('terminal');
  });

  it('define rotas distintas para CARGO-001, CARGO-002 e CARGO-004', () => {
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

  it('loadHydrowayGeoJsonSources retorna bundle com estáticos e dinâmicos vazios', () => {
    const sources = loadHydrowayGeoJsonSources();
    const staticBundle = loadHydrowayStaticGeoBundle();

    expect(sources.mainRivers).toBe(staticBundle.mainRivers);
    expect(sources.navigableCorridors).toBe(staticBundle.navigableCorridors);
    expect(sources.portsTerminals).toBe(staticBundle.portsTerminals);
    expect(sources.routeTrack.features).toHaveLength(0);
    expect(sources.vessel.features).toHaveLength(0);
  });

  it('reconhece ids demo de carga', () => {
    expect(isHydrowayDemoCargoId('CARGO-001')).toBe(true);
    expect(isHydrowayDemoCargoId('CARGO-999')).toBe(false);
  });
});
