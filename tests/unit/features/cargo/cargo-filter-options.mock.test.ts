import { describe, expect, it } from 'vitest';

import {
  cargoCapacityFilterOptions,
  cargoCutoffFilterOptions,
  cargoDestinationFilterOptions,
  cargoFilterOptions,
  cargoOriginFilterOptions,
  cargoStatusFilterOptions,
  cargoTypeFilterOptions,
  cargoVesselTypeFilterOptions,
} from '@/features/cargo/mocks/cargo-filter-options.mock';

const EXPECTED_GROUPS = [
  'status',
  'origins',
  'destinations',
  'cargoTypes',
  'vesselTypes',
  'cutoff',
  'capacity',
] as const;

describe('cargo-filter-options.mock', () => {
  it('exporta todos os grupos esperados', () => {
    for (const group of EXPECTED_GROUPS) {
      expect(cargoFilterOptions[group]).toBeDefined();
      expect(cargoFilterOptions[group].length).toBeGreaterThan(0);
    }
  });

  it('cada grupo possui opção "Todos"', () => {
    const groups = [
      cargoStatusFilterOptions,
      cargoOriginFilterOptions,
      cargoDestinationFilterOptions,
      cargoTypeFilterOptions,
      cargoVesselTypeFilterOptions,
      cargoCutoffFilterOptions,
      cargoCapacityFilterOptions,
    ];

    for (const options of groups) {
      const todosOption = options.find((option) => option.value === 'todos');
      expect(todosOption?.label).toBe('Todos');
    }
  });

  it('preserva acentuação correta em labels importantes', () => {
    const labels = [
      ...cargoStatusFilterOptions,
      ...cargoOriginFilterOptions,
      ...cargoDestinationFilterOptions,
      ...cargoTypeFilterOptions,
    ].map((option) => option.label);

    expect(labels).toContain('Em trânsito');
    expect(labels).toContain('Concluída');
    expect(labels).toContain('Contêiner');
    expect(labels.some((label) => label.includes('Belém'))).toBe(true);
    expect(labels.some((label) => label.includes('Santarém'))).toBe(true);
  });
});
