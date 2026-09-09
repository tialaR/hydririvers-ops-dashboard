import { describe, expect, it, vi } from 'vitest';

import { parseCargoEtaMeta } from '@/features/cargo/utils/parse-cargo-eta-meta';

describe('parseCargoEtaMeta', () => {
  const tBoard = vi.fn((key: string) => (key === 'misc.etaMissing' ? 'ETA indisponível' : key));
  const tCommon = vi.fn((key: string) => key);

  it('returns missing label when value is empty', () => {
    expect(parseCargoEtaMeta(undefined, tBoard, tCommon)).toEqual({
      etaLabel: 'ETA indisponível',
      etaValue: '',
      confidenceLabel: '',
    });
  });

  it('splits eta and confidence parts', () => {
    expect(parseCargoEtaMeta('12/06 • alta confiança', tBoard, tCommon)).toEqual({
      etaLabel: 'ETA 12/06',
      etaValue: '12/06',
      confidenceLabel: 'predictability.high',
    });
  });

  it('normaliza etaValue sem prefixo duplicado', () => {
    expect(parseCargoEtaMeta('ETA 30–42h • alta confiança', tBoard, tCommon)).toEqual({
      etaLabel: 'ETA 30–42h',
      etaValue: '30–42h',
      confidenceLabel: 'predictability.high',
    });
  });
});
