import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';

export type CargoCardVisualStatus = 'gray' | 'orange' | 'red' | 'purple' | 'cyan' | 'dark';

export type CargoCardStatusMatrixRow = {
  sourceStatus: string;
  visualStatus: CargoCardVisualStatus;
  reason: string;
};

export const CARGO_CARD_VISUAL_STATUSES: CargoCardVisualStatus[] = [
  'gray',
  'orange',
  'red',
  'purple',
  'cyan',
  'dark',
];

export const CARGO_CARD_STATUS_MATRIX: CargoCardStatusMatrixRow[] = [
  { sourceStatus: 'open', visualStatus: 'gray', reason: 'open cargo without stronger operational signal' },
  { sourceStatus: 'scheduled', visualStatus: 'gray', reason: 'scheduled or waiting state' },
  { sourceStatus: 'waiting', visualStatus: 'gray', reason: 'waiting state' },
  { sourceStatus: 'draft', visualStatus: 'gray', reason: 'draft/inactive state' },
  { sourceStatus: 'inTransit', visualStatus: 'orange', reason: 'active movement / normal operation' },
  { sourceStatus: 'in_transit', visualStatus: 'orange', reason: 'normalized active movement' },
  { sourceStatus: 'transit', visualStatus: 'orange', reason: 'active movement' },
  { sourceStatus: 'attention', visualStatus: 'orange', reason: 'attention without high/critical risk' },
  { sourceStatus: 'blocked', visualStatus: 'red', reason: 'blocked cargo or corridor' },
  { sourceStatus: 'delayed', visualStatus: 'red', reason: 'delay signal' },
  { sourceStatus: 'critical', visualStatus: 'red', reason: 'critical risk signal' },
  { sourceStatus: 'risk', visualStatus: 'red', reason: 'risk-led state when no finer status exists' },
  { sourceStatus: 'pending', visualStatus: 'purple', reason: 'pending action' },
  { sourceStatus: 'documents', visualStatus: 'purple', reason: 'documents pending' },
  { sourceStatus: 'negotiation', visualStatus: 'purple', reason: 'negotiation/action needed' },
  { sourceStatus: 'proposal', visualStatus: 'purple', reason: 'proposal/action state' },
  { sourceStatus: 'stable', visualStatus: 'cyan', reason: 'stable/tracked signal' },
  { sourceStatus: 'tracked', visualStatus: 'cyan', reason: 'tracked signal' },
  { sourceStatus: 'fresh', visualStatus: 'cyan', reason: 'fresh telemetry signal' },
  { sourceStatus: 'active', visualStatus: 'cyan', reason: 'active stable state' },
  { sourceStatus: 'delivered', visualStatus: 'dark', reason: 'delivered cargo' },
  { sourceStatus: 'completed', visualStatus: 'dark', reason: 'completed cargo' },
  { sourceStatus: 'closed', visualStatus: 'dark', reason: 'closed cargo' },
  { sourceStatus: 'fallback', visualStatus: 'gray', reason: 'safe default' },
];

const STATUS_VISUAL_MAP = CARGO_CARD_STATUS_MATRIX.reduce<Record<string, CargoCardVisualStatus>>(
  (accumulator, row) => {
    accumulator[normalize(row.sourceStatus)] = row.visualStatus;
    return accumulator;
  },
  {},
);

function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function readNormalized(record: Record<string, unknown>, key: string): string {
  return normalize(record[key]);
}

function readNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key] ?? 0);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  return 0;
}

export function mapCargoCardVisualStatus(cargo: OwnedCargo): CargoCardVisualStatus {
  const record = cargo as unknown as Record<string, unknown>;
  const visualStatus = readNormalized(record, 'visualStatus');
  const status = readNormalized(record, 'status');
  const riskLevel = readNormalized(record, 'riskLevel');
  const freshnessState = readNormalized(record, 'freshnessState');
  const pendingDocsCount = readNumber(record, [
    'pendingDocsCount',
    'documentsPendingCount',
    'documentPendencyCount',
    'requiredDocumentsCount',
  ]);
  const offersCount = readNumber(record, ['offersCount', 'proposalsCount', 'bidsCount']);

  if (CARGO_CARD_VISUAL_STATUSES.includes(visualStatus as CargoCardVisualStatus)) {
    return visualStatus as CargoCardVisualStatus;
  }

  if (['blocked', 'delayed', 'critical', 'risk', 'high_risk'].includes(status)) {
    return 'red';
  }

  if (['attention'].includes(status) && ['high', 'critical', 'blocked'].includes(riskLevel)) {
    return 'red';
  }

  if (['documents', 'document', 'docs', 'pending_documents'].includes(status) || pendingDocsCount > 0) {
    return 'purple';
  }

  if (['negotiation', 'negotiating', 'proposal', 'proposals'].includes(status) || offersCount > 0) {
    return 'purple';
  }

  if (['in_transit', 'intransit', 'transit', 'underway'].includes(status) && ['fresh', 'stable', 'tracked'].includes(freshnessState)) {
    return 'cyan';
  }

  return STATUS_VISUAL_MAP[status] ?? 'gray';
}
