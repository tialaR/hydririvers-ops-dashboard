import {
  HYDROWAY_MOCK_GEO_BBOX,
  type HydrowayGeoFeatureCollection,
  type HydrowayGeoFeatureProperties,
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

function validateProperties(
  properties: unknown,
  featureIndex: number,
  issues: HydrowayGeoValidationIssue[],
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

  return issues.length === 0;
}

function validateGeometryCoordinates(
  geometry: GeoJSON.Geometry,
  featureIndex: number,
  issues: HydrowayGeoValidationIssue[],
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
    if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) {
      pushIssue(issues, base, 'LineString must have at least two positions');
      return;
    }
    geometry.coordinates.forEach((coord, coordIndex) => {
      if (!isPosition(coord)) {
        pushIssue(issues, `${base}.coordinates[${coordIndex}]`, 'invalid position');
        return;
      }
      if (!isPositionInBbox(coord)) {
        pushIssue(issues, `${base}.coordinates[${coordIndex}]`, 'position outside HYDROWAY_MOCK_GEO_BBOX');
      }
    });
    return;
  }

  pushIssue(issues, base, `unsupported geometry type: ${geometry.type}`);
}

/** Valida shape e propriedades mínimas de um FeatureCollection mock. */
export function validateHydrowayGeoFeatureCollection(
  collection: unknown,
  label = 'FeatureCollection',
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

  collection.features.forEach((feature, featureIndex) => {
    const featurePath = `${label}.features[${featureIndex}]`;

    if (!isRecord(feature) || feature.type !== 'Feature') {
      pushIssue(issues, featurePath, 'feature must be a GeoJSON Feature');
      return;
    }

    validateProperties(feature.properties, featureIndex, issues);

    if (!isRecord(feature.geometry) || typeof feature.geometry.type !== 'string') {
      pushIssue(issues, `${featurePath}.geometry`, 'geometry must be present');
      return;
    }

    validateGeometryCoordinates(feature.geometry as unknown as GeoJSON.Geometry, featureIndex, issues);
  });

  return { valid: issues.length === 0, issues };
}

export function assertValidHydrowayGeoFeatureCollection(
  collection: unknown,
  label?: string,
): asserts collection is HydrowayGeoFeatureCollection {
  const result = validateHydrowayGeoFeatureCollection(collection, label);
  if (!result.valid) {
    const summary = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    throw new Error(`Invalid Hydroway GeoJSON (${label ?? 'FeatureCollection'}): ${summary}`);
  }
}
