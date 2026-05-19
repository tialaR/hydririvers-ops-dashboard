import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { HydrowayDemoCargoId } from '../domain/hydroway-entities.types';
import type { HydrowayGeoFeatureCollection } from '../domain/hydroway-geo.types';
import type { HydrowayGeoJsonSources, HydrowayStaticGeoBundle } from '../domain/hydroway-map-model.types';

import { assertValidHydrowayGeoFeatureCollection } from './validate-mock-geojson';

const MOCK_GEOJSON_DIR = join(process.cwd(), 'src/features/waterway-map/data');

function readMockGeoJsonFile(filename: string): unknown {
  const raw = readFileSync(join(MOCK_GEOJSON_DIR, filename), 'utf8');
  return JSON.parse(raw) as unknown;
}

const amazonMainRivers = freezeValidatedCollection(
  readMockGeoJsonFile('amazon-main-rivers.mock.geojson'),
  'amazon-main-rivers.mock.geojson',
);
const amazonNavigableCorridors = freezeValidatedCollection(
  readMockGeoJsonFile('amazon-navigable-corridors.mock.geojson'),
  'amazon-navigable-corridors.mock.geojson',
);
const amazonPortsTerminals = freezeValidatedCollection(
  readMockGeoJsonFile('amazon-ports-terminals.mock.geojson'),
  'amazon-ports-terminals.mock.geojson',
);
const cargoRoutes = freezeValidatedCollection(
  readMockGeoJsonFile('cargo-routes.mock.geojson'),
  'cargo-routes.mock.geojson',
);

function freezeValidatedCollection(data: unknown, label: string): HydrowayGeoFeatureCollection {
  assertValidHydrowayGeoFeatureCollection(data, label);
  return Object.freeze(data) as HydrowayGeoFeatureCollection;
}

function emptyFeatureCollection(): GeoJSON.FeatureCollection {
  return Object.freeze({ type: 'FeatureCollection', features: [] }) as GeoJSON.FeatureCollection;
}

/** Carrega rios principais e afluentes (mock versionado). */
export function loadHydrowayMainRiversMock(): HydrowayGeoFeatureCollection {
  return amazonMainRivers;
}

/** Carrega hidrovias classificadas navegáveis (mock versionado). */
export function loadHydrowayNavigableCorridorsMock(): HydrowayGeoFeatureCollection {
  return amazonNavigableCorridors;
}

/** Carrega portos interiores e terminais (mock versionado). */
export function loadHydrowayPortsTerminalsMock(): HydrowayGeoFeatureCollection {
  return amazonPortsTerminals;
}

/** Carrega rotas demo por cargoId (mock versionado). */
export function loadHydrowayCargoRoutesMock(): HydrowayGeoFeatureCollection {
  return cargoRoutes;
}

/** Retorna a rota LineString de um cargo demo, se existir no artefato. */
export function findHydrowayCargoRouteFeature(
  cargoId: HydrowayDemoCargoId,
): GeoJSON.Feature<GeoJSON.LineString> | undefined {
  const feature = cargoRoutes.features.find(
    (entry) => entry.properties?.cargoId === cargoId && entry.geometry.type === 'LineString',
  );
  if (!feature || feature.geometry.type !== 'LineString') {
    return undefined;
  }
  return feature as GeoJSON.Feature<GeoJSON.LineString>;
}

/** Bundle estático: rios, corredores, portos/terminais. */
export function loadHydrowayStaticGeoBundle(): HydrowayStaticGeoBundle {
  return {
    mainRivers: loadHydrowayMainRiversMock(),
    navigableCorridors: loadHydrowayNavigableCorridorsMock(),
    portsTerminals: loadHydrowayPortsTerminalsMock(),
  };
}

/** Fontes dinâmicas vazias — preenchidas pelo adapter em V2.2b. */
export function createEmptyHydrowayDynamicGeoSources(): Pick<
  HydrowayGeoJsonSources,
  'routeTrack' | 'routeTraveled' | 'origin' | 'destination' | 'vessel' | 'routeBounds'
> {
  return {
    routeTrack: emptyFeatureCollection(),
    routeTraveled: emptyFeatureCollection(),
    origin: emptyFeatureCollection(),
    destination: emptyFeatureCollection(),
    vessel: emptyFeatureCollection(),
    routeBounds: emptyFeatureCollection(),
  };
}

/**
 * Monta todas as fontes GeoJSON: estáticas + dinâmicas vazias.
 * Fontes dinâmicas vazias — preenchidas pelo adapter; spike V2.2c usa `resolveSpikeHydrowayMapModel`.
 */
export function loadHydrowayGeoJsonSources(): HydrowayGeoJsonSources {
  const staticBundle = loadHydrowayStaticGeoBundle();
  const dynamic = createEmptyHydrowayDynamicGeoSources();

  return {
    ...staticBundle,
    ...dynamic,
  };
}

/** Bytes UTF-8 dos quatro artefatos mock (para testes de budget). */
export function getHydrowayMockGeoJsonByteSizes(): Record<string, number> {
  const files = {
    'amazon-main-rivers.mock.geojson': JSON.stringify(amazonMainRivers).length,
    'amazon-navigable-corridors.mock.geojson': JSON.stringify(amazonNavigableCorridors).length,
    'amazon-ports-terminals.mock.geojson': JSON.stringify(amazonPortsTerminals).length,
    'cargo-routes.mock.geojson': JSON.stringify(cargoRoutes).length,
  };
  return files;
}
