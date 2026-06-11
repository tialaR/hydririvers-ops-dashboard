import { describe, expect, it } from 'vitest';

import {
  getPublicCargoCardActionLabel,
  mapMarketplaceCargoToLabV2,
} from '@/features/cargo/utils/map-marketplace-cargo-to-lab-v2';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

function buildCargo(overrides: Partial<Cargo> = {}): Cargo {
  return {
    id: 'cargo-001',
    title: 'Soja exportação',
    status: 'open',
    origin: 'Santarém',
    destination: 'Barcarena',
    corridor: 'Tapajós',
    cargoType: 'Granel',
    volume: '12.000 t',
    weight: '12.000 t',
    producer: 'Produtor mock',
    serviceType: 'Hidroviário',
    description: 'Carga pública de teste',
    ...overrides,
  } as Cargo;
}

describe('mapMarketplaceCargoToLabV2', () => {
  it('maps open status to aberta lab status', () => {
    const mapped = mapMarketplaceCargoToLabV2(buildCargo({ status: 'open' }), {
      statusLabel: 'Aberta',
    });

    expect(mapped.status).toBe('aberta');
    expect(mapped.id).toBe('cargo-001');
    expect(mapped.origin).toBe('Santarém');
  });

  it('maps bidding status to cotacao lab status', () => {
    const mapped = mapMarketplaceCargoToLabV2(buildCargo({ status: 'bidding' }), {
      statusLabel: 'Em cotação',
    });

    expect(mapped.status).toBe('cotacao');
  });

  it('maps boarded status to transito lab status', () => {
    const mapped = mapMarketplaceCargoToLabV2(buildCargo({ status: 'boarded' }), {
      statusLabel: 'Em trânsito',
    });

    expect(mapped.status).toBe('transito');
  });
});

describe('getPublicCargoCardActionLabel', () => {
  it('returns view for open and bidding', () => {
    expect(getPublicCargoCardActionLabel('open')).toBe('view');
    expect(getPublicCargoCardActionLabel('bidding')).toBe('view');
  });

  it('returns track for in-progress statuses', () => {
    expect(getPublicCargoCardActionLabel('boarded')).toBe('track');
    expect(getPublicCargoCardActionLabel('reserved')).toBe('track');
  });
});
