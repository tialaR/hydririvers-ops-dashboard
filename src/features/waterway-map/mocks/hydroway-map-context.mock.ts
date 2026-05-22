/**
 * GeoJSON mock/dev — contexto hidroviário e governamental para o spike MapLibre.
 * Geometrias fictícias e determinísticas; não representam dados oficiais.
 */

const MOCK_SCOPE = 'dev-mock' as const;
const MOCK_SOURCE_NOTE =
  'Dados fictícios para desenvolvimento; não substituem bases oficiais.';

function line(
  id: string,
  name: string,
  coordinates: GeoJSON.Position[],
  props: Record<string, unknown>,
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      dataScope: MOCK_SCOPE,
      sourceNotes: MOCK_SOURCE_NOTE,
      ...props,
    },
    geometry: { type: 'LineString', coordinates },
  };
}

function point(
  id: string,
  name: string,
  coordinates: GeoJSON.Position,
  props: Record<string, unknown>,
): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      dataScope: MOCK_SCOPE,
      sourceNotes: MOCK_SOURCE_NOTE,
      ...props,
    },
    geometry: { type: 'Point', coordinates },
  };
}

function polygon(
  id: string,
  name: string,
  ring: GeoJSON.Position[],
  props: Record<string, unknown>,
): GeoJSON.Feature<GeoJSON.Polygon> {
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      dataScope: MOCK_SCOPE,
      sourceNotes: MOCK_SOURCE_NOTE,
      ...props,
    },
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}

/** Corredores hidroviários mock — Norte/Amazônia (prioridade spike). */
export const HYDRAWAY_MOCK_WATERWAY_CORRIDORS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    line(
      'corridor-solimoes-amazonas',
      'Solimões-Amazonas',
      [
        [-58.2, -3.2],
        [-56.5, -2.1],
        [-54.8, -1.9],
        [-52.5, -1.75],
        [-50.2, -1.72],
        [-48.5, -1.65],
      ],
      {
        category: 'main',
        status: 'operational',
        cargoProfile: 'general',
        navigability: 'high',
        draftRisk: 'medium',
        authorityContext: 'mock-corridor-amazonas',
      },
    ),
    line(
      'corridor-tapajos',
      'Tapajós',
      [
        [-55.2, -2.8],
        [-54.6, -2.2],
        [-54.1, -1.85],
        [-53.4, -1.55],
      ],
      {
        category: 'secondary',
        status: 'seasonal',
        cargoProfile: 'grains',
        navigability: 'medium',
        draftRisk: 'medium',
        authorityContext: 'mock-corridor-tapajos',
      },
    ),
    line(
      'corridor-madeira',
      'Madeira',
      [
        [-63.5, -3.1],
        [-61.8, -2.6],
        [-60.2, -2.2],
        [-58.8, -2.0],
      ],
      {
        category: 'main',
        status: 'operational',
        cargoProfile: 'fuel',
        navigability: 'high',
        draftRisk: 'low',
        authorityContext: 'mock-corridor-madeira',
      },
    ),
    line(
      'corridor-tocantins-araguaia',
      'Tocantins-Araguaia',
      [
        [-49.5, -2.5],
        [-49.0, -1.9],
        [-48.6, -1.5],
        [-48.2, -1.2],
      ],
      {
        category: 'strategic',
        status: 'monitoring',
        cargoProfile: 'ores',
        navigability: 'medium',
        draftRisk: 'high',
        authorityContext: 'mock-corridor-tocantins',
      },
    ),
    line(
      'corridor-belem-santarem-manaus',
      'Belém — Vila do Conde — Santarém — Manaus',
      [
        [-48.52, -1.65],
        [-49.8, -1.68],
        [-52.0, -1.72],
        [-54.5, -1.78],
        [-57.0, -1.85],
        [-60.0, -2.95],
      ],
      {
        category: 'strategic',
        status: 'operational',
        cargoProfile: 'containers',
        navigability: 'high',
        draftRisk: 'low',
        authorityContext: 'mock-corridor-logistico-norte',
      },
    ),
    line(
      'corridor-paraguai-parana',
      'Paraguai-Paraná (referência)',
      [
        [-58.5, -3.8],
        [-57.5, -3.5],
        [-56.8, -3.2],
      ],
      {
        category: 'secondary',
        status: 'operational',
        cargoProfile: 'general',
        navigability: 'high',
        draftRisk: 'low',
        authorityContext: 'mock-corridor-sul-referencia',
      },
    ),
  ],
};

/** Terminais e portos mock. */
export const HYDRAWAY_MOCK_WATERWAY_TERMINALS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    point('terminal-belem', 'Belém', [-48.51875, -1.65], {
      tooltipKind: 'terminal',
      type: 'public-port',
      cargoProfile: 'general',
      operationalStatus: 'active',
      importance: 'national',
    }),
    point('terminal-vila-conde', 'Vila do Conde', [-48.0125, -1.46], {
      tooltipKind: 'terminal',
      type: 'terminal',
      cargoProfile: 'bulk',
      operationalStatus: 'active',
      importance: 'national',
    }),
    point('terminal-santarem', 'Santarém', [-54.73611, -2.44306], {
      type: 'transshipment',
      cargoProfile: 'grains',
      operationalStatus: 'active',
      importance: 'regional',
    }),
    point('terminal-manaus', 'Manaus', [-60.025, -3.119], {
      type: 'public-port',
      cargoProfile: 'containers',
      operationalStatus: 'active',
      importance: 'national',
    }),
    point('terminal-itacoatiara', 'Itacoatiara', [-58.44417, -3.13889], {
      type: 'terminal',
      cargoProfile: 'general',
      operationalStatus: 'active',
      importance: 'regional',
    }),
    point('terminal-miritituba', 'Miritituba', [-55.15, -1.72], {
      type: 'transshipment',
      cargoProfile: 'grains',
      operationalStatus: 'attention',
      importance: 'regional',
    }),
    point('terminal-porto-velho', 'Porto Velho', [-63.9, -8.76], {
      type: 'public-port',
      cargoProfile: 'fuel',
      operationalStatus: 'active',
      importance: 'regional',
    }),
    point('terminal-macapa', 'Macapá / Santana', [-51.05, 0.05], {
      type: 'public-port',
      cargoProfile: 'general',
      operationalStatus: 'active',
      importance: 'regional',
    }),
    point('terminal-maraba', 'Marabá', [-49.95, -5.37], {
      type: 'terminal',
      cargoProfile: 'ores',
      operationalStatus: 'monitoring',
      importance: 'local',
    }),
    point('terminal-abaetetuba', 'Abaetetuba', [-48.88, -1.72], {
      type: 'ip4',
      cargoProfile: 'general',
      operationalStatus: 'active',
      importance: 'local',
    }),
  ],
};

/** Eclusas, barragens e restrições mock. */
export const HYDRAWAY_MOCK_WATERWAY_INFRASTRUCTURE: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    point('infra-tucurui', 'Tucuruí', [-49.68, -3.83], {
      tooltipKind: 'infrastructure',
      assetType: 'dam',
      severity: 'medium',
      note: 'Mock — ponto de referência operacional',
    }),
    point('infra-santo-antonio', 'Santo Antônio', [-66.85, -8.76], {
      assetType: 'dam',
      severity: 'high',
      note: 'Mock — eclusa/barragem Madeira',
    }),
    point('infra-jirau', 'Jirau', [-64.65, -10.85], {
      assetType: 'dam',
      severity: 'high',
      note: 'Mock — eclusa/barragem Madeira',
    }),
    point('infra-draft-tocantins', 'Restrição calado Tocantins', [-48.35, -1.35], {
      assetType: 'draft-restriction',
      severity: 'high',
      note: 'Mock — zona de calado restrito',
    }),
    point('infra-nav-risk-obidos', 'Risco navegação Óbidos', [-50.35, -1.76], {
      assetType: 'navigation-risk',
      severity: 'medium',
      note: 'Mock — curva crítica',
    }),
  ],
};

/** Balizamento e sinalização mock. */
export const HYDRAWAY_MOCK_WATERWAY_SIGNALS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    point('signal-buoy-01', 'Boia canal principal', [-53.2, -1.78], {
      tooltipKind: 'signal',
      signalType: 'buoy',
      condition: 'ok',
      visibilityPriority: 'high',
    }),
    point('signal-beacon-02', 'Farol estuário', [-48.75, -1.58], {
      signalType: 'beacon',
      condition: 'ok',
      visibilityPriority: 'high',
    }),
    point('signal-light-03', 'Luz curva Tapajós', [-54.0, -1.62], {
      signalType: 'light',
      condition: 'attention',
      visibilityPriority: 'medium',
    }),
    point('signal-ref-04', 'Referência travessia', [-51.8, -1.7], {
      signalType: 'reference',
      condition: 'ok',
      visibilityPriority: 'medium',
    }),
    point('signal-buoy-05', 'Boia calha', [-50.1, -1.74], {
      signalType: 'buoy',
      condition: 'maintenance',
      visibilityPriority: 'low',
    }),
    point('signal-beacon-06', 'Baliza Madeira', [-59.5, -2.05], {
      signalType: 'beacon',
      condition: 'ok',
      visibilityPriority: 'medium',
    }),
  ],
};

/** Bacias hidrográficas simplificadas (mock). */
export const HYDRAWAY_MOCK_WATERWAY_BASINS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    polygon(
      'basin-amazonica',
      'Bacia Amazônica',
      [
        [-60.2, -3.8],
        [-47.5, -3.8],
        [-47.5, -0.8],
        [-60.2, -0.8],
        [-60.2, -3.8],
      ],
      {
        basinName: 'Bacia Amazônica',
        region: 'Norte',
        planningPriority: 'high',
        environmentalSensitivity: 'high',
      },
    ),
    polygon(
      'basin-tocantins-araguaia',
      'Tocantins-Araguaia',
      [
        [-50.5, -2.2],
        [-47.8, -2.2],
        [-47.8, -0.9],
        [-50.5, -0.9],
        [-50.5, -2.2],
      ],
      {
        basinName: 'Tocantins-Araguaia',
        region: 'Norte',
        planningPriority: 'medium',
        environmentalSensitivity: 'medium',
      },
    ),
    polygon(
      'basin-madeira',
      'Madeira',
      [
        [-64.5, -3.5],
        [-58.0, -3.5],
        [-58.0, -1.8],
        [-64.5, -1.8],
        [-64.5, -3.5],
      ],
      {
        basinName: 'Madeira',
        region: 'Norte',
        planningPriority: 'medium',
        environmentalSensitivity: 'high',
      },
    ),
    polygon(
      'basin-tapajos',
      'Tapajós',
      [
        [-56.0, -2.5],
        [-52.5, -2.5],
        [-52.5, -1.2],
        [-56.0, -1.2],
        [-56.0, -2.5],
      ],
      {
        basinName: 'Tapajós',
        region: 'Norte',
        planningPriority: 'medium',
        environmentalSensitivity: 'medium',
      },
    ),
    polygon(
      'basin-para-estuario',
      'Pará / estuário amazônico',
      [
        [-50.0, -2.0],
        [-47.5, -2.0],
        [-47.5, 0.2],
        [-50.0, 0.2],
        [-50.0, -2.0],
      ],
      {
        basinName: 'Pará / estuário amazônico',
        region: 'Pará',
        planningPriority: 'high',
        environmentalSensitivity: 'high',
      },
    ),
  ],
};

/** Zonas operacionais e alertas mock. */
/** Nós informativos sobre corredores — tooltips sem hover na linha inteira. */
export const HYDRAWAY_MOCK_WATERWAY_CORRIDOR_INFO_POINTS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    point('corridor-info-solimoes', 'Nó Solimões-Amazonas', [-54.2, -1.82], {
      tooltipKind: 'corridor',
      category: 'main',
      status: 'operational',
      navigability: 'high',
      cargoProfile: 'general',
    }),
    point('corridor-info-tapajos', 'Nó Tapajós', [-54.0, -1.62], {
      tooltipKind: 'corridor',
      category: 'secondary',
      status: 'seasonal',
      navigability: 'medium',
      cargoProfile: 'grains',
    }),
    point('corridor-info-madeira', 'Nó Madeira', [-60.5, -2.15], {
      tooltipKind: 'corridor',
      category: 'main',
      status: 'operational',
      navigability: 'high',
      cargoProfile: 'fuel',
    }),
    point('corridor-info-tocantins', 'Nó Tocantins-Araguaia', [-48.9, -1.35], {
      tooltipKind: 'corridor',
      category: 'strategic',
      status: 'monitoring',
      navigability: 'medium',
      cargoProfile: 'ores',
    }),
    point('corridor-info-logistico', 'Nó logístico Norte', [-52.5, -1.72], {
      tooltipKind: 'corridor',
      category: 'strategic',
      status: 'operational',
      navigability: 'high',
      cargoProfile: 'containers',
    }),
  ],
};

/** Resumos de bacia — tooltips sem hover no fill amplo. */
export const HYDRAWAY_MOCK_WATERWAY_BASIN_INFO_POINTS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    point('basin-info-amazonica', 'Bacia Amazônica', [-53.8, -2.3], {
      tooltipKind: 'basin',
      region: 'Norte',
      importance: 'high',
      environmentalSensitivity: 'high',
    }),
    point('basin-info-tocantins', 'Tocantins-Araguaia', [-49.15, -1.55], {
      tooltipKind: 'basin',
      region: 'Norte',
      importance: 'medium',
      environmentalSensitivity: 'medium',
    }),
    point('basin-info-madeira', 'Madeira', [-61.2, -2.65], {
      tooltipKind: 'basin',
      region: 'Norte',
      importance: 'medium',
      environmentalSensitivity: 'high',
    }),
    point('basin-info-tapajos', 'Tapajós', [-54.25, -1.85], {
      tooltipKind: 'basin',
      region: 'Norte',
      importance: 'medium',
      environmentalSensitivity: 'medium',
    }),
    point('basin-info-para', 'Pará / estuário', [-48.75, -0.9], {
      tooltipKind: 'basin',
      region: 'Pará',
      importance: 'high',
      environmentalSensitivity: 'high',
    }),
  ],
};

/** Pontos de alerta — tooltips sem hover na zona inteira. */
export const HYDRAWAY_MOCK_WATERWAY_ALERT_POINTS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    point('alert-point-visibility', 'Baixa visibilidade', [-48.8, -1.4], {
      tooltipKind: 'alert',
      alertType: 'low-visibility',
      severity: 'medium',
    }),
    point('alert-point-draft', 'Calado restrito', [-48.3, -1.28], {
      tooltipKind: 'alert',
      alertType: 'draft-restricted',
      severity: 'high',
    }),
    point('alert-point-traffic', 'Tráfego intenso', [-53.6, -1.75], {
      tooltipKind: 'alert',
      alertType: 'traffic-intense',
      severity: 'medium',
    }),
    point('alert-point-environmental', 'Monitoramento ambiental', [-56.85, -1.9], {
      tooltipKind: 'alert',
      alertType: 'environmental-monitoring',
      severity: 'low',
    }),
  ],
};

export const HYDRAWAY_MOCK_WATERWAY_ALERT_ZONES: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    polygon(
      'alert-low-visibility',
      'Baixa visibilidade',
      [
        [-49.2, -1.55],
        [-48.4, -1.55],
        [-48.4, -1.25],
        [-49.2, -1.25],
        [-49.2, -1.55],
      ],
      {
        alertType: 'low-visibility',
        severity: 'medium',
        description: 'Mock — neblina estuarina',
      },
    ),
    polygon(
      'alert-draft-restricted',
      'Calado restrito',
      [
        [-48.6, -1.45],
        [-48.0, -1.45],
        [-48.0, -1.1],
        [-48.6, -1.1],
        [-48.6, -1.45],
      ],
      {
        alertType: 'draft-restricted',
        severity: 'high',
        description: 'Mock — restrição sazonal de calado',
      },
    ),
    polygon(
      'alert-traffic-intense',
      'Tráfego intenso',
      [
        [-54.0, -1.95],
        [-53.2, -1.95],
        [-53.2, -1.55],
        [-54.0, -1.55],
        [-54.0, -1.95],
      ],
      {
        alertType: 'traffic-intense',
        severity: 'medium',
        description: 'Mock — convergência de corredores',
      },
    ),
    polygon(
      'alert-environmental',
      'Monitoramento ambiental',
      [
        [-57.5, -2.2],
        [-56.2, -2.2],
        [-56.2, -1.6],
        [-57.5, -1.6],
        [-57.5, -2.2],
      ],
      {
        alertType: 'environmental-monitoring',
        severity: 'low',
        description: 'Mock — sensibilidade ambiental',
      },
    ),
  ],
};

export const HYDRAWAY_MAP_CONTEXT_MOCK = {
  corridors: HYDRAWAY_MOCK_WATERWAY_CORRIDORS,
  corridorInfoPoints: HYDRAWAY_MOCK_WATERWAY_CORRIDOR_INFO_POINTS,
  terminals: HYDRAWAY_MOCK_WATERWAY_TERMINALS,
  infrastructure: HYDRAWAY_MOCK_WATERWAY_INFRASTRUCTURE,
  signals: HYDRAWAY_MOCK_WATERWAY_SIGNALS,
  basins: HYDRAWAY_MOCK_WATERWAY_BASINS,
  basinInfoPoints: HYDRAWAY_MOCK_WATERWAY_BASIN_INFO_POINTS,
  alertZones: HYDRAWAY_MOCK_WATERWAY_ALERT_ZONES,
  alertPoints: HYDRAWAY_MOCK_WATERWAY_ALERT_POINTS,
} as const;
