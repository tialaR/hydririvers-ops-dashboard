import {
  HYDROWAY_V26_DEMO_CARGO_IDS,
  HYDROWAY_V26_MIN_ROUTE_COORDINATES,
  HYDROWAY_V26_REQUIRED_CORRIDOR_IDS,
  HYDROWAY_V26_REQUIRED_GOV_FIELDS,
  HYDROWAY_V26_REQUIRED_NODE_IDS,
  HYDROWAY_V26_REQUIRED_RIVER_IDS,
} from './hydroway-mock-coverage';
import {
  HYDROWAY_MOCK_GEO_BBOX,
  type HydrowayGeoConfidence,
  type HydrowayGeoFeatureCollection,
  type HydrowayGeoFeatureProperties,
  type HydrowayGeoMockLevel,
  type HydrowayGeoSourceType,
  isHydrowayGeoKind,
} from '../domain/hydroway-geo.types';

export type HydrowayGeoValidationIssue = {
  path: string;
  message: string;
};

export type HydrowayGeoValidationResult = {
  valid: boolean;
  issues: HydrowayGeoValidationIssue[];
};

const SOURCE_TYPES = new Set<HydrowayGeoSourceType>([
  'official-inspired',
  'domain-inspired',
  'synthetic',
]);

const CONFIDENCE_LEVELS = new Set<HydrowayGeoConfidence>(['high', 'medium', 'low']);

const MOCK_LEVELS = new Set<HydrowayGeoMockLevel>(['enriched', 'schematic', 'placeholder']);

function pushIssue(issues: HydrowayGeoValidationIssue[], path: string, message: string) {
  issues.push({ path, message });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPosition(value: unknown): value is GeoJSON.Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

function isPositionInBbox(position: GeoJSON.Position): boolean {
  const [lng, lat] = position;
  return (
    lng >= HYDROWAY_MOCK_GEO_BBOX.west &&
    lng <= HYDROWAY_MOCK_GEO_BBOX.east &&
    lat >= HYDROWAY_MOCK_GEO_BBOX.south &&
    lat <= HYDROWAY_MOCK_GEO_BBOX.north
  );
}

function validateGovMetadata(
  properties: Record<string, unknown>,
  base: string,
  issues: HydrowayGeoValidationIssue[],
  requireGov: boolean,
) {
  if (!requireGov) return;

  for (const field of HYDROWAY_V26_REQUIRED_GOV_FIELDS) {
    if (properties[field] === undefined || properties[field] === '') {
      pushIssue(issues, `${base}.${field}`, `${field} is required on enriched mock features`);
    }
  }

  const sourceType = properties.sourceType;
  if (sourceType !== undefined && !SOURCE_TYPES.has(sourceType as HydrowayGeoSourceType)) {
    pushIssue(issues, `${base}.sourceType`, 'sourceType must be official-inspired | domain-inspired | synthetic');
  }

  const confidence = properties.confidence;
  if (confidence !== undefined && !CONFIDENCE_LEVELS.has(confidence as HydrowayGeoConfidence)) {
    pushIssue(issues, `${base}.confidence`, 'confidence must be high | medium | low');
  }

  const mockLevel = properties.mockLevel;
  if (mockLevel !== undefined && !MOCK_LEVELS.has(mockLevel as HydrowayGeoMockLevel)) {
    pushIssue(issues, `${base}.mockLevel`, 'mockLevel must be enriched | schematic | placeholder');
  }

  if (properties.lastReviewed !== undefined && typeof properties.lastReviewed !== 'string') {
    pushIssue(issues, `${base}.lastReviewed`, 'lastReviewed must be a stable ISO date string');
  }
}

function validateProperties(
  properties: unknown,
  featureIndex: number,
  issues: HydrowayGeoValidationIssue[],
  options: { requireGov?: boolean } = {},
): properties is HydrowayGeoFeatureProperties {
  const base = `features[${featureIndex}].properties`;

  if (!isRecord(properties)) {
    pushIssue(issues, base, 'properties must be an object');
    return false;
  }

  const { id, name, kind } = properties;

  if (typeof id !== 'string' || id.length === 0) {
    pushIssue(issues, `${base}.id`, 'id must be a non-empty string');
  }

  if (typeof name !== 'string' || name.length === 0) {
    pushIssue(issues, `${base}.name`, 'name must be a non-empty string');
  }

  if (typeof kind !== 'string' || !isHydrowayGeoKind(kind)) {
    pushIssue(issues, `${base}.kind`, 'kind must be a known HydrowayGeoKind');
  }

  if (properties.corridorId !== undefined && typeof properties.corridorId !== 'string') {
    pushIssue(issues, `${base}.corridorId`, 'corridorId must be a string when present');
  }

  if (properties.cargoId !== undefined && typeof properties.cargoId !== 'string') {
    pushIssue(issues, `${base}.cargoId`, 'cargoId must be a string when present');
  }

  const optionalStrings = [
    'waterwayCode',
    'waterway',
    'waterwayFamily',
    'region',
    'state',
    'city',
    'operationalStatus',
    'operationalRole',
    'cargoProfile',
    'cargoProfiles',
    'strategicRole',
    'referenceContext',
    'sourceNote',
    'sourceNotes',
    'sourceInspiration',
    'navigability',
    'dredgingPriority',
    'drySeasonRisk',
    'navigabilityRisk',
    'importance',
    'classification',
    'visualPurpose',
    'visualPriority',
    'routeId',
    'originNodeId',
    'destinationNodeId',
    'etaWindowMock',
  ] as const;

  for (const key of optionalStrings) {
    if (properties[key] !== undefined && typeof properties[key] !== 'string') {
      pushIssue(issues, `${base}.${key}`, `${key} must be a string when present`);
    }
  }

  if (properties.priority !== undefined && typeof properties.priority !== 'number') {
    pushIssue(issues, `${base}.priority`, 'priority must be a number when present');
  }

  if (properties.progress !== undefined && typeof properties.progress !== 'number') {
    pushIssue(issues, `${base}.progress`, 'progress must be a number when present');
  }

  if (properties.distanceKmApprox !== undefined && typeof properties.distanceKmApprox !== 'number') {
    pushIssue(issues, `${base}.distanceKmApprox`, 'distanceKmApprox must be a number when present');
  }

  validateGovMetadata(properties, base, issues, options.requireGov ?? false);

  return issues.length === 0;
}

function validateLineCoordinates(
  coordinates: unknown,
  base: string,
  issues: HydrowayGeoValidationIssue[],
  minPoints = 2,
) {
  if (!Array.isArray(coordinates) || coordinates.length < minPoints) {
    pushIssue(issues, base, `LineString must have at least ${minPoints} positions`);
    return;
  }
  coordinates.forEach((coord, coordIndex) => {
    if (!isPosition(coord)) {
      pushIssue(issues, `${base}[${coordIndex}]`, 'invalid position');
      return;
    }
    if (!isPositionInBbox(coord)) {
      pushIssue(issues, `${base}[${coordIndex}]`, 'position outside HYDROWAY_MOCK_GEO_BBOX');
    }
  });
}

function validatePolygonCoordinates(
  coordinates: unknown,
  base: string,
  issues: HydrowayGeoValidationIssue[],
) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    pushIssue(issues, base, 'Polygon must have at least one ring');
    return;
  }
  const ring = coordinates[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    pushIssue(issues, base, 'Polygon outer ring must have at least four positions');
    return;
  }
  ring.forEach((coord, coordIndex) => {
    if (!isPosition(coord)) {
      pushIssue(issues, `${base}[0][${coordIndex}]`, 'invalid position');
      return;
    }
    if (!isPositionInBbox(coord)) {
      pushIssue(issues, `${base}[0][${coordIndex}]`, 'position outside HYDROWAY_MOCK_GEO_BBOX');
    }
  });
}

function validateGeometryCoordinates(
  geometry: GeoJSON.Geometry,
  featureIndex: number,
  issues: HydrowayGeoValidationIssue[],
  minLinePoints = 2,
) {
  const base = `features[${featureIndex}].geometry`;

  if (geometry.type === 'Point') {
    if (!isPosition(geometry.coordinates)) {
      pushIssue(issues, base, 'Point coordinates must be [lng, lat]');
      return;
    }
    if (!isPositionInBbox(geometry.coordinates)) {
      pushIssue(issues, base, 'Point outside HYDROWAY_MOCK_GEO_BBOX');
    }
    return;
  }

  if (geometry.type === 'LineString') {
    validateLineCoordinates(geometry.coordinates, `${base}.coordinates`, issues, minLinePoints);
    return;
  }

  if (geometry.type === 'Polygon') {
    validatePolygonCoordinates(geometry.coordinates, `${base}.coordinates`, issues);
    return;
  }

  pushIssue(issues, base, `unsupported geometry type: ${geometry.type}`);
}

/** Valida shape e propriedades mínimas de um FeatureCollection mock. */
export function validateHydrowayGeoFeatureCollection(
  collection: unknown,
  label = 'FeatureCollection',
  options: { requireGov?: boolean; minLinePoints?: number } = {},
): HydrowayGeoValidationResult {
  const issues: HydrowayGeoValidationIssue[] = [];

  if (!isRecord(collection) || collection.type !== 'FeatureCollection') {
    pushIssue(issues, label, 'root must be a GeoJSON FeatureCollection');
    return { valid: false, issues };
  }

  if (!Array.isArray(collection.features)) {
    pushIssue(issues, `${label}.features`, 'features must be an array');
    return { valid: false, issues };
  }

  const ids = new Set<string>();

  collection.features.forEach((feature, featureIndex) => {
    const featurePath = `${label}.features[${featureIndex}]`;

    if (!isRecord(feature) || feature.type !== 'Feature') {
      pushIssue(issues, featurePath, 'feature must be a GeoJSON Feature');
      return;
    }

    validateProperties(feature.properties, featureIndex, issues, options);

    const featureId = isRecord(feature.properties) ? feature.properties.id : undefined;
    if (typeof featureId === 'string') {
      if (ids.has(featureId)) {
        pushIssue(issues, `${featurePath}.properties.id`, `duplicate feature id: ${featureId}`);
      }
      ids.add(featureId);
    }

    if (!isRecord(feature.geometry) || typeof feature.geometry.type !== 'string') {
      pushIssue(issues, `${featurePath}.geometry`, 'geometry must be present');
      return;
    }

    validateGeometryCoordinates(
      feature.geometry as unknown as GeoJSON.Geometry,
      featureIndex,
      issues,
      options.minLinePoints ?? 2,
    );
  });

  return { valid: issues.length === 0, issues };
}

export function assertValidHydrowayGeoFeatureCollection(
  collection: unknown,
  label?: string,
  options?: { requireGov?: boolean; minLinePoints?: number },
): asserts collection is HydrowayGeoFeatureCollection {
  const result = validateHydrowayGeoFeatureCollection(collection, label, options);
  if (!result.valid) {
    const summary = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    throw new Error(`Invalid Hydroway GeoJSON (${label ?? 'FeatureCollection'}): ${summary}`);
  }
}

export type HydrowayMockCorpus = {
  mainRivers: HydrowayGeoFeatureCollection;
  navigableCorridors: HydrowayGeoFeatureCollection;
  portsTerminals: HydrowayGeoFeatureCollection;
  riskZones: HydrowayGeoFeatureCollection;
  cargoRoutes: HydrowayGeoFeatureCollection;
};

/** Valida cobertura V2.6, IDs únicos globais e rotas demo. */
export function validateHydrowayMockCorpus(corpus: HydrowayMockCorpus): HydrowayGeoValidationResult {
  const issues: HydrowayGeoValidationIssue[] = [];
  const globalIds = new Set<string>();

  const trackId = (id: string, path: string) => {
    if (globalIds.has(id)) {
      pushIssue(issues, path, `duplicate global feature id: ${id}`);
    }
    globalIds.add(id);
  };

  for (const id of HYDROWAY_V26_REQUIRED_RIVER_IDS) {
    const found = corpus.mainRivers.features.some((f) => f.properties?.id === id);
    if (!found) {
      pushIssue(issues, 'corpus.mainRivers', `missing required river id: ${id}`);
    }
  }

  for (const id of HYDROWAY_V26_REQUIRED_CORRIDOR_IDS) {
    const found = corpus.navigableCorridors.features.some((f) => f.properties?.id === id);
    if (!found) {
      pushIssue(issues, 'corpus.navigableCorridors', `missing required corridor id: ${id}`);
    }
  }

  for (const id of HYDROWAY_V26_REQUIRED_NODE_IDS) {
    const found = corpus.portsTerminals.features.some((f) => f.properties?.id === id);
    if (!found) {
      pushIssue(issues, 'corpus.portsTerminals', `missing required node id: ${id}`);
    }
  }

  const allCollections = [
    ['mainRivers', corpus.mainRivers],
    ['navigableCorridors', corpus.navigableCorridors],
    ['portsTerminals', corpus.portsTerminals],
    ['riskZones', corpus.riskZones],
    ['cargoRoutes', corpus.cargoRoutes],
  ] as const;

  for (const [label, collection] of allCollections) {
    for (const feature of collection.features) {
      const id = feature.properties?.id;
      if (id) {
        trackId(id, `corpus.${label}.features.${id}`);
      }
    }
  }

  for (const cargoId of HYDROWAY_V26_DEMO_CARGO_IDS) {
    const route = corpus.cargoRoutes.features.find((f) => f.properties?.cargoId === cargoId);
    if (!route) {
      pushIssue(issues, 'corpus.cargoRoutes', `missing demo route for ${cargoId}`);
      continue;
    }
    if (route.geometry.type !== 'LineString') {
      pushIssue(issues, `corpus.cargoRoutes.${cargoId}`, 'route must be LineString');
      continue;
    }
    if (route.geometry.coordinates.length < HYDROWAY_V26_MIN_ROUTE_COORDINATES) {
      pushIssue(
        issues,
        `corpus.cargoRoutes.${cargoId}`,
        `route must have at least ${HYDROWAY_V26_MIN_ROUTE_COORDINATES} coordinates`,
      );
    }
    const bbox = route.properties?.bbox;
    if (!Array.isArray(bbox) || bbox.length !== 4) {
      pushIssue(issues, `corpus.cargoRoutes.${cargoId}`, 'route must include bbox [west,south,east,north]');
    }
    if (!route.properties?.originNodeId || !route.properties?.destinationNodeId) {
      pushIssue(issues, `corpus.cargoRoutes.${cargoId}`, 'route must include originNodeId and destinationNodeId');
    }
  }

  if (corpus.cargoRoutes.features.length !== HYDROWAY_V26_DEMO_CARGO_IDS.length) {
    pushIssue(
      issues,
      'corpus.cargoRoutes',
      `expected ${HYDROWAY_V26_DEMO_CARGO_IDS.length} cargo routes`,
    );
  }

  return { valid: issues.length === 0, issues };
}
