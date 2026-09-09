import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';

const mocks = vi.hoisted(() => ({
  cargoes: [] as Cargo[],
  negotiations: [] as Negotiation[],
}));

vi.mock('@/shared/server/mock-db', () => ({
  readMock: (key: 'cargoes' | 'negotiations') => mocks[key],
}));

import { persistedOwnedCargoRepository } from '@/features/cargo/owned/repositories/persisted-owned-cargo.repository';

const baseCargo: Cargo = {
  id: 'cargo-owned',
  ownerId: 'shipper-a',
  shipperId: 'shipper-a',
  title: 'Carga demonstrável',
  origin: 'Belém',
  destination: 'Santarém',
  volume: '10 t',
  window: '10–12 maio',
  cargoType: 'solid',
  status: 'open',
  co2Saving: '-40%',
  targetPrice: 'R$ 1.000',
  documentReadiness: 40,
  requiredDocuments: [{ name: 'NF-e', status: 'required' }],
};

describe('persistedOwnedCargoRepository', () => {
  beforeEach(() => {
    mocks.cargoes = [baseCargo, { ...baseCargo, id: 'cargo-other', ownerId: 'shipper-b', shipperId: 'shipper-b' }];
    mocks.negotiations = [{
      id: 'offer-1',
      cargoId: baseCargo.id,
      cargoTitle: baseCargo.title,
      vesselName: 'Navega Norte',
      stage: 'quote',
      amount: 'R$ 900',
      lastUpdate: 'agora',
      parties: [],
    }];
  });

  it('lista somente cargas persistidas pertencentes à embarcadora', async () => {
    const cargoes = await persistedOwnedCargoRepository.listOwnedCargoes('shipper-a');
    expect(cargoes).toHaveLength(1);
    expect(cargoes[0]).toMatchObject({ id: 'cargo-owned', offersCount: 1, pendingDocsCount: 1 });
  });

  it('não expõe detalhe, documentos ou propostas de outra embarcadora', async () => {
    await expect(persistedOwnedCargoRepository.getOwnedCargoById('cargo-owned', 'shipper-b')).resolves.toBeUndefined();
    await expect(persistedOwnedCargoRepository.getDocumentsForCargo('cargo-owned', 'shipper-b')).resolves.toEqual([]);
    await expect(persistedOwnedCargoRepository.getOffersForCargo('cargo-owned', 'shipper-b')).resolves.toEqual([]);
  });

  it('deriva documentos e propostas do mesmo registro operacional', async () => {
    await expect(persistedOwnedCargoRepository.getDocumentsForCargo('cargo-owned', 'shipper-a')).resolves.toEqual([
      expect.objectContaining({ name: 'NF-e', status: 'blocked' }),
    ]);
    await expect(persistedOwnedCargoRepository.getOffersForCargo('cargo-owned', 'shipper-a')).resolves.toEqual([
      expect.objectContaining({ id: 'offer-1', pricePerTonLabel: 'R$ 900' }),
    ]);
  });
});
