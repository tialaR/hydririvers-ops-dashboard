import type { HydrowayOperationalLayerModeConfig } from '../domain/hydroway-operational-domain.types';

export const HYDROWAY_OPERATIONAL_LAYER_MODES: readonly HydrowayOperationalLayerModeConfig[] = [
  {
    id: 'operation',
    labelKey: 'waterwayMap.operationalModes.operation.label',
    descriptionKey: 'waterwayMap.operationalModes.operation.description',
    businessGoal:
      'Monitorar carga em trânsito: rota, posição atual, próximo checkpoint e alertas críticos.',
    primaryAudience: 'operator',
    cognitiveLoad: 'low',
    mapEmphasis: 'route-progress-checkpoints',
    visibleFeatureKinds: ['corridor', 'segment', 'terminal', 'checkpoint', 'alert'],
    mutedFeatureKinds: ['signal', 'planningArea'],
    visualIntent: 'Visão padrão de monitoramento — o que importa agora para a operação.',
  },
  {
    id: 'navigation',
    labelKey: 'waterwayMap.operationalModes.navigation.label',
    descriptionKey: 'waterwayMap.operationalModes.navigation.description',
    businessGoal:
      'Apoiar decisão do capitão: navegabilidade, calado, dragagem, sinalização e segurança náutica.',
    primaryAudience: 'captain',
    cognitiveLoad: 'medium',
    mapEmphasis: 'navigability-signals-restrictions',
    visibleFeatureKinds: ['segment', 'signal', 'alert'],
    mutedFeatureKinds: ['planningArea', 'terminal'],
    visualIntent: 'Leitura em 2 segundos: trecho seguro, restrição e ação imediata.',
  },
  {
    id: 'logistics',
    labelKey: 'waterwayMap.operationalModes.logistics.label',
    descriptionKey: 'waterwayMap.operationalModes.logistics.description',
    businessGoal:
      'Explicar prazo ao embarcador: terminais, filas, transbordos, checkpoints e ETA.',
    primaryAudience: 'shipper',
    cognitiveLoad: 'low',
    mapEmphasis: 'terminals-eta-queue',
    visibleFeatureKinds: ['terminal', 'checkpoint', 'corridor', 'alert'],
    mutedFeatureKinds: ['signal', 'planningArea'],
    visualIntent: 'Onde a carga entra/sai e o que pode atrasar a janela portuária.',
  },
  {
    id: 'risk',
    labelKey: 'waterwayMap.operationalModes.risk.label',
    descriptionKey: 'waterwayMap.operationalModes.risk.description',
    businessGoal:
      'Destacar riscos que impactam ETA, custo, segurança ou roteamento alternativo.',
    primaryAudience: 'mixed',
    cognitiveLoad: 'medium',
    mapEmphasis: 'alerts-severity-impact',
    visibleFeatureKinds: ['alert', 'segment', 'checkpoint'],
    mutedFeatureKinds: ['planningArea'],
    visualIntent: 'Somente o que exige ação ou replanejamento.',
  },
  {
    id: 'government',
    labelKey: 'waterwayMap.operationalModes.government.label',
    descriptionKey: 'waterwayMap.operationalModes.government.description',
    businessGoal:
      'Contexto institucional: bacias, corredores prioritários, concessões e planos de dragagem.',
    primaryAudience: 'government',
    cognitiveLoad: 'medium',
    mapEmphasis: 'planning-corridors-basins',
    visibleFeatureKinds: ['planningArea', 'corridor'],
    mutedFeatureKinds: ['alert', 'signal', 'checkpoint'],
    visualIntent: 'Planejamento e política hidroviária — não operação tática diária.',
  },
] as const;

export function getHydrowayOperationalLayerModeConfig(
  mode: HydrowayOperationalLayerModeConfig['id'],
): HydrowayOperationalLayerModeConfig | undefined {
  return HYDROWAY_OPERATIONAL_LAYER_MODES.find((entry) => entry.id === mode);
}
