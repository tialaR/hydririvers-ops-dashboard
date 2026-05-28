import type { CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import type { StatusBadgeTone } from '@/shared/design-system/components/status-badge';

export type MobileCargoListFilterId = 'all' | CargoStatus | 'attention';

export type MobileCargoListFilterChip = {
  id: MobileCargoListFilterId;
  labelKey: string;
};

export type MobileCargoListFilters = {
  chips: MobileCargoListFilterChip[];
};

export type MobileCargoListItem = {
  id: string;
  displayId: string;
  title: string;
  origin: string;
  destination: string;
  status: CargoStatus;
  statusBadgeTone: StatusBadgeTone;
  etaLabel: string;
  operationLabel?: string;
  alertLabel?: string;
  needsAttention: boolean;
};

export type MobileCargoListViewModel = {
  items: MobileCargoListItem[];
  filters: MobileCargoListFilters;
  totalCount: number;
};
