import type { StatusBadgeStatus } from '@/shared/components/status-badge';

import type { CargoLabV2Status } from '@/features/cargo/types/cargo-lab-v2.types';

export function mapCargoLabV2StatusToBadgeStatus(status: CargoLabV2Status): StatusBadgeStatus {
  if (status === 'agendado') return 'scheduled';
  if (status === 'cotacao') return 'quotation';
  if (status === 'atencao') return 'delayed';
  return 'inTransit';
}
