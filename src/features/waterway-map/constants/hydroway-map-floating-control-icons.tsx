import {
  Crosshair,
  Flag,
  Layers,
  List,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Route,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

export const HYDROWAY_MAP_FAB_ICON_SIZE = {
  mobile: 18,
  desktop: 18,
} as const;

export const HYDROWAY_MAP_FAB_ICON_STROKE = {
  mobile: 2,
  desktop: 2,
} as const;

export type HydrowayMapFloatingControlKey =
  | 'layers'
  | 'origin'
  | 'current'
  | 'destination'
  | 'fit-route'
  | 'zoom-in'
  | 'zoom-out'
  | 'reset'
  | 'info';

const CONTROL_ICON_BY_KEY: Record<HydrowayMapFloatingControlKey, LucideIcon> = {
  layers: Layers,
  origin: MapPin,
  current: Crosshair,
  destination: Flag,
  'fit-route': Route,
  'zoom-in': Plus,
  'zoom-out': Minus,
  reset: RotateCcw,
  info: List,
};

export function renderHydrowayMapFloatingControlIcon(
  key: HydrowayMapFloatingControlKey,
  size: keyof typeof HYDROWAY_MAP_FAB_ICON_SIZE,
): ReactNode {
  const Icon = CONTROL_ICON_BY_KEY[key];
  return (
    <Icon
      size={HYDROWAY_MAP_FAB_ICON_SIZE[size]}
      strokeWidth={HYDROWAY_MAP_FAB_ICON_STROKE[size]}
    />
  );
}
