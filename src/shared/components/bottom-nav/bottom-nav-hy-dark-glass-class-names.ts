import type { BottomNavClassNames } from './BottomNav';
import shellStyles from './bottom-nav-hy-dark-glass-shell.module.sass';

/** Dark glass skin — mobile /cargas only (light page background). */
export const bottomNavHyDarkGlassClassNames = {
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
