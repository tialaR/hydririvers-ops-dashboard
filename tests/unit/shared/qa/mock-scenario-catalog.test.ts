import { describe, expect, it } from 'vitest';
import { mockScenarioIds } from '@/shared/config/mock-scenario-ids';
import { isMockScenarioId, mockScenarioCatalog } from '@/shared/qa/mock-scenario-catalog';

describe('shared/qa/mock-scenario-catalog', () => {
  it('mantém uma entrada por cenário canônico', () => {
    expect(mockScenarioCatalog.map((row) => row.id)).toEqual(mockScenarioIds);
    expect(mockScenarioCatalog.length).toBe(mockScenarioIds.length);
  });

  it('isMockScenarioId reconhece apenas ids válidos', () => {
    expect(isMockScenarioId('market-active')).toBe(true);
    expect(isMockScenarioId('invalid')).toBe(false);
  });
});
