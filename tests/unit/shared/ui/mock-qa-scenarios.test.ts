import { describe, expect, it } from 'vitest';
import { mockScenarioIds } from '@/shared/config/mock-scenario-ids';
import {
  filterMockQaScenarios,
  formatMockQaScenarioClipboard,
  mockQaScenarios
} from '@/shared/ui/mock-mode/mock-qa-scenarios';

describe('shared/ui/mock-mode/mock-qa-scenarios', () => {
  it('expõe cenários únicos com metadados completos', () => {
    const ids = new Set(mockQaScenarios.map((scenario) => scenario.id));

    expect(ids.size).toBe(mockQaScenarios.length);

    for (const scenario of mockQaScenarios) {
      expect(scenario.title).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(scenario.objective).toBeTruthy();
      expect(scenario.riskCovered).toBeTruthy();
      expect(scenario.persona).toBeTruthy();
      expect(scenario.startRoute).toMatch(/^\/[a-z]/);
      expect(mockScenarioIds).toContain(scenario.datasetScenarioId);
      expect(scenario.steps.length).toBeGreaterThan(0);
      expect(scenario.expectedResult).toBeTruthy();
      expect(scenario.areas.length).toBeGreaterThan(0);
      expect(scenario.tags.length).toBeGreaterThan(0);
    }
  });

  it('declara contagem esperada para cenários de notificações', () => {
    const notificationScenarios = mockQaScenarios.filter((scenario) => scenario.id.startsWith('notifications-'));

    expect(notificationScenarios).toHaveLength(4);
    expect(notificationScenarios.map((scenario) => scenario.totalNotifications)).toEqual([5, 5, 5, 5]);
    expect(notificationScenarios.map((scenario) => scenario.expectedUnreadCount)).toEqual([5, 0, 1, 4]);
  });

  it('declara expectedCargoCount para cenários de Minhas cargas', () => {
    const myCargoesScenarios = mockQaScenarios.filter((scenario) => scenario.areas.includes('my-cargos'));
    expect(myCargoesScenarios.length).toBeGreaterThan(0);
    for (const scenario of myCargoesScenarios) {
      expect(typeof scenario.expectedCargoCount).toBe('number');
    }
  });

  it('filtra cenários por termos relevantes', () => {
    const results = filterMockQaScenarios('mapa');
    expect(results.some((scenario) => scenario.id === 'tracking-map-active-and-overlay')).toBe(true);
    expect(results.every((scenario) => scenario.id.includes('map') || scenario.description.includes('map'))).toBe(
      true
    );
  });

  it('gera conteúdo de clipboard com passos e resultado esperado', () => {
    const scenario = mockQaScenarios[0];
    const text = formatMockQaScenarioClipboard(scenario);

    expect(text).toContain(scenario.title);
    expect(text).toContain('Passos recomendados:');
    expect(text).toContain('1. ');
    expect(text).toContain(scenario.expectedResult);
  });
});
