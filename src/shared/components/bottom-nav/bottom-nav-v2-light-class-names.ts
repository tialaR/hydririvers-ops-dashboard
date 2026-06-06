import type { BottomNavClassNames } from './BottomNav';
import shellStyles from './bottom-nav-v2-light-shell.module.scss';

/** ClassNames homologados em /dev-v2 light — mesma casca visual para lab e product shell. */
export const bottomNavV2LightClassNames = {
  shell: shellStyles.shell,
  item: shellStyles.item,
  itemActive: shellStyles.itemActive,
  icon: shellStyles.icon,
  label: shellStyles.label,
  activeBubble: shellStyles.activeBubble,
  activeIcon: shellStyles.activeIcon,
  activeLabel: shellStyles.activeLabel,
} as const satisfies BottomNavClassNames & { shell: string };
