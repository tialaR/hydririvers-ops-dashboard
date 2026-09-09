import { describe, expect, it } from 'vitest';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import {
  OWNED_CARGO_PENDING_READINESS_THRESHOLD,
  resolveOwnedCargoProgress,
  summarizeOwnedCargoes,
} from '@/features/cargo/domain/summarize-owned-cargoes';

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

describe('summarizeOwnedCargoes', () => {
  it('calcula métricas operacionais da carteira', () => {
    const items = [
      baseCargo({ id: '1', status: 'open', proposalsCount: 2, documentReadiness: 40 }),
      baseCargo({ id: '2', status: 'boarded', proposalsCount: 1, documentReadiness: 90 }),
      baseCargo({ id: '3', status: 'delivered', proposalsCount: 0, documentReadiness: 100 }),
    ];

    expect(summarizeOwnedCargoes(items)).toEqual({
      active: 2,
      proposals: 3,
      pending: 1,
      inTransit: 1,
    });
  });

  it('conta pendência por cadastro incompleto e documento obrigatório', () => {
    const items = [
      baseCargo({
        id: 'open-unpublished',
        status: 'open',
        publishedAt: null,
        documentReadiness: 100,
      }),
      baseCargo({
        id: 'doc-required',
        status: 'bidding',
        publishedAt: '2026-05-01T00:00:00.000Z',
        documentReadiness: 95,
        requiredDocuments: [{ name: 'NF-e', status: 'required' }],
      }),
      baseCargo({
        id: 'low-readiness',
        status: 'contracting',
        documentReadiness: OWNED_CARGO_PENDING_READINESS_THRESHOLD - 1,
      }),
    ];

    expect(summarizeOwnedCargoes(items).pending).toBe(3);
  });
});

describe('resolveOwnedCargoProgress', () => {
  it('prioriza documentReadiness quando disponível', () => {
    expect(resolveOwnedCargoProgress(baseCargo({ documentReadiness: 64 }))).toBe(64);
  });

  it('usa progresso por status quando readiness não existe', () => {
    expect(resolveOwnedCargoProgress(baseCargo({ status: 'boarded', documentReadiness: undefined }))).toBe(88);
  });
});
