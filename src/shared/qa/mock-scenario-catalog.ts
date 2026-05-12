import { mockScenarioIds, type MockScenarioId } from '@/shared/config/mock-scenario-ids';

/** Metadados mínimos por cenário — textos i18n em mockMode.scenarioCatalog.{id}.summary | explanation */
export const mockScenarioCatalog: readonly { id: MockScenarioId }[] = mockScenarioIds.map((id) => ({ id }));

export function isMockScenarioId(value: string): value is MockScenarioId {
  return (mockScenarioIds as readonly string[]).includes(value);
}
