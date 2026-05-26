import type { CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import { findPublicMarketplaceCargo } from '@/features/cargo/data/resolve-public-marketplace-cargo-list';
import { isMapEligibleCargoId } from '@/features/cargo/constants/public-marketplace-cargos';
import { normalizeCargoId } from '@/shared/routing/normalize-cargo-id';

import { resolveHydrowayLocation } from '../adapters/location-resolver';
import type {
  CargoWaterwayOperationalContext,
  HydrowayCheckpoint,
  HydrowayCargoOperationalStatus,
  HydrowayLngLat,
} from '../domain/hydroway-operational-domain.types';
import {
  HYDROWAY_OPERATIONAL_CORRIDOR_IDS,
} from '../mocks/hydroway-operational-layers.mock';

const MOCK_POSITION_UPDATED_AT = '2026-05-23T14:30:00.000Z';

type OperationalProfileSeed = {
  corridorId: string;
  activeSegmentId: string;
  originTerminalId: string;
  destinationTerminalId: string;
  nextTerminalId?: string;
  activeAlertIds: string[];
  progress01: number;
  operationalStatus: HydrowayCargoOperationalStatus;
  eta: string;
  businessSummary: string;
  captainSummary: string;
};

const EXPLICIT_PUBLIC_PROFILES: Record<string, OperationalProfileSeed> = {
  'CARGO-006': {
    corridorId: HYDROWAY_OPERATIONAL_CORRIDOR_IDS.amazonasSolimoes,
    activeSegmentId: 'segment-amazonas-santarem-itacoatiara',
    originTerminalId: 'terminal-itacoatiara',
    destinationTerminalId: 'terminal-vila-conde',
    nextTerminalId: 'terminal-vila-conde',
    activeAlertIds: [],
    progress01: 0.32,
    operationalStatus: 'on-time',
    eta: '4d 05h',
    businessSummary:
      'Bioeconomia Itacoatiara→Vila do Conde: consolidação regional com ETA estável no corredor Amazonas.',
    captainSummary: 'Manter ritmo de comboio; confirmar calado antes de Vila do Conde.',
  },
  'CARGO-007': {
    corridorId: HYDROWAY_OPERATIONAL_CORRIDOR_IDS.amazonasSolimoes,
    activeSegmentId: 'segment-amazonas-santarem-itacoatiara',
    originTerminalId: 'terminal-manaus',
    destinationTerminalId: 'terminal-manaus',
    nextTerminalId: 'terminal-itacoatiara',
    activeAlertIds: ['alert-traffic-estuario'],
    progress01: 0.55,
    operationalStatus: 'attention',
    eta: '7d 02h',
    businessSummary:
      'Medicamentos Parintins→Tabatinga: prioridade territorial com sinal irregular no Solimões.',
    captainSummary: 'Refrigerado essencial — usar redundância de comunicação nos trechos de baixa cobertura.',
  },
  'CARGO-009': {
    corridorId: HYDROWAY_OPERATIONAL_CORRIDOR_IDS.barraNorte,
    activeSegmentId: 'segment-tocantins-vila-conde-belem',
    originTerminalId: 'terminal-vila-conde',
    destinationTerminalId: 'terminal-belem',
    nextTerminalId: 'terminal-belem',
    activeAlertIds: ['alert-port-window-vila-conde'],
    progress01: 0.12,
    operationalStatus: 'on-time',
    eta: '5d 18h',
    businessSummary:
      'Cabotagem Vila do Conde→Suape: conexão portuária com janela de terminal monitorada no estuário.',
    captainSummary: 'Confirmar booking portuário e manifesto antes de saída do complexo de Vila do Conde.',
  },
  'HYD-2026-00020': {
    corridorId: HYDROWAY_OPERATIONAL_CORRIDOR_IDS.barraNorte,
    activeSegmentId: 'segment-amazonas-belem-abaetetuba',
    originTerminalId: 'terminal-abaetetuba',
    destinationTerminalId: 'terminal-vila-conde',
    nextTerminalId: 'terminal-vila-conde',
    activeAlertIds: [],
    progress01: 0.25,
    operationalStatus: 'on-time',
    eta: '30–42h',
    businessSummary:
      'Contêineres de cabotagem Abaetetuba→Vila do Conde: consolidação de curto curso em cotação com 25% de progresso.',
    captainSummary:
      'Manter consolidação no estuário do Pará; confirmar calado e janela de atracação em Vila do Conde.',
  },
};

const SEGMENT_POOL = [
  'segment-amazonas-belem-abaetetuba',
  'segment-amazonas-abaetetuba-santarem',
  'segment-amazonas-santarem-itacoatiara',
  'segment-tocantins-maraba-vila-conde',
  'segment-tocantins-vila-conde-belem',
] as const;

const TERMINAL_POOL = [
  'terminal-belem',
  'terminal-santarem',
  'terminal-manaus',
  'terminal-itacoatiara',
  'terminal-vila-conde',
  'terminal-maraba',
  'terminal-porto-velho',
  'terminal-macapa-santana',
  'terminal-abaetetuba',
] as const;

function stableIndex(source: string, modulo: number): number {
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % modulo;
}

function progress01FromStatus(status: CargoStatus): number {
  switch (status) {
    case 'open':
      return 0.12;
    case 'bidding':
      return 0.28;
    case 'contracting':
      return 0.36;
    case 'reserved':
      return 0.52;
    case 'boarded':
      return 0.68;
    case 'delivered':
      return 1;
    default:
      return 0.25;
  }
}

function operationalStatusFromProgress(progress01: number): HydrowayCargoOperationalStatus {
  if (progress01 >= 0.85) {
    return 'delayed';
  }
  if (progress01 >= 0.45) {
    return 'attention';
  }
  return 'on-time';
}

function deriveProfileFromCargo(cargoId: string): OperationalProfileSeed {
  const cargo = findPublicMarketplaceCargo(cargoId);
  const status = cargo?.status ?? 'open';
  const progress01 = progress01FromStatus(status);
  const segmentId = SEGMENT_POOL[stableIndex(cargoId, SEGMENT_POOL.length)];
  const originTerminalId = TERMINAL_POOL[stableIndex(`${cargoId}-origin`, TERMINAL_POOL.length)];
  let destinationTerminalId = TERMINAL_POOL[stableIndex(`${cargoId}-destination`, TERMINAL_POOL.length)];
  if (destinationTerminalId === originTerminalId) {
    destinationTerminalId =
      TERMINAL_POOL[(stableIndex(`${cargoId}-destination`, TERMINAL_POOL.length) + 1) % TERMINAL_POOL.length];
  }

  const corridorId =
    segmentId.includes('tocantins') || segmentId.includes('barra')
      ? HYDROWAY_OPERATIONAL_CORRIDOR_IDS.tocantinsAraguaia
      : HYDROWAY_OPERATIONAL_CORRIDOR_IDS.amazonasSolimoes;

  return {
    corridorId,
    activeSegmentId: segmentId,
    originTerminalId,
    destinationTerminalId,
    nextTerminalId: destinationTerminalId,
    activeAlertIds: [],
    progress01,
    operationalStatus: operationalStatusFromProgress(progress01),
    eta: progress01 > 0.6 ? '1d 14h' : progress01 > 0.3 ? '3d 06h' : '5d 10h',
    businessSummary: cargo?.title
      ? `${cargo.title}: rota mock ${cargo.origin}→${cargo.destination} com monitoramento operacional.`
      : `Carga pública ${cargoId}: monitoramento operacional mock no corredor amazônico.`,
    captainSummary: 'Seguir recomendação de velocidade do trecho ativo e confirmar calado local.',
  };
}

function resolveProfileSeed(cargoId: string): OperationalProfileSeed | null {
  const normalized = normalizeCargoId(cargoId);
  if (!isMapEligibleCargoId(normalized)) {
    return null;
  }
  return EXPLICIT_PUBLIC_PROFILES[normalized] ?? deriveProfileFromCargo(normalized);
}

function midpoint(
  origin: HydrowayLngLat,
  destination: HydrowayLngLat,
  progress01: number,
): HydrowayLngLat {
  const ratio = Math.max(0, Math.min(1, progress01));
  return [
    Math.round((origin[0] + (destination[0] - origin[0]) * ratio) * 1e5) / 1e5,
    Math.round((origin[1] + (destination[1] - origin[1]) * ratio) * 1e5) / 1e5,
  ];
}

/** Contexto operacional mínimo para cargas públicas sem entrada explícita no dataset mock. */
export function synthesizePublicCargoOperationalContext(
  cargoId: string,
): CargoWaterwayOperationalContext | null {
  const normalized = normalizeCargoId(cargoId);
  const profile = resolveProfileSeed(normalized);
  if (!profile) {
    return null;
  }

  const cargo = findPublicMarketplaceCargo(normalized);
  const origin = resolveHydrowayLocation(cargo?.origin ?? 'Belém, PA');
  const destination = resolveHydrowayLocation(cargo?.destination ?? 'Santarém, PA');
  const originLngLat: HydrowayLngLat = [origin.coordinates[0], origin.coordinates[1]];
  const destinationLngLat: HydrowayLngLat = [
    destination.coordinates[0],
    destination.coordinates[1],
  ];

  return {
    cargoId: normalized,
    corridorId: profile.corridorId,
    activeSegmentId: profile.activeSegmentId,
    originTerminalId: profile.originTerminalId,
    destinationTerminalId: profile.destinationTerminalId,
    currentPosition: {
      coordinates: midpoint(originLngLat, destinationLngLat, profile.progress01),
      updatedAt: MOCK_POSITION_UPDATED_AT,
      confidence: 'medium',
    },
    eta: profile.eta,
    progress01: profile.progress01,
    operationalStatus: profile.operationalStatus,
    activeAlertIds: profile.activeAlertIds,
    nextTerminalId: profile.nextTerminalId,
    nextCheckpointId: `checkpoint-${normalized.toLowerCase()}-next-terminal`,
    recommendedLayerMode: profile.activeAlertIds.length > 0 ? 'navigation' : 'operation',
    businessSummary: profile.businessSummary,
    captainSummary: profile.captainSummary,
  };
}

/** Checkpoints mínimos quando o dataset estático não define pontos para a carga. */
export function buildSyntheticOperationalCheckpoints(
  context: CargoWaterwayOperationalContext,
): HydrowayCheckpoint[] {
  const cargoKey = context.cargoId.toLowerCase();
  const [currentLng, currentLat] = context.currentPosition.coordinates;

  return [
    {
      id: `checkpoint-${cargoKey}-origin`,
      name: 'Origem',
      type: 'origin',
      coordinates: [
        Math.round((currentLng - 0.35) * 1e5) / 1e5,
        Math.round((currentLat + 0.08) * 1e5) / 1e5,
      ],
      cargoId: context.cargoId,
      terminalId: context.originTerminalId,
      status: 'completed',
      label: 'Embarque',
      shortMessage: 'Origem confirmada no mock operacional.',
    },
    {
      id: `checkpoint-${cargoKey}-current`,
      name: 'Posição atual',
      type: 'current-cargo',
      coordinates: [currentLng, currentLat],
      cargoId: context.cargoId,
      status: 'current',
      label: 'Em trânsito',
      shortMessage: `${Math.round(context.progress01 * 100)}% da rota mock.`,
    },
    {
      id: `checkpoint-${cargoKey}-next-terminal`,
      name: 'Próximo terminal',
      type: 'next-terminal',
      coordinates: [
        Math.round((currentLng + 0.22) * 1e5) / 1e5,
        Math.round((currentLat - 0.05) * 1e5) / 1e5,
      ],
      cargoId: context.cargoId,
      terminalId: context.nextTerminalId ?? context.destinationTerminalId,
      status: 'upcoming',
      label: 'Próximo ponto',
      shortMessage: context.businessSummary,
    },
    {
      id: `checkpoint-${cargoKey}-destination`,
      name: 'Destino',
      type: 'destination',
      coordinates: [
        Math.round((currentLng + 0.45) * 1e5) / 1e5,
        Math.round((currentLat - 0.12) * 1e5) / 1e5,
      ],
      cargoId: context.cargoId,
      terminalId: context.destinationTerminalId,
      status: 'upcoming',
      label: 'Destino final',
      shortMessage: `ETA ${context.eta}`,
    },
  ];
}
