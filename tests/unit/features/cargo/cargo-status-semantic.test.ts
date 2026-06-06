import { describe, expect, it } from 'vitest';

import {
  mapCargoLabV2StatusToBadgeStatus,
  mapCargoStatusToBadgeStatus,
  mapCargoStatusToLabV2Status,
} from '@/features/cargo/utils/cargo-status-semantic';

describe('cargo-status-semantic', () => {
  it('mapeia CargoStatus para lab status granular', () => {
    expect(mapCargoStatusToLabV2Status('open')).toBe('aberta');
    expect(mapCargoStatusToLabV2Status('bidding')).toBe('cotacao');
    expect(mapCargoStatusToLabV2Status('contracting')).toBe('contratando');
    expect(mapCargoStatusToLabV2Status('reserved')).toBe('operacao');
    expect(mapCargoStatusToLabV2Status('boarded')).toBe('transito');
    expect(mapCargoStatusToLabV2Status('delivered')).toBe('concluida');
  });

  it('mapeia lab status legado para badge tone distinto', () => {
    expect(mapCargoLabV2StatusToBadgeStatus('aberta')).toBe('open');
    expect(mapCargoLabV2StatusToBadgeStatus('cotacao')).toBe('quotation');
    expect(mapCargoLabV2StatusToBadgeStatus('agendado')).toBe('operating');
    expect(mapCargoLabV2StatusToBadgeStatus('atencao')).toBe('delayed');
  });

  it('open e quotation não compartilham o mesmo tone', () => {
    expect(mapCargoStatusToBadgeStatus('open')).toBe('open');
    expect(mapCargoStatusToBadgeStatus('bidding')).toBe('quotation');
    expect(mapCargoStatusToBadgeStatus('open')).not.toBe(mapCargoStatusToBadgeStatus('bidding'));
  });
});
