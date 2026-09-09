import type {
  WaterwayConstraint,
  WaterwayCorridor,
  WaterwayConstraintType,
  WaterwaySegment,
} from '../domain/waterway-tracking.types';

function makeConstraint(
  id: string,
  type: WaterwayConstraintType,
  severity: WaterwayConstraint['severity'],
  title: string,
  description: string,
): WaterwayConstraint {
  return { id, type, severity, title, description };
}

function makeSegment(
  corridorId: WaterwaySegment['corridorId'],
  id: string,
  name: string,
  origin: string,
  destination: string,
  distanceKm: number,
  navigabilityRisk: WaterwaySegment['navigabilityRisk'],
  constraints: WaterwayConstraint[],
): WaterwaySegment {
  return {
    id,
    corridorId,
    name,
    origin,
    destination,
    distanceKm,
    navigabilityRisk,
    constraints,
  };
}

const amazonasSegments: WaterwaySegment[] = [
  makeSegment(
    'amazonas',
    'amazonas-belem-santarem',
    'Belém–Santarém',
    'Belém, PA',
    'Santarém, PA',
    804,
    'medium',
    [
      makeConstraint(
        'amazonas-belem-santarem-port-window',
        'port-window',
        'warning',
        'Janela de atracação compartilhada',
        'Coordenação de berço e fila pode deslocar a atracação em até uma maré operacional.',
      ),
    ],
  ),
  makeSegment(
    'amazonas',
    'amazonas-manaus-belem',
    'Manaus–Belém',
    'Manaus, AM',
    'Belém, PA',
    1560,
    'medium',
    [
      makeConstraint(
        'amazonas-manaus-belem-signaling',
        'signaling',
        'warning',
        'Cobertura de sinal irregular',
        'Eventos de telemetria podem sincronizar em lote em trechos remotos do eixo amazônico.',
      ),
    ],
  ),
];

const madeiraSegments: WaterwaySegment[] = [
  makeSegment(
    'madeira',
    'madeira-porto-velho-itacoatiara',
    'Porto Velho–Itacoatiara',
    'Porto Velho, RO',
    'Itacoatiara, AM',
    1056,
    'high',
    [
      makeConstraint(
        'madeira-porto-velho-itacoatiara-draft',
        'draft',
        'critical',
        'Calado operacional sensível',
        'Trechos do rio Madeira exigem vigilância contínua de profundidade e ajuste fino de carga.',
      ),
    ],
  ),
  makeSegment(
    'madeira',
    'madeira-humaita-manaus',
    'Humaitá–Manaus',
    'Humaitá, AM',
    'Manaus, AM',
    726,
    'medium',
    [
      makeConstraint(
        'madeira-humaita-manaus-sla',
        'sla',
        'warning',
        'Janela noturna monitorada',
        'Passagens noturnas exigem monitoramento mais próximo para manter ETA e segurança operacional.',
      ),
    ],
  ),
];

const tapajosSegments: WaterwaySegment[] = [
  makeSegment(
    'tapajos-teles-pires',
    'tapajos-miritituba-santarem',
    'Miritituba–Santarém',
    'Miritituba, PA',
    'Santarém, PA',
    330,
    'high',
    [
      makeConstraint(
        'tapajos-miritituba-santarem-drought',
        'drought',
        'warning',
        'Estiagem acompanhada',
        'Oscilação de nível no Tapajós pode reduzir velocidade de comboios em janelas específicas.',
      ),
    ],
  ),
  makeSegment(
    'tapajos-teles-pires',
    'tapajos-itaituba-santarem',
    'Itaituba–Santarém',
    'Itaituba, PA',
    'Santarém, PA',
    289,
    'medium',
    [
      makeConstraint(
        'tapajos-itaituba-santarem-document',
        'document',
        'warning',
        'Conferência documental de chegada',
        'Documentos de carga e evidências do trecho devem estar reconciliados antes do destino.',
      ),
    ],
  ),
];

const tocantinsAraguaiaSegments: WaterwaySegment[] = [
  makeSegment(
    'tocantins-araguaia',
    'tocantins-maraba-vila-do-conde',
    'Marabá–Vila do Conde',
    'Marabá, PA',
    'Vila do Conde, PA',
    612,
    'medium',
    [
      makeConstraint(
        'tocantins-maraba-vila-do-conde-dredging',
        'dredging',
        'warning',
        'Intervenção de canal programada',
        'Dragagem em faixa operacional específica pode alterar a velocidade média do trecho.',
      ),
    ],
  ),
  makeSegment(
    'tocantins-araguaia',
    'tocantins-imperatriz-barcarena',
    'Imperatriz–Barcarena',
    'Imperatriz, MA',
    'Barcarena, PA',
    880,
    'high',
    [
      makeConstraint(
        'tocantins-imperatriz-barcarena-traffic',
        'traffic',
        'critical',
        'Atraso no encadeamento operacional',
        'Fila de passagem e ritmo inferior ao esperado pressionam o ETA em rotas longas.',
      ),
    ],
  ),
];

const barraNorteSegments: WaterwaySegment[] = [
  makeSegment(
    'barra-norte',
    'barra-norte-santana-canal-norte',
    'Santana–Canal Norte',
    'Santana, AP',
    'Canal Norte',
    286,
    'high',
    [
      makeConstraint(
        'barra-norte-santana-canal-norte-port-window',
        'port-window',
        'warning',
        'Fila de acesso marítimo-fluvial',
        'A coordenação de acesso no canal pode deslocar a hora de aproximação final.',
      ),
    ],
  ),
  makeSegment(
    'barra-norte',
    'barra-norte-macapa-foz',
    'Macapá–Foz Amazônica',
    'Macapá, AP',
    'Foz Amazônica',
    318,
    'high',
    [
      makeConstraint(
        'barra-norte-macapa-foz-institutional',
        'institutional',
        'warning',
        'Trecho crítico de governança operacional',
        'Acesso sensível a manutenção, coordenação institucional e rotinas de segurança de navegação.',
      ),
    ],
  ),
];

export const WATERWAY_CORRIDORS: WaterwayCorridor[] = [
  {
    id: 'amazonas',
    name: 'Hidrovia do Amazonas',
    region: 'Norte / Amazônia',
    mainRivers: ['Amazonas', 'Solimões', 'Negro'],
    strategicRole: 'Eixo estrutural de abastecimento, bioeconomia, carga geral e integração portuária amazônica.',
    concessionStatus: 'planned',
    referenceLabels: ['Rio Amazonas', 'Canal Norte', 'Porto Hidroviário', 'Corredor Norte'],
    segments: amazonasSegments,
  },
  {
    id: 'madeira',
    name: 'Hidrovia do Madeira',
    region: 'Norte / Rondônia-Amazonas',
    mainRivers: ['Madeira', 'Amazonas'],
    strategicRole: 'Corredor de grãos, combustíveis e cargas industriais entre Porto Velho e os terminais do Amazonas.',
    concessionStatus: 'planned',
    referenceLabels: ['Rio Madeira', 'Porto Velho', 'Humaitá', 'Itacoatiara'],
    segments: madeiraSegments,
  },
  {
    id: 'tapajos-teles-pires',
    name: 'Hidrovia Tapajós-Teles Pires',
    region: 'Norte / Arco Norte',
    mainRivers: ['Tapajós', 'Teles Pires', 'Amazonas'],
    strategicRole: 'Corredor de escoamento agroindustrial entre o eixo de Miritituba/Itaituba e os portos do Arco Norte.',
    concessionStatus: 'bidding',
    referenceLabels: ['Rio Tapajós', 'Miritituba', 'Santarém', 'Itaituba'],
    segments: tapajosSegments,
  },
  {
    id: 'tocantins-araguaia',
    name: 'Hidrovia Tocantins-Araguaia',
    region: 'Norte / Centro-Norte',
    mainRivers: ['Tocantins', 'Araguaia'],
    strategicRole: 'Corredor de cargas gerais, minerais, fertilizantes e integração hidroviária com a região de Barcarena.',
    concessionStatus: 'unknown',
    referenceLabels: ['Rio Tocantins', 'Rio Araguaia', 'Marabá', 'Vila do Conde'],
    segments: tocantinsAraguaiaSegments,
  },
  {
    id: 'barra-norte',
    name: 'Barra Norte',
    region: 'Foz Amazônica',
    mainRivers: ['Amazonas', 'Canal Norte'],
    strategicRole: 'Trecho crítico de acesso marítimo-fluvial, sensível a segurança, manutenção e coordenação de janelas portuárias.',
    concessionStatus: 'planned',
    referenceLabels: ['Barra Norte', 'Canal Norte', 'Foz Amazônica', 'Macapá'],
    segments: barraNorteSegments,
  },
];

export const WATERWAY_SEGMENTS: WaterwaySegment[] = WATERWAY_CORRIDORS.flatMap(
  (corridor) => corridor.segments,
);
