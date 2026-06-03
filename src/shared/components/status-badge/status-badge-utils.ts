import type { StatusBadgeStatus } from './StatusBadge';

/** `data-status` usado pelo lab `/dev-v2` e seletores SCSS legados. */
export const STATUS_BADGE_DATA_ATTR: Record<StatusBadgeStatus, string> = {
  inTransit: 'transito',
  scheduled: 'agendado',
  quotation: 'cotacao',
  delayed: 'atencao',
  completed: 'concluida',
  blocked: 'bloqueado',
};

export const STATUS_BADGE_DEFAULT_LABEL: Record<StatusBadgeStatus, string> = {
  inTransit: 'Em trânsito',
  scheduled: 'Agendado',
  quotation: 'Em cotação',
  delayed: 'Atrasada',
  completed: 'Concluída',
  blocked: 'Bloqueado',
};
