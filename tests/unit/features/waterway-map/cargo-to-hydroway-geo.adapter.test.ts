import { describe, expect, it } from 'vitest';

import { adaptCargoToHydrowayMapModel } from '@/features/waterway-map/adapters/cargo-to-hydroway-geo.adapter';
import { resolveHydrowayLocation } from '@/features/waterway-map/adapters/location-resolver';
import { HYDROWAY_MOCK_GEO_BBOX } from '@/features/waterway-map/domain/hydroway-geo.types';
import {
  findHydrowayCargoRouteFeature,
  loadHydrowayCargoRoutesMock,
} from '@/features/waterway-map/data/load-mock-geojson.server';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { cargoWaterwayTrackingByCargoId } from '@/features/waterway-tracking/waterway-compat';

const CARGO_004: Cargo = {
  id: 'CARGO-004',
  title: 'Grãos — corredor Tocantins (mock)',
  origin: 'Marabá, PA',
  destination: 'Vila do Conde, PA',
  volume: '40 t',
  window: '10-14 maio',
  cargoType: 'Seca',
  status: 'contracting',
  co2Saving: '-40% CO₂',
  targetPrice: 'R$ 12.000',
};

function cargoById(id: string): Cargo {
  const found = publicCargosMock.find((entry) => entry.id === id);
  if (found) return found;
  if (id === 'CARGO-004') return CARGO_004;
  throw new Error(`missing cargo fixture: ${id}`);
}

function isWithinMockBbox(coord: GeoJSON.Position) {
  const [lng, lat] = coord;
  return (
    lng >= HYDROWAY_MOCK_GEO_BBOX.west &&
    lng <= HYDROWAY_MOCK_GEO_BBOX.east &&
    lat >= HYDROWAY_MOCK_GEO_BBOX.south &&
    lat <= HYDROWAY_MOCK_GEO_BBOX.north
  );
}

function lineCoords(collection: GeoJSON.FeatureCollection): GeoJSON.Position[] {
  const feature = collection.features[0];
  if (!feature || feature.geometry.type !== 'LineString') return [];
  return feature.geometry.coordinates;
}

function pointCoord(collection: GeoJSON.FeatureCollection): GeoJSON.Position | undefined {
  const feature = collection.features[0];
  if (!feature || feature.geometry.type !== 'Point') return undefined;
  return feature.geometry.coordinates;
}

describe('adaptCargoToHydrowayMapModel', () => {
  it('monta cena CARGO-001 com rota demo, progresso 0.15 e metadados', () => {
    const model = adaptCargoToHydrowayMapModel({
      cargo: cargoById('CARGO-001'),
      tracking: cargoWaterwayTrackingByCargoId.get('CARGO-001'),
    });

    expect(model.cargoId).toBe('CARGO-001');
    expect(model.corridorId).toBe('amazonas');
    expect(model.progress01).toBe(0.15);
    expect(model.metadata.routeSource).toBe('demo-geojson');
    expect(model.metadata.originLabel).toBe('Belém');
    expect(model.metadata.destinationLabel).toBe('Santarém');

    const demoRoute = findHydrowayCargoRouteFeature('CARGO-001');
    expect(lineCoords(model.geo.routeTrack)).toEqual(demoRoute?.geometry.coordinates);
    expect(model.geo.routeTrack.features[0]?.properties?.cargoId).toBe('CARGO-001');
    expect(model.geo.vessel.features).toHaveLength(1);
    expect(model.geo.origin.features).toHaveLength(1);
    expect(model.geo.destination.features).toHaveLength(1);
  });

  it('monta cena CARGO-002 distinta com corredor amazonas e progresso 0.25', () => {
    const model = adaptCargoToHydrowayMapModel({
      cargo: cargoById('CARGO-002'),
    });

    const model001 = adaptCargoToHydrowayMapModel({ cargo: cargoById('CARGO-001') });

    expect(model.corridorId).toBe('amazonas');
    expect(model.progress01).toBe(0.25);
    expect(lineCoords(model.geo.routeTrack)[0]).not.toEqual(lineCoords(model001.geo.routeTrack)[0]);
  });

  it('monta cena CARGO-004 com corredor tocantins-araguaia e progresso 0.4', () => {
    const model = adaptCargoToHydrowayMapModel({
      cargo: CARGO_004,
      tracking: cargoWaterwayTrackingByCargoId.get('CARGO-004'),
    });

    expect(model.corridorId).toBe('tocantins-araguaia');
    expect(model.progress01).toBe(0.4);
    expect(model.metadata.routeSource).toBe('demo-geojson');

    const demoRoute = findHydrowayCargoRouteFeature('CARGO-004');
    expect(lineCoords(model.geo.routeTrack)).toEqual(demoRoute?.geometry.coordinates);
  });

  it('usa fallback determinístico para cargo desconhecido', () => {
    const unknownCargo: Cargo = {
      id: 'CARGO-UNKNOWN-XY',
      title: 'Carga fictícia',
      origin: 'Cidade Alpha, XX',
      destination: 'Cidade Beta, YY',
      volume: '1 t',
      window: '01-05 maio',
      cargoType: 'Seca',
      status: 'open',
      co2Saving: '-10% CO₂',
      targetPrice: 'R$ 1.000',
    };

    const model = adaptCargoToHydrowayMapModel({ cargo: unknownCargo });

    expect(model.metadata.routeSource).toBe('fallback-line');
    expect(model.metadata.locationFallbacks.origin).toBe(true);
    expect(model.metadata.locationFallbacks.destination).toBe(true);
    expect(model.geo.routeTrack.features).toHaveLength(1);
    expect(lineCoords(model.geo.routeTrack).length).toBeGreaterThan(2);
  });

  it('é determinístico para a mesma entrada', () => {
    const input = { cargo: cargoById('CARGO-001') };
    const first = adaptCargoToHydrowayMapModel(input);
    const second = adaptCargoToHydrowayMapModel(input);

    expect(second).toEqual(first);
  });

  it('calcula bbox contendo origem, destino e vessel', () => {
    const model = adaptCargoToHydrowayMapModel({ cargo: cargoById('CARGO-001') });
    const [west, south, east, north] = model.bbox;
    const origin = pointCoord(model.geo.origin)!;
    const destination = pointCoord(model.geo.destination)!;
    const vessel = pointCoord(model.geo.vessel)!;

    expect(origin[0]).toBeGreaterThanOrEqual(west);
    expect(origin[0]).toBeLessThanOrEqual(east);
    expect(vessel[1]).toBeGreaterThanOrEqual(south);
    expect(vessel[1]).toBeLessThanOrEqual(north);
    expect(destination[0]).toBeGreaterThanOrEqual(west);
    expect(destination[1]).toBeLessThanOrEqual(north);
  });

  it('mantém progress01 coerente com routeTraveled mais curto que routeTrack', () => {
    const model = adaptCargoToHydrowayMapModel({ cargo: cargoById('CARGO-002') });
    const track = lineCoords(model.geo.routeTrack);
    const traveled = lineCoords(model.geo.routeTraveled);

    expect(model.progress01).toBe(0.25);
    expect(traveled.length).toBeGreaterThanOrEqual(2);
    expect(traveled.length).toBeLessThanOrEqual(track.length);
    expect(traveled[0]).toEqual(track[0]);
  });

  it('resolve origem/destino conhecidos sem fallback e desconhecidos com fallback seguro', () => {
    const known = resolveHydrowayLocation('Belém, PA');
    const unknown = resolveHydrowayLocation('Localidade Inexistente ZZ');

    expect(known.usedFallback).toBe(false);
    expect(isWithinMockBbox(known.coordinates)).toBe(true);

    expect(unknown.usedFallback).toBe(true);
    expect(isWithinMockBbox(unknown.coordinates)).toBe(true);

    const model = adaptCargoToHydrowayMapModel({
      cargo: {
        ...cargoById('CARGO-001'),
        origin: 'Belém, PA',
        destination: 'Localidade Inexistente ZZ',
      },
    });

    expect(model.metadata.locationFallbacks.origin).toBe(false);
    expect(model.metadata.locationFallbacks.destination).toBe(true);
  });

  it('preenche fontes estáticas do bundle V2.6', () => {
    const model = adaptCargoToHydrowayMapModel({ cargo: cargoById('CARGO-001') });

    expect(model.geo.mainRivers.features.length).toBeGreaterThanOrEqual(12);
    expect(model.geo.navigableCorridors.features.length).toBeGreaterThanOrEqual(5);
    expect(model.geo.portsTerminals.features.length).toBeGreaterThanOrEqual(14);
    expect(loadHydrowayCargoRoutesMock().features).toHaveLength(3);
  });
});
