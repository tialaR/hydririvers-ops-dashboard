import { isMapEligibleCargoId } from '@/features/cargo/constants/public-marketplace-cargos';
import { findPublicMarketplaceCargo } from '@/features/cargo/data/resolve-public-marketplace-cargo-list';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';

import { WATERWAY_CORRIDORS } from './data/waterway-corridors.mock';

export type WaterwayCompatConstraintSeverity = 'info' | 'warning' | 'critical';

export type WaterwayCompatConstraint = {
  type: string;
  severity: WaterwayCompatConstraintSeverity;
  title: string;
  description: string;
};

export type CargoWaterwayTrackingCompat = {
  cargoId: string;
  corridorId: string;
  segmentId: string;
  vesselName: string;
  originTerminal: string;
  destinationTerminal: string;
  progressPercent: number;
  remainingPercent: number;
  eta: string;
  signalPercent: number;
  operationalStatus: 'on-time' | 'attention' | 'delayed';
  constraints: WaterwayCompatConstraint[];
  documentsReadyPercent: number;
  estimatedCost: number;
  co2SavingsPercent: number;
  priorityLevel: 'standard' | 'priority' | 'critical';
};

export type CargoWaterwayTracking = CargoWaterwayTrackingCompat;

type CargoWaterwayProfile = {
  cargoId: string;
  corridorId: string;
  segmentId: string;
  vesselName: string;
  originTerminal: string;
  destinationTerminal: string;
  progressPercent: number;
  eta: string;
  signalPercent: number;
  operationalStatus: CargoWaterwayTrackingCompat['operationalStatus'];
  severity: WaterwayCompatConstraintSeverity;
  title: string;
  description: string;
  documentsReadyPercent: number;
  estimatedCost: number;
  co2SavingsPercent: number;
  priorityLevel: CargoWaterwayTrackingCompat['priorityLevel'];
};

export const waterwayCorridorsMock = WATERWAY_CORRIDORS.map((corridor) => ({
  id: corridor.id,
  name: corridor.name,
}));

const profiles: CargoWaterwayProfile[] = [
  {
    cargoId: 'CARGO-001',
    corridorId: 'corridor-amazonas',
    segmentId: 'segment-manaus-santarem',
    vesselName: 'Comboio Aruana I',
    originTerminal: 'Terminal Manaus Norte',
    destinationTerminal: 'Terminal Santarem Oeste',
    progressPercent: 76,
    eta: '18h 40min',
    signalPercent: 92,
    operationalStatus: 'on-time',
    severity: 'info',
    title: 'Operacao dentro do previsto',
    description: 'Rota sem gargalos relevantes no trecho monitorado.',
    documentsReadyPercent: 100,
    estimatedCost: 184000,
    co2SavingsPercent: 32,
    priorityLevel: 'standard',
  },
  {
    cargoId: 'CARGO-002',
    corridorId: 'corridor-madeira',
    segmentId: 'segment-porto-velho-itacoatiara',
    vesselName: 'Empurrador Madeira Azul',
    originTerminal: 'Terminal Porto Velho Graneleiro',
    destinationTerminal: 'Terminal Itacoatiara Sul',
    progressPercent: 48,
    eta: '1d 06h',
    signalPercent: 78,
    operationalStatus: 'attention',
    severity: 'warning',
    title: 'Calado em observacao',
    description: 'A equipe deve acompanhar variacao de nivel em trecho intermediario.',
    documentsReadyPercent: 86,
    estimatedCost: 236000,
    co2SavingsPercent: 28,
    priorityLevel: 'priority',
  },
  {
    cargoId: 'CARGO-003',
    corridorId: 'corridor-tapajos',
    segmentId: 'segment-miritituba-santarem',
    vesselName: 'Balsa Tapajos 12',
    originTerminal: 'Terminal Miritituba',
    destinationTerminal: 'Terminal Santarem Oeste',
    progressPercent: 18,
    eta: '2d 03h',
    signalPercent: 64,
    operationalStatus: 'attention',
    severity: 'warning',
    title: 'Janela de porto apertada',
    description: 'A chegada deve coincidir com slot operacional reservado.',
    documentsReadyPercent: 72,
    estimatedCost: 142000,
    co2SavingsPercent: 35,
    priorityLevel: 'priority',
  },
  {
    cargoId: 'CARGO-004',
    corridorId: 'corridor-tocantins',
    segmentId: 'segment-maraba-vila-conde',
    vesselName: 'Comboio Tocantins Bravo',
    originTerminal: 'Terminal Maraba',
    destinationTerminal: 'Terminal Vila do Conde',
    progressPercent: 34,
    eta: '3d 08h',
    signalPercent: 51,
    operationalStatus: 'delayed',
    severity: 'critical',
    title: 'Restricao por dragagem',
    description: 'Trecho com operacao condicionada a liberacao do canal.',
    documentsReadyPercent: 91,
    estimatedCost: 318000,
    co2SavingsPercent: 24,
    priorityLevel: 'critical',
  },
  {
    cargoId: 'CARGO-005',
    corridorId: 'corridor-barra-norte',
    segmentId: 'segment-barra-norte-belem',
    vesselName: 'Navio Rio Norte',
    originTerminal: 'Fundeadouro Barra Norte',
    destinationTerminal: 'Terminal Belem',
    progressPercent: 59,
    eta: '22h 15min',
    signalPercent: 69,
    operationalStatus: 'attention',
    severity: 'warning',
    title: 'Sinal parcial no trecho',
    description: 'Monitoramento deve usar redundancia de comunicacao em pontos criticos.',
    documentsReadyPercent: 96,
    estimatedCost: 274000,
    co2SavingsPercent: 31,
    priorityLevel: 'standard',
  },
  {
    cargoId: 'CARGO-006',
    corridorId: 'corridor-amazonas',
    segmentId: 'segment-manaus-santarem',
    vesselName: 'Comboio Solimoes II',
    originTerminal: 'Terminal Itacoatiara Sul',
    destinationTerminal: 'Terminal Vila do Conde',
    progressPercent: 32,
    eta: '4d 05h',
    signalPercent: 88,
    operationalStatus: 'on-time',
    severity: 'info',
    title: 'Documentacao liberada',
    description: 'Todos os documentos criticos estao prontos para operacao.',
    documentsReadyPercent: 100,
    estimatedCost: 196000,
    co2SavingsPercent: 34,
    priorityLevel: 'standard',
  },
  {
    cargoId: 'CARGO-007',
    corridorId: 'corridor-amazonas',
    segmentId: 'segment-manaus-santarem',
    vesselName: 'Solimões Care',
    originTerminal: 'Terminal Parintins',
    destinationTerminal: 'Terminal Tabatinga',
    progressPercent: 55,
    eta: '7d 02h',
    signalPercent: 41,
    operationalStatus: 'attention',
    severity: 'warning',
    title: 'Cadeia fria essencial',
    description: 'Abastecimento territorial com sincronizacao tardia em trechos de baixa cobertura.',
    documentsReadyPercent: 69,
    estimatedCost: 315000,
    co2SavingsPercent: 66,
    priorityLevel: 'critical',
  },
  {
    cargoId: 'CARGO-009',
    corridorId: 'corridor-barra-norte',
    segmentId: 'segment-barra-norte-belem',
    vesselName: 'Cabotagem Norte 01',
    originTerminal: 'Terminal Vila do Conde',
    destinationTerminal: 'Terminal Belém',
    progressPercent: 12,
    eta: '5d 18h',
    signalPercent: 94,
    operationalStatus: 'on-time',
    severity: 'info',
    title: 'Janela portuaria monitorada',
    description: 'Conexao de cabotagem com manifesto e booking em validacao.',
    documentsReadyPercent: 92,
    estimatedCost: 428000,
    co2SavingsPercent: 52,
    priorityLevel: 'priority',
  },
  {
    cargoId: 'HYD-2026-00020',
    corridorId: 'corridor-barra-norte',
    segmentId: 'segment-amazonas-belem-abaetetuba',
    vesselName: 'Cabotagem Norte 01',
    originTerminal: 'Terminal Abaetetuba',
    destinationTerminal: 'Terminal Vila do Conde',
    progressPercent: 25,
    eta: '30–42h',
    signalPercent: 88,
    operationalStatus: 'on-time',
    severity: 'info',
    title: 'Consolidacao curto curso em cotacao',
    description: 'Trecho Abaetetuba→Vila do Conde com ETA 30–42h e progresso 25% no mock operacional.',
    documentsReadyPercent: 78,
    estimatedCost: 242400,
    co2SavingsPercent: 52,
    priorityLevel: 'priority',
  },
];

const VESSEL_NAMES = [
  'Comboio Rio Negro',
  'Frio Tapajós',
  'Tapajós Express',
  'Marajó Link',
  'Cabotagem Norte 01',
  'Comboio Solimoes II',
] as const;

const SEGMENT_IDS = [
  'segment-manaus-santarem',
  'segment-porto-velho-itacoatiara',
  'segment-miritituba-santarem',
  'segment-maraba-vila-conde',
  'segment-barra-norte-belem',
] as const;

function stableIndex(source: string, modulo: number): number {
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % modulo;
}

function derivePublicCargoTracking(cargoId: string): CargoWaterwayTrackingCompat | undefined {
  if (!isMapEligibleCargoId(cargoId)) {
    return undefined;
  }

  const cargo = findPublicMarketplaceCargo(cargoId);
  const progressPercent =
    cargo?.status === 'reserved'
      ? 52
      : cargo?.status === 'bidding'
        ? 28
        : cargo?.status === 'contracting'
          ? 36
          : 15;
  const vesselName = VESSEL_NAMES[stableIndex(cargoId, VESSEL_NAMES.length)];
  const segmentId = SEGMENT_IDS[stableIndex(`${cargoId}-segment`, SEGMENT_IDS.length)];

  return {
    cargoId,
    corridorId: 'corridor-amazonas',
    segmentId,
    vesselName,
    originTerminal: cargo?.origin ?? 'Terminal origem',
    destinationTerminal: cargo?.destination ?? 'Terminal destino',
    progressPercent,
    remainingPercent: Math.max(0, 100 - progressPercent),
    eta: progressPercent > 50 ? '2d 08h' : '4d 12h',
    signalPercent: 55 + stableIndex(`${cargoId}-signal`, 40),
    operationalStatus: progressPercent > 50 ? 'attention' : 'on-time',
    constraints: [
      {
        type: 'traffic',
        severity: 'info',
        title: 'Rota publica mock',
        description: 'Perfil operacional sintetizado para carga publica do marketplace.',
      },
    ],
    documentsReadyPercent: 60 + stableIndex(`${cargoId}-docs`, 35),
    estimatedCost: 150000 + stableIndex(`${cargoId}-cost`, 200000),
    co2SavingsPercent: 30 + stableIndex(`${cargoId}-co2`, 30),
    priorityLevel: 'standard',
  };
}

export const cargoWaterwayTrackingMock: CargoWaterwayTrackingCompat[] = profiles.map((profile) => ({
  cargoId: profile.cargoId,
  corridorId: profile.corridorId,
  segmentId: profile.segmentId,
  vesselName: profile.vesselName,
  originTerminal: profile.originTerminal,
  destinationTerminal: profile.destinationTerminal,
  progressPercent: profile.progressPercent,
  remainingPercent: Math.max(0, 100 - profile.progressPercent),
  eta: profile.eta,
  signalPercent: profile.signalPercent,
  operationalStatus: profile.operationalStatus,
  constraints: [
    {
      type: profile.severity === 'critical' ? 'dredging' : 'traffic',
      severity: profile.severity,
      title: profile.title,
      description: profile.description,
    },
  ],
  documentsReadyPercent: profile.documentsReadyPercent,
  estimatedCost: profile.estimatedCost,
  co2SavingsPercent: profile.co2SavingsPercent,
  priorityLevel: profile.priorityLevel,
}));

export const cargoWaterwayTrackingByCargoId: Map<string, CargoWaterwayTrackingCompat> = new Map(
  cargoWaterwayTrackingMock.map((tracking) => [tracking.cargoId, tracking]),
);

/** Lookup estável para ids `cargo-00N` e `CARGO-00N`. */
export function getCargoWaterwayTracking(
  cargoId: string,
): CargoWaterwayTrackingCompat | undefined {
  const normalized = normalizeCargoId(cargoId);
  return (
    cargoWaterwayTrackingByCargoId.get(normalized) ?? derivePublicCargoTracking(normalized)
  );
}

export function getPrimaryWaterwayConstraint(
  tracking: CargoWaterwayTrackingCompat | undefined,
): WaterwayCompatConstraint | undefined {
  if (!tracking?.constraints.length) {
    return undefined;
  }

  return (
    tracking.constraints.find((constraint) => constraint.severity === 'critical') ??
    tracking.constraints.find((constraint) => constraint.severity === 'warning') ??
    tracking.constraints[0]
  );
}

export function getWaterwayOperationalLabel(
  status: CargoWaterwayTrackingCompat['operationalStatus'],
): string {
  const labels: Record<CargoWaterwayTrackingCompat['operationalStatus'], string> = {
    'on-time': 'Dentro do prazo',
    attention: 'Atencao operacional',
    delayed: 'Atrasada',
  };

  return labels[status];
}
