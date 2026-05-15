import type {
  CargoLifecycleStatus,
  CargoWaterwayTrackingScenario,
  WaterwayOperationalStatus,
  WaterwayRiskLevel,
  WaterwaySegment,
} from '../domain/waterway-tracking.types';
import { WATERWAY_SEGMENTS } from './waterway-corridors.mock';
import {
  clampWaterwayPercent,
  getDefaultOperationalStatusForCargoStatus,
  getDefaultProgressForCargoStatus,
  getRemainingWaterwayPercent,
} from '../utils/waterway-progress.utils';

type ScenarioSeed = {
  cargoId: string;
  cargoStatus: CargoLifecycleStatus;
  title: string;
  corridorId: WaterwaySegment['corridorId'];
  segmentId: WaterwaySegment['id'];
  cargoType: string;
  priorityLevel: CargoWaterwayTrackingScenario['priorityLevel'];
  operationalStatus?: WaterwayOperationalStatus;
  riskLevel: WaterwayRiskLevel;
  vesselName: string;
  vesselKind: CargoWaterwayTrackingScenario['vessel']['kind'];
  vesselOperator: string;
  progressPercent?: number;
  eta: string;
  signalPercent: number;
  documentsReadyPercent: number;
  estimatedCost: number;
  co2SavingsPercent: number;
  currentDescription: string;
  mapSecondaryLabel?: string;
  placeLabels?: string[];
  constraints?: Array<{
    idSuffix: string;
    type: CargoWaterwayTrackingScenario['constraints'][number]['type'];
    severity: CargoWaterwayTrackingScenario['constraints'][number]['severity'];
    title: string;
    description: string;
  }>;
};

const corridorLabelMap: Record<
  WaterwaySegment['corridorId'],
  { primary: string; secondary: string; places: string[] }
> = {
  amazonas: {
    primary: 'RIO AMAZONAS',
    secondary: 'EIXO AMAZONAS',
    places: ['BELÉM', 'SANTARÉM', 'MANAUS', 'ÓBIDOS', 'ALMEIRIM'],
  },
  madeira: {
    primary: 'RIO MADEIRA',
    secondary: 'EIXO MADEIRA',
    places: ['PORTO VELHO', 'HUMAITÁ', 'MANICORÉ', 'ITACOATIARA', 'MANAUS'],
  },
  'tapajos-teles-pires': {
    primary: 'RIO TAPAJÓS',
    secondary: 'TAPAJÓS-TELES PIRES',
    places: ['MIRITITUBA', 'ITAITUBA', 'SANTARÉM', 'AVEIRO', 'ARCO NORTE'],
  },
  'tocantins-araguaia': {
    primary: 'RIO TOCANTINS',
    secondary: 'TOCANTINS-ARAGUAIA',
    places: ['MARABÁ', 'IMPERATRIZ', 'BARCARENA', 'VILA DO CONDE', 'CENTRO-NORTE'],
  },
  'barra-norte': {
    primary: 'BARRA NORTE',
    secondary: 'ACESSO FLUVIAL',
    places: ['MACAPÁ', 'SANTANA', 'CANAL NORTE', 'FOZ AMAZÔNICA', 'ACESSO MARÍTIMO'],
  },
};

const scenarioSeeds: ScenarioSeed[] = [
  {
    cargoId: 'cargo-001',
    cargoStatus: 'open',
    title: 'Polpa de açaí congelada — cooperativa ribeirinha',
    corridorId: 'amazonas',
    segmentId: 'amazonas-belem-santarem',
    cargoType: 'Refrigerada',
    priorityLevel: 'normal',
    riskLevel: 'medium',
    vesselName: 'Frio Tapajós',
    vesselKind: 'reefer-barge',
    vesselOperator: 'FrioRios',
    eta: '36h',
    signalPercent: 78,
    documentsReadyPercent: 72,
    estimatedCost: 6200,
    co2SavingsPercent: 45,
    currentDescription: 'Janela curta de embarque e sincronização tardia exigem monitoramento de cadeia fria.',
    constraints: [
      {
        idSuffix: 'cold-chain',
        type: 'sla',
        severity: 'warning',
        title: 'Janela curta de cadeia fria',
        description: 'A operação depende de confirmação rápida de embarque e manutenção de temperatura estável.',
      },
    ],
  },
  {
    cargoId: 'cargo-009',
    cargoStatus: 'open',
    title: 'Contêineres de cabotagem conectada Norte–Nordeste',
    corridorId: 'barra-norte',
    segmentId: 'barra-norte-santana-canal-norte',
    cargoType: 'Cabotagem',
    priorityLevel: 'high',
    riskLevel: 'medium',
    vesselName: 'Cabotagem Norte 01',
    vesselKind: 'barge',
    vesselOperator: 'BR do Mar Log',
    eta: '5-6 dias',
    signalPercent: 96,
    documentsReadyPercent: 92,
    estimatedCost: 24600,
    co2SavingsPercent: 52,
    currentDescription: 'Conexão portuária em abertura comercial, com dependência forte de janela de acesso e booking final.',
    constraints: [
      {
        idSuffix: 'port-window',
        type: 'port-window',
        severity: 'warning',
        title: 'Janela portuária sensível',
        description: 'A aproximação final depende da coordenação entre fila de terminal e acesso hidro-marítimo.',
      },
    ],
  },
  {
    cargoId: 'cargo-002',
    cargoStatus: 'bidding',
    title: 'Farinha de mandioca ensacada — casa de farinha',
    corridorId: 'amazonas',
    segmentId: 'amazonas-manaus-belem',
    cargoType: 'Seca',
    priorityLevel: 'normal',
    riskLevel: 'medium',
    vesselName: 'Comboio Rio Negro',
    vesselKind: 'convoy',
    vesselOperator: 'Navega Norte',
    eta: '4-6 dias',
    signalPercent: 80,
    documentsReadyPercent: 64,
    estimatedCost: 7570,
    co2SavingsPercent: 48,
    currentDescription: 'Lotes agregados ainda em composição comercial, com ETA sujeito à cadência de negociação.',
    constraints: [
      {
        idSuffix: 'document',
        type: 'document',
        severity: 'warning',
        title: 'Consolidação documental em andamento',
        description: 'Romaneio e evidências por lote ainda estão sendo alinhados para suportar a contratação.',
      },
    ],
  },
  {
    cargoId: 'cargo-006',
    cargoStatus: 'bidding',
    title: 'Cacau e cupuaçu em cadeia de bioeconomia • lote 7',
    corridorId: 'amazonas',
    segmentId: 'amazonas-manaus-belem',
    cargoType: 'Fracionada',
    priorityLevel: 'high',
    riskLevel: 'medium',
    vesselName: 'Hydro Eco-16',
    vesselKind: 'barge',
    vesselOperator: 'Corredor BioNorte',
    eta: '4-5 dias',
    signalPercent: 94,
    documentsReadyPercent: 76,
    estimatedCost: 13050,
    co2SavingsPercent: 60,
    currentDescription: 'Carga multi-produtor em etapa de cotação, com rota previsível e documentação quase pronta.',
    constraints: [
      {
        idSuffix: 'sla',
        type: 'sla',
        severity: 'info',
        title: 'Consolidação multi-produtor',
        description: 'A janela comercial depende da virada final de lotes e aceite do operador hidroviário.',
      },
    ],
  },
  {
    cargoId: 'cargo-003',
    cargoStatus: 'contracting',
    title: 'Castanha beneficiada com rastreabilidade socioambiental',
    corridorId: 'tapajos-teles-pires',
    segmentId: 'tapajos-itaituba-santarem',
    cargoType: 'Fracionada',
    priorityLevel: 'normal',
    riskLevel: 'high',
    vesselName: 'Tapajós Secure-15',
    vesselKind: 'barge',
    vesselOperator: 'Tapajós Cargo',
    eta: '52-72h',
    signalPercent: 61,
    documentsReadyPercent: 81,
    estimatedCost: 8940,
    co2SavingsPercent: 51,
    currentDescription: 'A contratação avança, mas o trecho exige rastreabilidade de origem e cuidado com vazante.',
    constraints: [
      {
        idSuffix: 'draft',
        type: 'draft',
        severity: 'critical',
        title: 'Trecho sujeito a vazante',
        description: 'A negociação operacional considera o ajuste de calado e a janela real de navegação.',
      },
    ],
  },
  {
    cargoId: 'cargo-008',
    cargoStatus: 'contracting',
    title: 'Equipamentos solares para comunidades ribeirinhas',
    corridorId: 'tocantins-araguaia',
    segmentId: 'tocantins-maraba-vila-do-conde',
    cargoType: 'Projeto',
    priorityLevel: 'high',
    riskLevel: 'medium',
    vesselName: 'Hydro Push-09',
    vesselKind: 'push-boat',
    vesselOperator: 'Programa Energia Ribeirinha',
    eta: '6-8 dias',
    signalPercent: 82,
    documentsReadyPercent: 88,
    estimatedCost: 19900,
    co2SavingsPercent: 75,
    currentDescription: 'Operação de política pública em contratação, com checagem de integridade e múltiplos pontos de entrega.',
    constraints: [
      {
        idSuffix: 'institutional',
        type: 'institutional',
        severity: 'warning',
        title: 'Coordenação institucional ativa',
        description: 'Aceites operacionais e sequência de desembarque precisam ser validados antes da reserva final.',
      },
    ],
  },
  {
    cargoId: 'cargo-004',
    cargoStatus: 'reserved',
    title: 'Pirarucu manejado refrigerado',
    corridorId: 'amazonas',
    segmentId: 'amazonas-manaus-belem',
    cargoType: 'Refrigerada',
    priorityLevel: 'high',
    riskLevel: 'high',
    vesselName: 'Frio Tapajós',
    vesselKind: 'reefer-barge',
    vesselOperator: 'FrioRios',
    progressPercent: 44,
    eta: '30-42h',
    signalPercent: 66,
    documentsReadyPercent: 58,
    estimatedCost: 10310,
    co2SavingsPercent: 39,
    currentDescription: 'Reserva confirmada com operação sanitária crítica e monitoramento constante de temperatura.',
    constraints: [
      {
        idSuffix: 'document',
        type: 'document',
        severity: 'warning',
        title: 'Janela sanitária acompanhada',
        description: 'A operação exige conferência contínua de documentação sanitária e evidências de cadeia fria.',
      },
    ],
  },
  {
    cargoId: 'cargo-007',
    cargoStatus: 'reserved',
    title: 'Medicamentos refrigerados para abastecimento territorial',
    corridorId: 'amazonas',
    segmentId: 'amazonas-manaus-belem',
    cargoType: 'Refrigerada',
    priorityLevel: 'critical',
    operationalStatus: 'contingency',
    riskLevel: 'high',
    vesselName: 'Solimões Care',
    vesselKind: 'reefer-barge',
    vesselOperator: 'Saúde Ribeirinha',
    progressPercent: 41,
    eta: '7-10 dias',
    signalPercent: 59,
    documentsReadyPercent: 69,
    estimatedCost: 15790,
    co2SavingsPercent: 66,
    currentDescription: 'Carga prioritária para abastecimento essencial, já reservada, em operação sensível a conectividade e SLA.',
    constraints: [
      {
        idSuffix: 'sla',
        type: 'sla',
        severity: 'critical',
        title: 'SLA crítico de abastecimento',
        description: 'Qualquer perda de janela impacta diretamente o abastecimento territorial prioritário.',
      },
    ],
  },
  {
    cargoId: 'cargo-boarded-001',
    cargoStatus: 'boarded',
    title: 'Comboio agroindustrial em trânsito',
    corridorId: 'tapajos-teles-pires',
    segmentId: 'tapajos-miritituba-santarem',
    cargoType: 'Grãos em comboio',
    priorityLevel: 'high',
    riskLevel: 'medium',
    vesselName: 'Comboio Grãos-44',
    vesselKind: 'convoy',
    vesselOperator: 'Tapajós Logistics',
    progressPercent: 72,
    eta: '5h05',
    signalPercent: 95,
    documentsReadyPercent: 91,
    estimatedCost: 29400,
    co2SavingsPercent: 63,
    currentDescription: 'Comboio já embarcado e em avanço regular pelo corredor Tapajós, com ETA estável.',
    constraints: [
      {
        idSuffix: 'traffic',
        type: 'traffic',
        severity: 'info',
        title: 'Comboio coordenado',
        description: 'Tráfego dentro do previsto para a janela atual de navegação e atracação.',
      },
    ],
  },
  {
    cargoId: 'cargo-boarded-002',
    cargoStatus: 'boarded',
    title: 'Combustível monitorado no Madeira',
    corridorId: 'madeira',
    segmentId: 'madeira-porto-velho-itacoatiara',
    cargoType: 'Combustível',
    priorityLevel: 'critical',
    operationalStatus: 'restricted',
    riskLevel: 'critical',
    vesselName: 'Fuel Barge Madeira-04',
    vesselKind: 'fuel-barge',
    vesselOperator: 'Hidrovia Madeira',
    progressPercent: 68,
    eta: '18h10',
    signalPercent: 83,
    documentsReadyPercent: 96,
    estimatedCost: 42100,
    co2SavingsPercent: 48,
    currentDescription: 'Carga embarcada em trecho sensível do Madeira, com limitação operacional por calado.',
    constraints: [
      {
        idSuffix: 'draft',
        type: 'draft',
        severity: 'critical',
        title: 'Calado restrito em navegação',
        description: 'A passagem embarcada depende de monitoramento contínuo de profundidade e ajuste fino de velocidade.',
      },
    ],
  },
  {
    cargoId: 'cargo-delivered-001',
    cargoStatus: 'delivered',
    title: 'Mineral com prioridade industrial entregue',
    corridorId: 'tocantins-araguaia',
    segmentId: 'tocantins-maraba-vila-do-conde',
    cargoType: 'Mineral a granel',
    priorityLevel: 'high',
    operationalStatus: 'on-time',
    riskLevel: 'low',
    vesselName: 'Tocantins Bulk-23',
    vesselKind: 'convoy',
    vesselOperator: 'Bulk Centro-Norte',
    progressPercent: 100,
    eta: 'entregue',
    signalPercent: 97,
    documentsReadyPercent: 100,
    estimatedCost: 37100,
    co2SavingsPercent: 55,
    currentDescription: 'Operação concluída com entrega no destino e reconciliação operacional encerrada.',
    constraints: [
      {
        idSuffix: 'traffic',
        type: 'traffic',
        severity: 'info',
        title: 'Entrega concluída',
        description: 'Fluxo industrial finalizado sem ruptura relevante de janela nem desvio de custo crítico.',
      },
    ],
  },
  {
    cargoId: 'cargo-delivered-002',
    cargoStatus: 'delivered',
    title: 'Exportação concluída via Barra Norte',
    corridorId: 'barra-norte',
    segmentId: 'barra-norte-macapa-foz',
    cargoType: 'Carga de exportação',
    priorityLevel: 'high',
    operationalStatus: 'on-time',
    riskLevel: 'low',
    vesselName: 'Export Norte-24',
    vesselKind: 'barge',
    vesselOperator: 'Norte Export',
    progressPercent: 100,
    eta: 'entregue',
    signalPercent: 98,
    documentsReadyPercent: 100,
    estimatedCost: 40400,
    co2SavingsPercent: 49,
    currentDescription: 'Entrega concluída no acesso fluvial, com documentação final consolidada e operação encerrada.',
    constraints: [
      {
        idSuffix: 'institutional',
        type: 'institutional',
        severity: 'info',
        title: 'Acesso final concluído',
        description: 'Coordenação institucional e janela de acesso encerradas sem pendência operacional residual.',
      },
    ],
  },
];

function splitCityState(location: string): { city: string; state: string } {
  const [city, state] = location.split(',').map((item) => item.trim());

  return {
    city: city ?? location,
    state: state ?? '',
  };
}

function getSegmentById(segmentId: string): WaterwaySegment {
  const segment = WATERWAY_SEGMENTS.find((item) => item.id === segmentId);

  if (!segment) {
    throw new Error(`Unknown waterway segment: ${segmentId}`);
  }

  return segment;
}

function makeScenario(seed: ScenarioSeed): CargoWaterwayTrackingScenario {
  const segment = getSegmentById(seed.segmentId);
  const corridorLabels = corridorLabelMap[seed.corridorId];
  const progressPercent = clampWaterwayPercent(
    typeof seed.progressPercent === 'number'
      ? seed.progressPercent
      : getDefaultProgressForCargoStatus(seed.cargoStatus),
  );
  const operationalStatus =
    seed.operationalStatus ?? getDefaultOperationalStatusForCargoStatus(seed.cargoStatus);
  const remainingPercent = getRemainingWaterwayPercent(progressPercent);
  const originTerminal = `Terminal ${segment.origin}`;
  const destinationTerminal = `Terminal ${segment.destination}`;
  const originPoint = splitCityState(segment.origin);
  const destinationPoint = splitCityState(segment.destination);

  return {
    id: seed.cargoId,
    cargoId: seed.cargoId,
    cargoStatus: seed.cargoStatus,
    title: seed.title,
    corridorId: seed.corridorId,
    segmentId: segment.id,
    cargoType: seed.cargoType,
    priorityLevel: seed.priorityLevel,
    priority: seed.priorityLevel,
    operationalStatus,
    status: operationalStatus,
    riskLevel: seed.riskLevel,
    originTerminal,
    destinationTerminal,
    vesselName: seed.vesselName,
    route: {
      origin: {
        label: 'Origem',
        terminal: originTerminal,
        city: originPoint.city,
        state: originPoint.state,
        description: `Origem operacional confirmada em ${segment.origin}.`,
      },
      destination: {
        label: 'Destino',
        terminal: destinationTerminal,
        city: destinationPoint.city,
        state: destinationPoint.state,
        description: `Destino operacional previsto em ${segment.destination}.`,
      },
      currentDescription: seed.currentDescription,
      segmentLabel: segment.name,
    },
    vessel: {
      name: seed.vesselName,
      kind: seed.vesselKind,
      operator: seed.vesselOperator,
    },
    metrics: {
      progressPercent,
      remainingPercent,
      etaLabel: seed.eta,
      distanceKm: segment.distanceKm,
      signalPercent: seed.signalPercent,
      documentsReadyPercent: seed.documentsReadyPercent,
      estimatedCostBRL: seed.estimatedCost,
      co2SavingsPercent: seed.co2SavingsPercent,
    },
    progressPercent,
    remainingPercent,
    eta: seed.eta,
    signalPercent: seed.signalPercent,
    documentsReadyPercent: seed.documentsReadyPercent,
    estimatedCost: seed.estimatedCost,
    co2SavingsPercent: seed.co2SavingsPercent,
    constraints: (seed.constraints ?? []).map((constraint) => ({
      id: `${seed.cargoId}-${constraint.idSuffix}`,
      type: constraint.type,
      severity: constraint.severity,
      title: constraint.title,
      description: constraint.description,
    })),
    map: {
      primaryRiverLabel: corridorLabels.primary,
      secondaryRiverLabel: seed.mapSecondaryLabel ?? segment.name.toUpperCase(),
      placeLabels: seed.placeLabels ?? corridorLabels.places,
    },
  };
}

export const CARGO_WATERWAY_TRACKING_SCENARIOS: CargoWaterwayTrackingScenario[] =
  scenarioSeeds.map(makeScenario);

export const DEFAULT_CARGO_WATERWAY_TRACKING_SCENARIO =
  CARGO_WATERWAY_TRACKING_SCENARIOS[0];

export function getCargoWaterwayTrackingScenario(
  cargoId: string,
): CargoWaterwayTrackingScenario {
  return (
    CARGO_WATERWAY_TRACKING_SCENARIOS.find((scenario) => scenario.cargoId === cargoId) ??
    DEFAULT_CARGO_WATERWAY_TRACKING_SCENARIO
  );
}

export function getCargoWaterwayTrackingScenarioIds(): string[] {
  return CARGO_WATERWAY_TRACKING_SCENARIOS.map((scenario) => scenario.cargoId);
}

export function getCargoWaterwayTrackingScenariosByCargoStatus(
  cargoStatus: CargoLifecycleStatus,
): CargoWaterwayTrackingScenario[] {
  return CARGO_WATERWAY_TRACKING_SCENARIOS.filter(
    (scenario) => scenario.cargoStatus === cargoStatus,
  );
}
