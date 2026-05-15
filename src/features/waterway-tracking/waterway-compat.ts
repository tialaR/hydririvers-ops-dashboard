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
    originTerminal: 'Terminal Manaus Norte',
    destinationTerminal: 'Terminal Santarem Oeste',
    progressPercent: 8,
    eta: '3d 17h',
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
];

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
