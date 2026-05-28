import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { MobileCargoListItem } from '@/features/cargo/domain/cargo-list.types';
import {
  countMobileCargoActiveFilters,
  filterMobileCargoList,
  getUniqueCargoLocations,
} from '@/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab';

const items: MobileCargoListItem[] = [
  {
    id: '1',
    displayId: 'CARGO-001',
    title: 'Açaí congelado',
    origin: 'Belém, PA',
    destination: 'Santarém, PA',
    status: 'open',
    statusBadgeTone: 'info',
    etaLabel: 'ETA 36h',
    operationLabel: 'Corredor Tapajós',
    needsAttention: false,
  },
  {
    id: '2',
    displayId: 'CARGO-002',
    title: 'Soja granel',
    origin: 'Manaus, AM',
    destination: 'Parintins, AM',
    status: 'boarded',
    statusBadgeTone: 'success',
    etaLabel: 'ETA 4 dias',
    needsAttention: true,
    alertLabel: 'Documento pendente',
  },
];

describe('mobile cargo list lab filters', () => {
  it('conta filtros ativos para badge', () => {
    expect(
      countMobileCargoActiveFilters('soja', 'attention', {
        attentionOnly: true,
        origins: ['Manaus, AM'],
        destinations: [],
      }),
    ).toBe(4);
  });

  it('filtra por origem avançada', () => {
    const result = filterMobileCargoList(items, '', 'all', {
      attentionOnly: false,
      origins: ['Belém, PA'],
      destinations: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.displayId).toBe('CARGO-001');
  });

  it('filtra por atenção avançada', () => {
    const result = filterMobileCargoList(items, '', 'all', {
      attentionOnly: true,
      origins: [],
      destinations: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.needsAttention).toBe(true);
  });

  it('expõe origens e destinos únicos para o sheet de filtros', () => {
    const locations = getUniqueCargoLocations(items);
    expect(locations.origins).toEqual(['Belém, PA', 'Manaus, AM']);
    expect(locations.destinations).toEqual(['Parintins, AM', 'Santarém, PA']);
  });
});

describe('mobile cargo list lab source contracts', () => {
  const labSourcePath = resolve(
    process.cwd(),
    'src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx',
  );

  it('não renderiza item Filtros no dock', () => {
    const source = readFileSync(labSourcePath, 'utf8');
    expect(source).not.toContain("id: 'filters'");
    expect(source).toContain("id: 'cargas'");
    expect(source).toContain("id: 'attention'");
    expect(source).toContain("id: 'map'");
  });

  it('desabilita item Mapa no dock sem carga selecionada', () => {
    const source = readFileSync(labSourcePath, 'utf8');
    expect(source).toContain('disabled: !selectedCargo');
  });

  it('abre sheet de filtros pelo botão dedicado', () => {
    const source = readFileSync(labSourcePath, 'utf8');
    expect(source).toContain('cargo-lab-filter-button');
    expect(source).toContain("activeSheet === 'filters'");
    expect(source).toContain('cargo-lab-filter-sheet');
  });

  it('usa inert no overlay fechado via primitive e hidden no header compacto', () => {
    const source = readFileSync(labSourcePath, 'utf8');
    expect(source).toContain('hidden={!isScrolled || isAnySheetOpen}');
    expect(source).toContain('inert={isAnySheetOpen ? true : undefined}');
  });
});
