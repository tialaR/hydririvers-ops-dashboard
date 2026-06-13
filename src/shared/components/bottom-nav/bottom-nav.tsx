'use client';

import { useEffect, useState } from 'react';

import {
  BottomNavMotionProvider,
  useBottomNavReducedMotion,
} from './bottom-nav-motion';
import { PENDING_ACTIVE_TIMEOUT_MS } from './bottom-nav-state';
import { BottomNavItemControl, type BottomNavItem } from './bottom-nav-items';
import { useBottomNavIndicator } from './use-bottom-nav-indicator';
import styles from './bottom-nav.module.sass';

export type { BottomNavItem } from './bottom-nav-items';

export type BottomNavClassNames = {
  item: string;
  itemActive?: string;
  icon: string;
  label: string;
  activeBubble: string;
  activeBubbleSurface?: string;
  activeBubbleRim?: string;
  activeLiquidLayer?: string;
  activeIcon: string;
  activeLabel: string;
  pendingGlow?: string;
};

export type BottomNavProps = {
  items: BottomNavItem[];
  activeId: string;
  /** Return `true` to skip default delayed navigation for this item. */
  onItemSelect?: (id: string) => void | boolean;
  className?: string;
  ariaLabel?: string;
  /**
   * @deprecated Ignored by preview-global BottomNav. Kept only for mobile-list-lab
   * until that route migrates off external classNames skins.
   */
  classNames?: BottomNavClassNames;
};

function clampActiveIndex(items: BottomNavItem[], activeId: string): number {
  const index = items.findIndex((item) => item.id === activeId);
  return index >= 0 ? index : 0;
}

export function BottomNav({
  items,
  activeId,
  onItemSelect,
  ariaLabel,
}: BottomNavProps) {
  const reducedMotion = useBottomNavReducedMotion();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [pressingItemId, setPressingItemId] = useState<string | null>(null);
  const effectivePendingId = pendingItemId != null && pendingItemId !== activeId ? pendingItemId : null;
  const routeActiveIndex = clampActiveIndex(items, activeId);

  const { navRef, registerItemRef, navStyle, isStretching, jumpingIndex } =
    useBottomNavIndicator(activeId, routeActiveIndex, items.length, reducedMotion);

  useEffect(() => {
    if (!effectivePendingId) {
      return undefined;
    }

    const timer = window.setTimeout(() => setPendingItemId(null), PENDING_ACTIVE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [activeId, effectivePendingId]);

  return (
    <BottomNavMotionProvider>
      <nav
        ref={navRef}
        className={styles.nav}
        aria-label={ariaLabel}
        data-bottom-nav-global="true"
        data-bottom-nav-preview-global="true"
        data-hy-bottom-nav-pressing={pressingItemId ?? undefined}
        data-hy-bottom-nav-moving={isStretching ? 'true' : 'false'}
        style={navStyle}
      >
        <span
          className={styles.activeCutout}
          aria-hidden="true"
          data-hy-bottom-nav-preview-lens="true"
        >
          <span className={styles.activeGlass} />
        </span>

        {items.map((item, index) => (
          <BottomNavItemControl
            key={item.id}
            item={item}
            index={index}
            routeActiveId={activeId}
            pendingItemId={effectivePendingId}
            jumpingIndex={jumpingIndex}
            registerItemRef={registerItemRef}
            onItemSelect={onItemSelect}
            onPendingSelect={setPendingItemId}
            onPressingChange={setPressingItemId}
          />
        ))}
      </nav>
    </BottomNavMotionProvider>
  );
}
