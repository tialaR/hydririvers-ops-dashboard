import { describe, expect, it } from 'vitest';

import type { MobileCargoListItem } from '@/features/cargo/domain/cargo-list.types';
import { filterMobileCargoList } from '@/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab';

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

describe('filterMobileCargoList', () => {
  it('filtra por busca', () => {
    const result = filterMobileCargoList(items, 'soja', 'all');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('2');
  });

  it('filtra por chip de status', () => {
    const result = filterMobileCargoList(items, '', 'operation');
    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe('boarded');
  });

  it('filtra por chip de atenção', () => {
    const result = filterMobileCargoList(items, '', 'attention');
    expect(result).toHaveLength(1);
    expect(result[0]?.needsAttention).toBe(true);
  });
});
