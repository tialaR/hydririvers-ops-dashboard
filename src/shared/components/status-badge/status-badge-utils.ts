import {
  CARGO_STATUS_SEMANTIC_MAP,
  type CargoStatusSemanticTone,
} from '@/features/cargo/utils/cargo-status-semantic';

import type { StatusBadgeStatus } from './StatusBadge';

/** `data-status` usado pelo lab `/dev-v2` e seletores SCSS legados. */
export const STATUS_BADGE_DATA_ATTR: Record<StatusBadgeStatus, string> = {
  open: CARGO_STATUS_SEMANTIC_MAP.open.dataStatus,
  quotation: CARGO_STATUS_SEMANTIC_MAP.quotation.dataStatus,
  contracting: CARGO_STATUS_SEMANTIC_MAP.contracting.dataStatus,
  operating: CARGO_STATUS_SEMANTIC_MAP.operating.dataStatus,
  inTransit: CARGO_STATUS_SEMANTIC_MAP.inTransit.dataStatus,
  completed: CARGO_STATUS_SEMANTIC_MAP.completed.dataStatus,
  delayed: CARGO_STATUS_SEMANTIC_MAP.delayed.dataStatus,
  blocked: CARGO_STATUS_SEMANTIC_MAP.blocked.dataStatus,
  unknown: CARGO_STATUS_SEMANTIC_MAP.unknown.dataStatus,
};

export const STATUS_BADGE_TONE: Record<StatusBadgeStatus, CargoStatusSemanticTone> = {
  open: 'open',
  quotation: 'quotation',
  contracting: 'contracting',
  operating: 'operating',
  inTransit: 'inTransit',
  completed: 'completed',
  delayed: 'delayed',
  blocked: 'blocked',
  unknown: 'unknown',
};

export const STATUS_BADGE_DEFAULT_LABEL: Record<StatusBadgeStatus, string> = {
  open: 'Aberta',
  quotation: 'Em cotação',
  contracting: 'Contratando',
  operating: 'Em operação',
  inTransit: 'Em trânsito',
  completed: 'Concluída',
  delayed: 'Atrasada',
  blocked: 'Bloqueada',
  unknown: 'Status',
};
