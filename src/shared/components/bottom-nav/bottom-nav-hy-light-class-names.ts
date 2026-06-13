import type { BottomNavClassNames } from './bottom-nav';
import shellStyles from './bottom-nav-hy-light-shell.module.sass';

/** ClassNames HY light premium — product shell e lab. */
export const bottomNavHyLightClassNames = {
  shell: shellStyles.shell,
  item: shellStyles.item,
  itemActive: shellStyles.itemActive,
  icon: shellStyles.icon,
  label: shellStyles.label,
  activeBubble: shellStyles.activeBubble,
  activeBubbleSurface: shellStyles.activeBubbleSurface,
  activeBubbleRim: shellStyles.activeBubbleRim,
  activeLiquidLayer: shellStyles.activeLiquidLayer,
  activeIcon: shellStyles.activeIcon,
  activeLabel: shellStyles.activeLabel,
  pendingGlow: shellStyles.pendingGlow,
} as const satisfies BottomNavClassNames & { shell: string };
