import type { CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import type { StatusBadgeStatus } from '@/shared/components/status-badge';

import type { CargoLabV2Status } from '../types/cargo-lab-v2.types';

export type CargoStatusSemanticTone = StatusBadgeStatus;

export type CargoStatusSemanticTokens = {
  tone: CargoStatusSemanticTone;
  dataStatus: string;
  bgToken: string;
  textToken: string;
  borderToken: string;
  dotToken: string;
};

const TOKEN_PREFIX = '--hy-color-status';

function statusTokens(
  tokenSlug: string,
  tone: CargoStatusSemanticTone,
  dataStatus: string,
): CargoStatusSemanticTokens {
  return {
    tone,
    dataStatus,
    bgToken: `${TOKEN_PREFIX}-${tokenSlug}-bg`,
    textToken: `${TOKEN_PREFIX}-${tokenSlug}-text`,
    borderToken: `${TOKEN_PREFIX}-${tokenSlug}-border`,
    dotToken: `${TOKEN_PREFIX}-${tokenSlug}-text`,
  };
}

/** Mapa semântico DS v2 — tone, data-status e tokens de cor por estado logístico. */
export const CARGO_STATUS_SEMANTIC_MAP: Record<CargoStatusSemanticTone, CargoStatusSemanticTokens> = {
  open: statusTokens('open', 'open', 'aberta'),
  quotation: statusTokens('quotation', 'quotation', 'cotacao'),
  contracting: statusTokens('contracting', 'contracting', 'contratando'),
  operating: statusTokens('operating', 'operating', 'operacao'),
  inTransit: statusTokens('in-transit', 'inTransit', 'transito'),
  completed: statusTokens('completed', 'completed', 'concluida'),
  delayed: statusTokens('delayed', 'delayed', 'atencao'),
  blocked: statusTokens('blocked', 'blocked', 'bloqueado'),
  unknown: {
    tone: 'unknown',
    dataStatus: 'desconhecido',
    bgToken: '--hy-color-surface-muted',
    textToken: '--hy-color-text-secondary',
    borderToken: '--hy-color-border-subtle',
    dotToken: '--hy-color-text-secondary',
  },
};

export function mapCargoStatusToLabV2Status(status: CargoStatus): CargoLabV2Status {
  if (status === 'open') return 'aberta';
  if (status === 'bidding') return 'cotacao';
  if (status === 'contracting') return 'contratando';
  if (status === 'reserved') return 'operacao';
  if (status === 'boarded') return 'transito';
  if (status === 'delivered') return 'concluida';
  return 'transito';
}

export function mapCargoLabV2StatusToBadgeStatus(status: CargoLabV2Status): StatusBadgeStatus {
  if (status === 'aberta') return 'open';
  if (status === 'cotacao') return 'quotation';
  if (status === 'contratando') return 'contracting';
  if (status === 'operacao' || status === 'agendado') return 'operating';
  if (status === 'transito') return 'inTransit';
  if (status === 'concluida') return 'completed';
  if (status === 'atrasada' || status === 'atencao') return 'delayed';
  if (status === 'bloqueada') return 'blocked';
  return 'unknown';
}

export function mapCargoStatusToBadgeStatus(status: CargoStatus): StatusBadgeStatus {
  return mapCargoLabV2StatusToBadgeStatus(mapCargoStatusToLabV2Status(status));
}
