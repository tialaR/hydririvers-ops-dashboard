import { describe, expect, it } from 'vitest';

import { HYDROWAY_OPERATIONAL_LAYER_MODES } from '@/features/waterway-map/constants/hydroway-operational-layer-modes';
import { hydrowayOperationalDatasetMock } from '@/features/waterway-map/mocks/hydroway-operational-layers.mock';
import {
  toAlertsFeatureCollection,
  toCheckpointsFeatureCollection,
  toCorridorsFeatureCollection,
  toPlanningAreasFeatureCollection,
  toSegmentsFeatureCollection,
  toSignalsFeatureCollection,
  toTerminalsFeatureCollection,
} from '@/features/waterway-map/utils/hydroway-operational-geojson';
import {
  assertOperationalDatasetIntegrity,
  clampProgress01,
  isValidLngLat,
} from '@/features/waterway-map/utils/hydroway-operational-validation';

const dataset = hydrowayOperationalDatasetMock;

describe('hydroway operational layers domain', () => {
  it('define cinco modos operacionais com configuração completa', () => {
    expect(HYDROWAY_OPERATIONAL_LAYER_MODES).toHaveLength(5);
    for (const mode of HYDROWAY_OPERATIONAL_LAYER_MODES) {
      expect(mode.labelKey).toBeTruthy();
      expect(mode.descriptionKey).toBeTruthy();
      expect(mode.visibleFeatureKinds.length).toBeGreaterThan(0);
      expect(mode.businessGoal).toBeTruthy();
    }
  });

  it('passa integridade referencial do dataset mock', () => {
    const issues = assertOperationalDatasetIntegrity(dataset);
    expect(issues).toEqual([]);
  });

  it('todos os corridors têm id, name e coordinates válidas', () => {
    for (const corridor of dataset.corridors) {
      expect(corridor.id).toBeTruthy();
      expect(corridor.name).toBeTruthy();
      expect(corridor.coordinates.length).toBeGreaterThanOrEqual(2);
      for (const coordinate of corridor.coordinates) {
        expect(isValidLngLat(coordinate)).toBe(true);
      }
    }
  });

  it('todos os segments referenciam corridorId existente', () => {
    const corridorIds = new Set(dataset.corridors.map((c) => c.id));
    for (const segment of dataset.segments) {
      expect(corridorIds.has(segment.corridorId)).toBe(true);
      expect(segment.businessImpactSummary.length).toBeGreaterThan(10);
    }
  });

  it('todos os terminals têm coordenadas válidas', () => {
    for (const terminal of dataset.terminals) {
      expect(isValidLngLat(terminal.coordinates)).toBe(true);
    }
  });

  it('todos os alerts têm severity, type e shortMessage', () => {
    for (const alert of dataset.alerts) {
      expect(alert.severity).toBeTruthy();
      expect(alert.type).toBeTruthy();
      expect(alert.shortMessage.length).toBeGreaterThan(5);
      expect(isValidLngLat(alert.coordinates)).toBe(true);
    }
  });

  it('cargoContexts referenciam entidades existentes e progress01 em [0,1]', () => {
    const corridorIds = new Set(dataset.corridors.map((c) => c.id));
    const segmentIds = new Set(dataset.segments.map((s) => s.id));
    const terminalIds = new Set(dataset.terminals.map((t) => t.id));

    for (const ctx of dataset.cargoContexts) {
      expect(corridorIds.has(ctx.corridorId)).toBe(true);
      expect(segmentIds.has(ctx.activeSegmentId)).toBe(true);
      expect(terminalIds.has(ctx.originTerminalId)).toBe(true);
      expect(terminalIds.has(ctx.destinationTerminalId)).toBe(true);
      expect(ctx.progress01).toBeGreaterThanOrEqual(0);
      expect(ctx.progress01).toBeLessThanOrEqual(1);
      expect(clampProgress01(ctx.progress01)).toBe(ctx.progress01);
    }
  });

  it('inclui corredores, segmentos e alertas obrigatórios do escopo Norte', () => {
    const corridorNames = dataset.corridors.map((c) => c.name);
    expect(corridorNames).toContain('Amazonas-Solimões');
    expect(corridorNames).toContain('Tapajós');
    expect(corridorNames).toContain('Madeira');
    expect(corridorNames).toContain('Tocantins-Araguaia');
    expect(corridorNames).toContain('Barra Norte');

    const terminalNames = dataset.terminals.map((t) => t.name);
    for (const name of [
      'Belém',
      'Vila do Conde',
      'Santarém',
      'Manaus',
      'Itacoatiara',
      'Miritituba',
      'Porto Velho',
      'Macapá/Santana',
      'Marabá',
      'Abaetetuba',
    ]) {
      expect(terminalNames).toContain(name);
    }

    expect(dataset.segments.some((s) => s.navigabilityStatus === 'attention')).toBe(true);
    expect(dataset.segments.some((s) => s.navigabilityStatus === 'restricted')).toBe(true);
    expect(dataset.segments.some((s) => s.dredgingStatus === 'active')).toBe(true);
    expect(dataset.segments.some((s) => s.droughtRisk === 'high')).toBe(true);
    expect(dataset.signals.some((s) => s.condition === 'maintenance')).toBe(true);

    const alertTypes = dataset.alerts.map((a) => a.type);
    expect(alertTypes).toContain('draft');
    expect(alertTypes).toContain('drought');
    expect(alertTypes).toContain('dredging');
    expect(alertTypes).toContain('signaling');
    expect(alertTypes).toContain('traffic');
    expect(alertTypes).toContain('port-window');
    expect(alertTypes).toContain('visibility');
  });

  describe('GeoJSON helpers', () => {
    it('retornam FeatureCollection com geometria válida', () => {
      const collections = [
        toCorridorsFeatureCollection(dataset.corridors),
        toSegmentsFeatureCollection(dataset.segments),
        toTerminalsFeatureCollection(dataset.terminals),
        toAlertsFeatureCollection(dataset.alerts),
        toSignalsFeatureCollection(dataset.signals),
        toPlanningAreasFeatureCollection(dataset.planningAreas),
        toCheckpointsFeatureCollection(dataset.checkpoints),
      ];

      for (const collection of collections) {
        expect(collection.type).toBe('FeatureCollection');
        expect(collection.features.length).toBeGreaterThan(0);
        for (const feature of collection.features) {
          expect(feature.geometry).toBeTruthy();
          const props = feature.properties ?? {};
          for (const value of Object.values(props)) {
            if (value === null) {
              expect(['draftMeters', 'requiredDraftMeters', 'etaImpactMinutes']).not.toContain(
                Object.keys(props).find((k) => props[k] === null),
              );
            }
          }
        }
      }
    });

    it('properties não contêm coordenadas null em features de ponto', () => {
      const points = toAlertsFeatureCollection(dataset.alerts);
      for (const feature of points.features) {
        if (feature.geometry.type === 'Point') {
          expect(feature.geometry.coordinates.every((n) => n !== null && Number.isFinite(n))).toBe(
            true,
          );
        }
      }
    });
  });
});
