import { StatusBadge } from '@/shared/components/status-badge';

import { mapCargoLabV2StatusToBadgeStatus } from '@/features/cargo/components/cargo-lab-v2/cargo-lab-v2-status';
import type { CargoLabV2 } from '@/features/cargo/types/cargo-lab-v2.types';

import styles from './cargo-lab-v2-status-badge.module.scss';

type CargoLabV2StatusBadgeProps = {
  cargo: CargoLabV2;
  showDot?: boolean;
  size?: 'sm' | 'md';
  variant?: 'card' | 'sheet';
};

export function CargoLabV2StatusBadge({
  cargo,
  showDot = true,
  size = 'md',
  variant = 'card',
}: CargoLabV2StatusBadgeProps) {
  return (
    <StatusBadge
      className={variant === 'sheet' ? styles.sheetBadge : styles.cardBadge}
      status={mapCargoLabV2StatusToBadgeStatus(cargo.status)}
      showDot={showDot}
      size={size}
    >
      {cargo.statusLabel}
    </StatusBadge>
  );
}
