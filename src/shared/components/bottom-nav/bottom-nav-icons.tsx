import {
  Gauge,
  Handshake,
  LayoutDashboard,
  Package,
  Route,
  type LucideIcon,
} from 'lucide-react';

/** Standard icon viewport for DS v2 global BottomNav. */
export const BOTTOM_NAV_ICON_SIZE = 18;

export type BottomNavIconId =
  | 'overview'
  | 'dashboard'
  | 'cargos'
  | 'negotiations'
  | 'tracking';

const ICON_MAP: Record<BottomNavIconId, LucideIcon> = {
  overview: LayoutDashboard,
  dashboard: Gauge,
  cargos: Package,
  negotiations: Handshake,
  tracking: Route,
};

export function renderBottomNavIcon(iconId: BottomNavIconId, active: boolean) {
  const Icon = ICON_MAP[iconId];

  return (
    <Icon
      size={BOTTOM_NAV_ICON_SIZE}
      aria-hidden
      fill="none"
      strokeWidth={active ? 2.15 : 1.85}
    />
  );
}
