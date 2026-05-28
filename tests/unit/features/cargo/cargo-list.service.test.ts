import { describe, expect, it, vi } from 'vitest';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import {
  CargoListService,
  mapCargoToMobileListItem,
  normalizeMobileCargoEtaLabel,
  sanitizeMobileCargoLabDisplayText,
} from '@/features/cargo/services/cargo-list.service';
import type { CargoListRepository } from '@/features/cargo/repositories/cargo-list.repository';

const sampleCargo = (over: Partial<Cargo> = {}): Cargo => ({
  id: 'cargo-001',
  title: 'Açaí congelado para entrega regional',
  origin: 'Belém, PA',
  destination: 'Santarém, PA',
  volume: '18 m³',
  window: 'Hoje e amanhã',
  cargoType: 'Refrigerada',
  status: 'boarded',
  co2Saving: '-46% CO₂',
  targetPrice: 'R$ 6.450',
  corridor: 'Corredor Tapajós',
  etaConfidence: 'ETA 36–44h • confiança média',
  operationalRisks: ['Sinal intermitente no trecho médio'],
  ...over,
});

describe('cargo-list.service', () => {
  it('adapta cargas para view model mobile', async () => {
    const repository: CargoListRepository = {
      listMobileCargoes: vi.fn().mockResolvedValue([sampleCargo()]),
      getCargoListFilters: vi.fn().mockResolvedValue({ chips: [] }),
      getCargoById: vi.fn(),
    };

    const service = new CargoListService(repository);
    const items = await service.listMobileCargoes();

    expect(items[0]?.displayId).toBe('CARGO-001');
    expect(items[0]?.etaLabel).toContain('ETA');
    expect(items[0]?.operationLabel).toBe('Corredor Tapajós');
    expect(items[0]?.alertLabel).toContain('Sinal intermitente');
  });

  it('monta view model completo', async () => {
    const repository: CargoListRepository = {
      listMobileCargoes: vi.fn().mockResolvedValue([sampleCargo(), sampleCargo({ id: 'cargo-002' })]),
      getCargoListFilters: vi.fn().mockResolvedValue({ chips: [{ id: 'all', labelKey: 'filters.all' }] }),
      getCargoById: vi.fn(),
    };

    const service = new CargoListService(repository);
    const viewModel = await service.getMobileCargoListViewModel();

    expect(viewModel.totalCount).toBe(2);
    expect(viewModel.filters.chips).toHaveLength(1);
  });
});

describe('normalizeMobileCargoEtaLabel', () => {
  it('não duplica prefixo ETA', () => {
    expect(normalizeMobileCargoEtaLabel('ETA 30–42h • alta confiança')).toBe(
      'ETA 30–42h • alta confiança',
    );
    expect(normalizeMobileCargoEtaLabel('ETA ETA 30–42h')).toBe('ETA 30–42h');
    expect(normalizeMobileCargoEtaLabel('30–42h')).toBe('ETA 30–42h');
  });
});

describe('sanitizeMobileCargoLabDisplayText', () => {
  it('remove marcadores mock/dev/fixture do título exibido', () => {
    expect(sanitizeMobileCargoLabDisplayText('Grãos — corredor Tocantins (mock)')).toBe(
      'Grãos — corredor Tocantins',
    );
  });
});

describe('mapCargoToMobileListItem', () => {
  it('não inclui texto mock/dev no card', () => {
    const item = mapCargoToMobileListItem(
      sampleCargo({
        title: 'Grãos — corredor Tocantins (mock)',
        description: 'mock interno dev-only',
      }),
    );

    expect(item.title).toBe('Grãos — corredor Tocantins');
    const serialized = JSON.stringify(item).toLowerCase();
    expect(serialized).not.toContain('mock');
    expect(serialized).not.toContain('dev-only');
  });

  it('não serializa ETA ETA no etaLabel', () => {
    const item = mapCargoToMobileListItem(
      sampleCargo({ etaConfidence: 'ETA ETA 30–42h • alta confiança' }),
    );

    expect(item.etaLabel).not.toMatch(/ETA\s+ETA/i);
    expect(item.etaLabel).toContain('ETA 30–42h');
  });
});
