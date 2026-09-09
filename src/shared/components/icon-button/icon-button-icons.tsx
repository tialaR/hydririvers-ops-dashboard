import {
  Bell,
  Package,
  Plus,
  Route,
  Settings,
  SlidersHorizontal,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

/** Standard stroke icon viewport for DS v2 global IconButton shell. */
export const ICON_BUTTON_ICON_SIZE = 21;

export type IconButtonIconName =
  | 'language'
  | 'notifications'
  | 'profile'
  | 'filter'
  | 'close'
  | 'settings'
  | 'plus'
  | 'cargo'
  | 'route';

const ICON_MAP: Record<Exclude<IconButtonIconName, 'language'>, LucideIcon> = {
  notifications: Bell,
  profile: User,
  filter: SlidersHorizontal,
  close: X,
  settings: Settings,
  plus: Plus,
  cargo: Package,
  route: Route,
};

export function renderIconButtonIcon(name: IconButtonIconName, content?: ReactNode): ReactNode {
  if (name === 'language') {
    return content ?? null;
  }

  const Icon = ICON_MAP[name];
  return <Icon size={ICON_BUTTON_ICON_SIZE} aria-hidden />;
}
