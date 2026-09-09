import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('operating e quotation não compartilham o mesmo tone', () => {
    expect(mapCargoLabV2StatusToBadgeStatus('operacao')).toBe('operating');
    expect(mapCargoLabV2StatusToBadgeStatus('cotacao')).toBe('quotation');
    expect(mapCargoLabV2StatusToBadgeStatus('operacao')).not.toBe(
      mapCargoLabV2StatusToBadgeStatus('cotacao'),
    );
  });
});

describe('cargo status semantic tokens', () => {
  it('define cor distinta por tone logístico', () => {
    const tokens = readFileSync(
      resolve(process.cwd(), 'src/shared/styles/tokens/_hy-v2-light.scss'),
      'utf8',
    );

    expect(tokens).toContain('--hy-color-status-open-text: #0f766e');
    expect(tokens).toContain('--hy-color-status-quotation-text: #1d4ed8');
    expect(tokens).toContain('--hy-color-status-operating-text: #4338ca');
    expect(tokens).toContain('--hy-color-status-contracting-text: #6d28d9');
    expect(tokens).toContain('--hy-color-status-in-transit-text: #15803d');
    expect(tokens).toContain('--hy-color-status-delayed-text: #a16207');
    expect(tokens).toContain('--hy-color-status-blocked-text: #b91c1c');
  });
});
