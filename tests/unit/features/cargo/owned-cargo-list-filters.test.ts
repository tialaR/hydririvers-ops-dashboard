import { describe, expect, it } from 'vitest';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import {
  countOwnedCargoesByListFilter,
  filterOwnedCargoesByListFilter,
  ownedCargoHasRisk,
  ownedCargoIsInTransit,
  ownedCargoIsOpen,
} from '@/features/cargo/domain/owned-cargo-list-filters';
import {
  filterOwnedCargoesBySearch,
  matchesOwnedCargoSearchQuery,
} from '@/features/cargo/domain/owned-cargo-list-search';
import { ownedCargoHasDocumentPendency } from '@/features/cargo/domain/summarize-owned-cargoes';
import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';

function baseCargo(overrides: Partial<Cargo> = {}): Cargo {
  return {
    id: 'MY-TEST',
    title: 'Test cargo',
    origin: 'A',
    destination: 'B',
    volume: '1 t',
    window: 'May 2026',
    cargoType: 'Seca',
    status: 'open',
    co2Saving: '-10% CO₂',
    targetPrice: 'R$ 1',
    ...overrides,
  };
}

describe('owned-cargo-list-filters', () => {
  it('conta filtros da carteira mock do embarcador', () => {
    expect(countOwnedCargoesByListFilter(userCargosMock)).toEqual({
      all: 7,
      open: 2,
      inTransit: 1,
      documents: 3,
      risk: 4,
    });
  });

  it('filtra abertas por status open', () => {
    const filtered = filterOwnedCargoesByListFilter(userCargosMock, 'open');

    expect(filtered.map((cargo) => cargo.id)).toEqual(['MY-CARGO-001', 'MY-CARGO-002']);
    expect(filtered.every(ownedCargoIsOpen)).toBe(true);
  });

  it('filtra em trânsito por status boarded', () => {
    const filtered = filterOwnedCargoesByListFilter(userCargosMock, 'inTransit');

    expect(filtered.map((cargo) => cargo.id)).toEqual(['MY-CARGO-006']);
    expect(filtered.every(ownedCargoIsInTransit)).toBe(true);
  });

  it('filtra documentos com pendências reais da carteira', () => {
    const filtered = filterOwnedCargoesByListFilter(userCargosMock, 'documents');

    expect(filtered.map((cargo) => cargo.id)).toEqual([
      'MY-CARGO-001',
      'MY-CARGO-003',
      'MY-CARGO-004',
    ]);
    expect(filtered.every(ownedCargoHasDocumentPendency)).toBe(true);
  });

  it('filtra risco com alertas operacionais declarados', () => {
    const filtered = filterOwnedCargoesByListFilter(userCargosMock, 'risk');

    expect(filtered.map((cargo) => cargo.id)).toEqual([
      'MY-CARGO-001',
      'MY-CARGO-003',
      'MY-CARGO-004',
      'MY-CARGO-006',
    ]);
    expect(filtered.every(ownedCargoHasRisk)).toBe(true);
  });

  it('mantém todas as cargas no filtro all', () => {
    expect(filterOwnedCargoesByListFilter(userCargosMock, 'all')).toHaveLength(userCargosMock.length);
  });
});

describe('owned-cargo-list-search', () => {
  it('busca por id, título, origem, destino e status', () => {
    expect(matchesOwnedCargoSearchQuery(userCargosMock[0]!, 'MY-CARGO-001')).toBe(true);
    expect(matchesOwnedCargoSearchQuery(userCargosMock[0]!, 'castanha')).toBe(true);
    expect(matchesOwnedCargoSearchQuery(userCargosMock[0]!, 'manaus')).toBe(true);
    expect(matchesOwnedCargoSearchQuery(userCargosMock[0]!, 'aberta')).toBe(true);
    expect(matchesOwnedCargoSearchQuery(userCargosMock[0]!, 'inexistente')).toBe(false);
  });

  it('filtra lista por query combinada com chips', () => {
    const byOpen = filterOwnedCargoesByListFilter(userCargosMock, 'open');
    const searched = filterOwnedCargoesBySearch(byOpen, 'insumos');

    expect(searched.map((cargo) => cargo.id)).toEqual(['MY-CARGO-002']);
  });

  it('retorna lista intacta com query vazia', () => {
    expect(filterOwnedCargoesBySearch(userCargosMock, '   ')).toHaveLength(userCargosMock.length);
  });

  it('detecta risco operacional em cargo sintético', () => {
    expect(
      ownedCargoHasRisk(
        baseCargo({ operationalRisks: ['Janela apertada'] }),
      ),
    ).toBe(true);
  });
});
