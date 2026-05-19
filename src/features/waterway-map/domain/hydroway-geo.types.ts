import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';

/** Bbox fictício WGS84 (EPSG:4326) para mocks amazônicos — determinístico, alinhado ao spike. */
export const HYDROWAY_MOCK_GEO_BBOX = {
  west: -60.5,
  east: -47.0,
  south: -4.0,
  north: 0.5,
} as const;

export type HydrowayGeoBbox = readonly [
  west: number,
  south: number,
  east: number,
  north: number,
];

export const HYDROWAY_MOCK_GEO_BBOX_TUPLE: HydrowayGeoBbox = [
  HYDROWAY_MOCK_GEO_BBOX.west,
  HYDROWAY_MOCK_GEO_BBOX.south,
  HYDROWAY_MOCK_GEO_BBOX.east,
  HYDROWAY_MOCK_GEO_BBOX.north,
];

/** Orçamento ADR 0031 — estágio 1 mock GeoJSON. */
export const HYDROWAY_MOCK_GEO_BUDGET = {
  maxBytesPerFile: 200 * 1024,
  maxBytesCombined: 500 * 1024,
} as const;

export type HydrowayGeoKind =
  | 'river'
  | 'tributary'
  | 'secondary'
  | 'corridor'
  | 'port'
  | 'terminal'
  | 'route'
  | 'origin'
  | 'destination'
  | 'vessel';

/** Metadados GOV-enriched (V2.6) — todos opcionais nos mocks, prontos para camadas futuras. */
export type HydrowayGeoRichMetadata = {
  waterwayCode?: string;
  state?: string;
  city?: string;
  operationalStatus?: 'active' | 'attention' | 'restricted' | 'planned';
  strategicRole?: string;
  referenceContext?: string;
  sourceNote?: string;
  navigabilityRisk?: 'low' | 'medium' | 'high' | 'critical';
  importance?: 'low' | 'medium' | 'high' | 'critical';
  priority?: number;
};

export type HydrowayGeoFeatureProperties = HydrowayGeoRichMetadata & {
  id: string;
  name: string;
  kind: HydrowayGeoKind;
  corridorId?: WaterwayCorridorId;
  cargoId?: string;
  classification?: string;
  /** Graus fictícios; apenas para kind vessel quando presente. */
  heading?: number;
};

export type HydrowayGeoFeature = GeoJSON.Feature<GeoJSON.Geometry, HydrowayGeoFeatureProperties>;

export type HydrowayGeoFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  HydrowayGeoFeatureProperties
>;

export function isHydrowayGeoKind(value: string): value is HydrowayGeoKind {
  return (
    value === 'river' ||
    value === 'tributary' ||
    value === 'secondary' ||
    value === 'corridor' ||
    value === 'port' ||
    value === 'terminal' ||
    value === 'route' ||
    value === 'origin' ||
    value === 'destination' ||
    value === 'vessel'
  );
}
