import type { WaterwayCorridorId } from '@/features/waterway-tracking/domain/waterway-corridor.types';

import { HYDROWAY_MOCK_GEO_BBOX } from '../domain/hydroway-geo.types';

export type HydrowayResolvedLocation = {
  coordinates: GeoJSON.Position;
  label: string;
  usedFallback: boolean;
};

const TRACKING_CORRIDOR_TO_GEO: Record<string, WaterwayCorridorId> = {
  'corridor-amazonas': 'amazonas',
  'corridor-madeira': 'madeira',
  'corridor-tapajos': 'tapajos-teles-pires',
  'corridor-tocantins': 'tocantins-araguaia',
  'corridor-barra-norte': 'barra-norte',
};

/** Pontos WGS84 fictícios alinhados aos mocks V2.2a (ports-terminals + cargo-routes). */
const KNOWN_LOCATION_COORDINATES: Record<string, GeoJSON.Position> = {
  'belem pa': [-48.51875, -1.65],
  'belem para': [-48.51875, -1.65],
  'santarem pa': [-52.23125, -1.84],
  'manaus am': [-56.1125, -1.79],
  'maraba pa': [-51.725, -2.0],
  'vila do conde pa': [-48.0125, -1.46],
  'macapa ap': [-51.0, -0.5],
  'itacoatiara am': [-54.0, -1.72],
  'porto velho ro': [-58.5, -2.2],
  'tefe am': [-58.0, -1.5],
  'obidos pa': [-50.5, -1.75],
  'breves pa': [-49.5, -1.7],
  'terminal manaus norte': [-56.1125, -1.79],
  'terminal santarem oeste': [-52.15, -1.82],
  'terminal porto velho graneleiro': [-58.5, -2.2],
  'terminal itacoatiara sul': [-54.0, -1.72],
  'terminal maraba': [-51.725, -2.0],
  'terminal vila do conde': [-48.0125, -1.46],
};

export function normalizeHydrowayLocationKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mapTrackingCorridorToGeoCorridor(corridorId: string | undefined): WaterwayCorridorId {
  if (!corridorId) {
    return 'amazonas';
  }
  if (TRACKING_CORRIDOR_TO_GEO[corridorId]) {
    return TRACKING_CORRIDOR_TO_GEO[corridorId];
  }
  const normalized = corridorId.replace(/^corridor-/, '');
  const candidates: WaterwayCorridorId[] = [
    'amazonas',
    'madeira',
    'tapajos-teles-pires',
    'tocantins-araguaia',
    'barra-norte',
  ];
  if (candidates.includes(normalized as WaterwayCorridorId)) {
    return normalized as WaterwayCorridorId;
  }
  return 'amazonas';
}

function hashLocationToLngLat(source: string): GeoJSON.Position {
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  const positive = Math.abs(hash);
  const { west, east, south, north } = HYDROWAY_MOCK_GEO_BBOX;
  const lng = west + ((positive % 10000) / 10000) * (east - west);
  const lat = south + ((Math.floor(positive / 17) % 10000) / 10000) * (north - south);
  return [roundCoord(lng), roundCoord(lat)];
}

function roundCoord(value: number): number {
  return Math.round(value * 1e5) / 1e5;
}

function lookupKnownCoordinates(key: string): GeoJSON.Position | undefined {
  if (KNOWN_LOCATION_COORDINATES[key]) {
    return KNOWN_LOCATION_COORDINATES[key];
  }
  const withoutState = key.replace(/\b[a-z]{2}\b/g, '').replace(/\s+/g, ' ').trim();
  if (withoutState && KNOWN_LOCATION_COORDINATES[withoutState]) {
    return KNOWN_LOCATION_COORDINATES[withoutState];
  }
  return undefined;
}

/**
 * Resolve rótulo de localidade para coordenadas WGS84 fictícias.
 * Desconhecidos recebem hash determinístico dentro do bbox mock (ADR 0031).
 */
export function resolveHydrowayLocation(label: string): HydrowayResolvedLocation {
  const trimmed = label.trim() || 'unknown';
  const key = normalizeHydrowayLocationKey(trimmed);
  const known = lookupKnownCoordinates(key);

  if (known) {
    return {
      coordinates: known,
      label: trimmed,
      usedFallback: false,
    };
  }

  return {
    coordinates: hashLocationToLngLat(key || 'unknown'),
    label: trimmed,
    usedFallback: true,
  };
}

export function formatHydrowayShortLocation(location: string): string {
  return location.split(',')[0]?.trim() ?? location;
}
