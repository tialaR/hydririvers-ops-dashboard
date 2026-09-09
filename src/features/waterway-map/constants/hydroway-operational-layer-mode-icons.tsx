import {
  AlertTriangle,
  Compass,
  Landmark,
  Radar,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import type { HydrowayOperationalLayerMode } from '../domain/hydroway-operational-domain.types';

export const HYDROWAY_OPERATIONAL_LAYER_MODE_ICON_SIZE = 16;

const MODE_ICON_BY_ID: Record<HydrowayOperationalLayerMode, LucideIcon> = {
  operation: Radar,
  navigation: Compass,
  logistics: Warehouse,
  risk: AlertTriangle,
  government: Landmark,
};

export function renderHydrowayOperationalLayerModeIcon(
  mode: HydrowayOperationalLayerMode,
  size = HYDROWAY_OPERATIONAL_LAYER_MODE_ICON_SIZE,
): ReactNode {
  const Icon = MODE_ICON_BY_ID[mode];
  return <Icon size={size} strokeWidth={2} aria-hidden />;
}
