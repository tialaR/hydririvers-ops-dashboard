import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { HydrowayDemoCargoId } from '../domain/hydroway-entities.types';
import type { HydrowayGeoFeatureCollection } from '../domain/hydroway-geo.types';
import type { HydrowayGeoJsonSources, HydrowayStaticGeoBundle } from '../domain/hydroway-map-model.types';

import { assertValidHydrowayGeoFeatureCollection, validateHydrowayMockCorpus } from './validate-mock-geojson';

const MOCK_GEOJSON_DIR = join(process.cwd(), 'src/features/waterway-map/data');

function readMockGeoJsonFile(filename: string): unknown {
  const raw = readFileSync(join(MOCK_GEOJSON_DIR, filename), 'utf8');
  return JSON.parse(raw) as unknown;
}

function freezeValidatedCollection(data: unknown, label: string): HydrowayGeoFeatureCollection {
  assertValidHydrowayGeoFeatureCollection(data, label, { requireGov: true });
  return Object.freeze(data) as HydrowayGeoFeatureCollection;
}

function mergeFeatureCollections(
  ...collections: HydrowayGeoFeatureCollection[]
): HydrowayGeoFeatureCollection {
  const features = collections.flatMap((collection) => collection.features);
  return Object.freeze({
    type: 'FeatureCollection',
    features: Object.freeze(features),
  }) as HydrowayGeoFeatureCollection;
}

const amazonMainRiversRaw = freezeValidatedCollection(
  readMockGeoJsonFile('amazon-main-rivers.mock.geojson'),
  'amazon-main-rivers.mock.geojson',
);
const amazonSecondaryRiversRaw = freezeValidatedCollection(
  readMockGeoJsonFile('amazon-secondary-rivers.mock.geojson'),
  'amazon-secondary-rivers.mock.geojson',
);
const amazonOperationalChannelsRaw = freezeValidatedCollection(
  readMockGeoJsonFile('amazon-operational-channels.mock.geojson'),
  'amazon-operational-channels.mock.geojson',
);
const amazonNavigableCorridors = freezeValidatedCollection(
  readMockGeoJsonFile('amazon-navigable-corridors.mock.geojson'),
  'amazon-navigable-corridors.mock.geojson',
);
const amazonLogisticsNodes = freezeValidatedCollection(
  readMockGeoJsonFile('amazon-logistics-nodes.mock.geojson'),
  'amazon-logistics-nodes.mock.geojson',
);
const amazonRiskZones = freezeValidatedCollection(
  readMockGeoJsonFile('amazon-risk-zones.mock.geojson'),
  'amazon-risk-zones.mock.geojson',
);
const cargoRoutes = freezeValidatedCollection(
  readMockGeoJsonFile('cargo-routes.mock.geojson'),
  'cargo-routes.mock.geojson',
);

const amazonMainRivers = mergeFeatureCollections(
  amazonMainRiversRaw,
  amazonSecondaryRiversRaw,
  amazonOperationalChannelsRaw,
);

validateHydrowayMockCorpus({
  mainRivers: amazonMainRivers,
  navigableCorridors: amazonNavigableCorridors,
  portsTerminals: amazonLogisticsNodes,
  riskZones: amazonRiskZones,
  cargoRoutes,
});

function emptyFeatureCollection(): GeoJSON.FeatureCollection {
  return Object.freeze({ type: 'FeatureCollection', features: [] }) as GeoJSON.FeatureCollection;
}

/** Carrega rios principais, afluentes, secundários e canais operacionais (mock V2.6). */
export function loadHydrowayMainRiversMock(): HydrowayGeoFeatureCollection {
  return amazonMainRivers;
}

/** Carrega apenas rios principais (artefato versionado). */
export function loadHydrowayMainRiversOnlyMock(): HydrowayGeoFeatureCollection {
  return amazonMainRiversRaw;
}

/** Carrega afluentes e rios secundários (artefato versionado). */
export function loadHydrowaySecondaryRiversMock(): HydrowayGeoFeatureCollection {
  return amazonSecondaryRiversRaw;
}

/** Carrega canais operacionais (artefato versionado). */
export function loadHydrowayOperationalChannelsMock(): HydrowayGeoFeatureCollection {
  return amazonOperationalChannelsRaw;
}

/** Carrega hidrovias classificadas navegáveis (mock versionado). */
export function loadHydrowayNavigableCorridorsMock(): HydrowayGeoFeatureCollection {
  return amazonNavigableCorridors;
}

/** Carrega portos, terminais e nós de transbordo (mock versionado). */
export function loadHydrowayPortsTerminalsMock(): HydrowayGeoFeatureCollection {
  return amazonLogisticsNodes;
}

/** Carrega zonas de atenção e várzeas sutis (mock versionado). */
export function loadHydrowayRiskZonesMock(): HydrowayGeoFeatureCollection {
  return amazonRiskZones;
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

/** Bundle estático: rede hidroviária + nós + zonas. */
export function loadHydrowayStaticGeoBundle(): HydrowayStaticGeoBundle {
  return {
    mainRivers: loadHydrowayMainRiversMock(),
    navigableCorridors: loadHydrowayNavigableCorridorsMock(),
    portsTerminals: loadHydrowayPortsTerminalsMock(),
    riskZones: loadHydrowayRiskZonesMock(),
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

/** Bytes UTF-8 dos artefatos mock (para testes de budget). */
export function getHydrowayMockGeoJsonByteSizes(): Record<string, number> {
  return {
    'amazon-main-rivers.mock.geojson': JSON.stringify(amazonMainRiversRaw).length,
    'amazon-secondary-rivers.mock.geojson': JSON.stringify(amazonSecondaryRiversRaw).length,
    'amazon-operational-channels.mock.geojson': JSON.stringify(amazonOperationalChannelsRaw).length,
    'amazon-navigable-corridors.mock.geojson': JSON.stringify(amazonNavigableCorridors).length,
    'amazon-logistics-nodes.mock.geojson': JSON.stringify(amazonLogisticsNodes).length,
    'amazon-risk-zones.mock.geojson': JSON.stringify(amazonRiskZones).length,
    'cargo-routes.mock.geojson': JSON.stringify(cargoRoutes).length,
  };
}
