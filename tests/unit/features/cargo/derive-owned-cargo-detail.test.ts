import { describe, expect, it } from 'vitest';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';
import {
  deriveOwnedCargoDetail,
  deriveOwnedCargoDocumentsPreview,
  deriveOwnedCargoRisksPreview,
  OWNED_CARGO_MAP_PROGRESS_BY_STATUS,
} from '@/features/cargo/domain/derive-owned-cargo-detail';

function baseCargo(overrides: Partial<Cargo> = {}): Cargo {
  return {
    id: 'MY-TEST',
    title: 'Test cargo',
    origin: 'Manaus, AM',
    destination: 'Santarém, PA',
    volume: '1 t',
    window: 'May 2026',
    cargoType: 'Seca',
    status: 'open',
    co2Saving: '-10% CO₂',
    targetPrice: 'R$ 1',
    riverRoute: 'Rio Amazonas · Manaus → Santarém',
    ...overrides,
  };
}

describe('deriveOwnedCargoDocumentsPreview', () => {
  it('conta documentos e pendências', () => {
    const preview = deriveOwnedCargoDocumentsPreview(
      baseCargo({
        documentReadiness: 64,
        requiredDocuments: [
          { name: 'NF-e', status: 'required' },
          { name: 'Romaneio', status: 'ok' },
        ],
      }),
    );

    expect(preview).toMatchObject({
      state: 'available',
      totalCount: 2,
      pendingCount: 1,
      readinessPercent: 64,
      topPendingName: 'NF-e',
    });
  });

  it('retorna empty quando não há documentos', () => {
    expect(deriveOwnedCargoDocumentsPreview(baseCargo({ requiredDocuments: [] }))).toMatchObject({
      state: 'empty',
      totalCount: 0,
      pendingCount: 0,
    });
  });
});

describe('deriveOwnedCargoRisksPreview', () => {
  it('marca clear sem riscos', () => {
    expect(deriveOwnedCargoRisksPreview(baseCargo({ operationalRisks: [] }))).toEqual({
      state: 'clear',
      count: 0,
      primaryRiskMock: null,
    });
  });

  it('expõe alerta principal quando há riscos', () => {
    expect(
      deriveOwnedCargoRisksPreview(baseCargo({ operationalRisks: ['Calado restrito', 'Sinal fraco'] })),
    ).toEqual({
      state: 'attention',
      count: 2,
      primaryRiskMock: 'Calado restrito',
    });
  });
});

describe('deriveOwnedCargoDetail', () => {
  it('deriva cockpit completo para carga owned real', () => {
    const cargo = userCargosMock[0]!;
    const detail = deriveOwnedCargoDetail(cargo);

    expect(detail.metrics).toHaveLength(4);
    expect(detail.statusCard.progressPercent).toBeGreaterThan(0);
    expect(detail.supportCards.length).toBeGreaterThan(0);
    expect(detail.map.state).toBe('available');
    expect(detail.map.progressPercent).toBe(OWNED_CARGO_MAP_PROGRESS_BY_STATUS[cargo.status]);
    expect(detail.timeline.eventCount).toBeGreaterThan(0);
    expect(detail.timelineEvents.length).toBeGreaterThan(0);
    expect(detail.documents.totalCount).toBeGreaterThan(0);
    expect(detail.documentItems.length).toBeGreaterThan(0);
    expect(detail.risks.count).toBeGreaterThan(0);
    expect(detail.riskItems.length).toBeGreaterThan(0);
    expect(detail.showUpdateStatusAction).toBe(true);
    expect(detail.showOpenDocumentsAction).toBe(true);
  });

  it('habilita negociar em cargas com propostas', () => {
    const cargo = userCargosMock.find((item) => item.id === 'MY-CARGO-003')!;
    const detail = deriveOwnedCargoDetail(cargo);

    expect(detail.showNegotiateAction).toBe(true);
    expect(detail.showTrackAction).toBe(false);
  });

  it('habilita acompanhar em cargas embarcadas', () => {
    const cargo = userCargosMock.find((item) => item.id === 'MY-CARGO-006')!;
    const detail = deriveOwnedCargoDetail(cargo);

    expect(detail.showTrackAction).toBe(true);
  });
});
