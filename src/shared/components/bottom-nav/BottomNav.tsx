'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { useLinkStatus } from 'next/link';

import { MotionLink, MotionButton, BottomNavMotionProvider } from './bottom-nav-motion';
import {
  isBottomNavItemPending,
  PENDING_ACTIVE_TIMEOUT_MS,
  resolveVisualActiveId,
} from './bottom-nav-state';
import { shouldBypassPressFeedback } from './with-press-feedback';
import styles from './BottomNav.module.sass';

export type BottomNavItem = {
  id: string;
  label: string;
  /** @deprecated Prefer `iconOutlined`. */
  icon?: ReactNode;
  iconOutlined?: ReactNode;
  /** @deprecated Active state uses outlined icons only. */
  iconFilled?: ReactNode;
  href?: string;
  disabled?: boolean;
};

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
   * Legacy skin hook. Kept for backwards compatibility while the preview-based
   * BottomNav owns its production styling internally.
   */
  classNames?: BottomNavClassNames;
};

type BottomNavLinkPendingBridgeProps = {
  onPendingChange: (pending: boolean) => void;
};

type BottomNavItemControlProps = {
  item: BottomNavItem;
  index: number;
  routeActiveId: string;
  visualActiveId: string;
  pendingItemId: string | null;
  onItemSelect?: (id: string) => void | boolean;
  onPendingSelect: (id: string) => void;
  onPressingChange: (id: string | null) => void;
};

function resolveItemIcon(item: BottomNavItem): ReactNode {
  return item.iconOutlined ?? item.icon ?? item.iconFilled;
}

function BottomNavLinkPendingBridge({ onPendingChange }: BottomNavLinkPendingBridgeProps) {
  const { pending } = useLinkStatus();

  useEffect(() => {
    onPendingChange(pending);
  }, [onPendingChange, pending]);

  return null;
}

function clampActiveIndex(items: BottomNavItem[], activeId: string): number {
  const index = items.findIndex((item) => item.id === activeId);
  return index >= 0 ? index : 0;
}

function BottomNavItemControl({
  item,
  index,
  routeActiveId,
  visualActiveId,
  pendingItemId,
  onItemSelect,
  onPendingSelect,
  onPressingChange,
}: BottomNavItemControlProps) {
  const [linkPending, setLinkPending] = useState(false);
  const icon = resolveItemIcon(item);
  const isRouteActive = item.id === routeActiveId;
  const isVisualActive = item.id === visualActiveId;
  const isPending = item.href
    ? linkPending
    : isBottomNavItemPending(item.id, routeActiveId, pendingItemId);

  const itemDataAttributes = {
    'data-hy-bottom-nav-item': item.id,
    'data-bottom-nav-item': item.id,
    'data-index': index,
    'data-active': isVisualActive ? 'true' : 'false',
    'data-bottom-nav-active': isVisualActive ? 'true' : undefined,
    'data-bottom-nav-pending': isPending ? 'true' : undefined,
  } as const;

  const content = (
    <>
      {isPending && !isVisualActive ? (
        <span className={styles.pendingGlow} aria-hidden="true" data-bottom-nav-pending-glow="true" />
      ) : null}
      <span className={styles.icon} data-bottom-nav-icon-variant="outlined">
        {icon}
      </span>
      <span className={styles.label}>{item.label}</span>
    </>
  );

  const handleLinkPendingChange = useCallback((pending: boolean) => {
    setLinkPending(pending);
  }, []);

  function handlePointerDown(event: PointerEvent) {
    if (item.disabled || event.button !== 0 || shouldBypassPressFeedback(event)) {
      return;
    }

    if (!isRouteActive) {
      onPendingSelect(item.id);
    }

    onPressingChange(item.id);
  }

  function handlePointerUp(event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }

    onPressingChange(null);
  }

  function handlePointerCancel() {
    onPressingChange(null);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (item.disabled || item.href) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();

    if (!isRouteActive) {
      onPendingSelect(item.id);
    }

    onPressingChange(item.id);
    onItemSelect?.(item.id);
    window.setTimeout(() => onPressingChange(null), 120);
  }

  function handleClick(event: MouseEvent) {
    if (item.disabled) {
      return;
    }

    if (shouldBypassPressFeedback(event)) {
      return;
    }

    if (item.href) {
      if (onItemSelect?.(item.id) === true) {
        event.preventDefault();
      }
      return;
    }

    event.preventDefault();
    onItemSelect?.(item.id);
  }

  if (item.href) {
    return (
      <MotionLink
        href={item.href as never}
        prefetch
        className={styles.item}
        {...itemDataAttributes}
        aria-current={isRouteActive ? 'page' : undefined}
        aria-disabled={item.disabled ? true : undefined}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleClick}
      >
        <BottomNavLinkPendingBridge onPendingChange={handleLinkPendingChange} />
        {content}
      </MotionLink>
    );
  }

  return (
    <MotionButton
      type="button"
      className={styles.item}
      {...itemDataAttributes}
      disabled={item.disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {content}
    </MotionButton>
  );
}

export function BottomNav({
  items,
  activeId,
  onItemSelect,
  ariaLabel,
}: BottomNavProps) {
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [pressingItemId, setPressingItemId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const previousVisualIdRef = useRef<string | null>(null);
  const effectivePendingId = pendingItemId != null && pendingItemId !== activeId ? pendingItemId : null;
  const visualActiveId = resolveVisualActiveId(activeId, effectivePendingId);
  const activeIndex = clampActiveIndex(items, visualActiveId);

  useEffect(() => {
    if (!effectivePendingId) {
      return undefined;
    }

    const timer = window.setTimeout(() => setPendingItemId(null), PENDING_ACTIVE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [activeId, effectivePendingId]);

  useEffect(() => {
    const previousVisualId = previousVisualIdRef.current;
    previousVisualIdRef.current = visualActiveId;

    if (!previousVisualId || previousVisualId === visualActiveId) {
      return undefined;
    }

    setIsMoving(true);
    const timer = window.setTimeout(() => setIsMoving(false), 360);
    return () => window.clearTimeout(timer);
  }, [visualActiveId]);

  const itemCount = Math.max(items.length, 1);
  const navStyle = useMemo(
    () => ({
      '--hy-bottom-nav-item-count': itemCount,
      '--hy-bottom-nav-active-index': activeIndex,
    }) as CSSProperties,
    [activeIndex, itemCount],
  );

  return (
    <BottomNavMotionProvider>
      <nav
        className={styles.nav}
        aria-label={ariaLabel}
        data-bottom-nav-global="true"
        data-bottom-nav-preview-global="true"
        data-hy-bottom-nav-pressing={pressingItemId ?? undefined}
        data-hy-bottom-nav-moving={isMoving ? 'true' : 'false'}
        style={navStyle}
      >
        <span className={styles.lens} aria-hidden="true" data-hy-bottom-nav-preview-lens="true">
          <span className={styles.waterGlow} />
          <span className={styles.waterSurface} />
          <span className={styles.waterDepth} />
          <span className={styles.waterDistortion} />
          <span className={styles.waterEdge} />
          <span className={styles.waterSpecular} />
        </span>

        {items.map((item, index) => (
          <BottomNavItemControl
            key={item.id}
            item={item}
            index={index}
            routeActiveId={activeId}
            visualActiveId={visualActiveId}
            pendingItemId={effectivePendingId}
            onItemSelect={onItemSelect}
            onPendingSelect={setPendingItemId}
            onPressingChange={setPressingItemId}
          />
        ))}
      </nav>
    </BottomNavMotionProvider>
  );
}
