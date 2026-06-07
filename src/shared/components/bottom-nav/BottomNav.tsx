'use client';

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { useLinkStatus } from 'next/link';

import {
  isBottomNavItemPending,
  PENDING_ACTIVE_TIMEOUT_MS,
  resolveVisualActiveId,
} from './bottom-nav-state';
import {
  BOTTOM_NAV_ROUTE_COMMIT_ICON_LIFT_REM,
  BOTTOM_NAV_ROUTE_COMMIT_ICON_SCALE,
  bottomNavActiveIconPressScale,
  bottomNavBubblePressInSpring,
  bottomNavBubblePressOutSpring,
  bottomNavContentSpring,
  bottomNavItemTapProps,
  bottomNavRouteCommitSpring,
  BottomNavMotionProvider,
  LayoutGroup,
  MotionButton,
  MotionLink,
  MotionSpan,
  useBottomNavReducedMotion,
  useBottomNavRouteCommitNonce,
  useBottomNavRouteCommitAnimating,
  useBottomNavRouteCommitCycle,
} from './bottom-nav-motion';
import { BottomNavActivePill } from './bottom-nav-gooey-pill';
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
  classNames: BottomNavClassNames;
};

function resolveItemIcon(item: BottomNavItem): ReactNode {
  return item.iconOutlined ?? item.icon ?? item.iconFilled;
}

type BottomNavLinkPendingBridgeProps = {
  onPendingChange: (pending: boolean) => void;
};

function BottomNavLinkPendingBridge({ onPendingChange }: BottomNavLinkPendingBridgeProps) {
  const { pending } = useLinkStatus();

  useEffect(() => {
    onPendingChange(pending);
  }, [onPendingChange, pending]);

  return null;
}

type BottomNavItemControlProps = {
  item: BottomNavItem;
  routeActiveId: string;
  pendingItemId: string | null;
  classNames: BottomNavClassNames;
  onItemSelect?: (id: string) => void | boolean;
  onPendingSelect?: (id: string) => void;
  reducedMotion: boolean;
  routeCommitNonce: number;
};

function BottomNavItemControl({
  item,
  routeActiveId,
  pendingItemId,
  classNames,
  onItemSelect,
  onPendingSelect,
  reducedMotion,
  routeCommitNonce,
}: BottomNavItemControlProps) {
  const [pressing, setPressing] = useState(false);
  const [linkPending, setLinkPending] = useState(false);

  const isRouteActive = item.id === routeActiveId;
  const routeCommitNonceForItem = isRouteActive ? routeCommitNonce : 0;
  const isRouteCommitAnimating = useBottomNavRouteCommitAnimating(routeCommitNonceForItem);
  const isRouteCommitCycle = useBottomNavRouteCommitCycle(routeCommitNonceForItem);
  const visualActiveId = resolveVisualActiveId(routeActiveId, pendingItemId);
  const isVisualActive = item.id === visualActiveId;
  const isPending = item.href
    ? linkPending
    : isBottomNavItemPending(item.id, routeActiveId, pendingItemId);
  const icon = resolveItemIcon(item);
  const tapMotionProps = bottomNavItemTapProps(reducedMotion, isVisualActive);
  const iconPressScale = bottomNavActiveIconPressScale(pressing && isVisualActive, reducedMotion);
  const iconPressTransition =
    pressing && isVisualActive ? bottomNavBubblePressInSpring : bottomNavBubblePressOutSpring;

  const itemClassName = [
    styles.item,
    classNames.item,
    isVisualActive ? classNames.itemActive ?? '' : '',
    pressing ? styles.isPressing : '',
  ]
    .filter(Boolean)
    .join(' ');

  const itemDataAttributes = {
    'data-bottom-nav-item': item.id,
    'data-active': isVisualActive ? 'true' : 'false',
    'data-bottom-nav-active': isVisualActive ? 'true' : undefined,
    'data-bottom-nav-pending': isPending ? 'true' : undefined,
    'data-pressing': pressing ? 'true' : undefined,
  } as const;

  const activePill = isRouteActive ? (
    <BottomNavActivePill
      pressing={pressing}
      isRouteCommitAnimating={isRouteCommitAnimating}
      isRouteCommitCycle={isRouteCommitCycle}
      reducedMotion={reducedMotion}
      bubbleClassName={classNames.activeBubble}
      surfaceClassName={classNames.activeBubbleSurface}
      rimClassName={classNames.activeBubbleRim}
    />
  ) : null;

  const activeContent = (
    <>
      <MotionSpan
        className={classNames.activeIcon}
        data-bottom-nav-icon-variant="outlined"
        data-bottom-nav-icon-state="active"
        data-bottom-nav-icon-active="true"
        data-bottom-nav-icon-pressing={pressing ? 'true' : undefined}
        initial={reducedMotion ? false : { opacity: 0.58, scale: 0.94, y: 0.125 }}
        animate={
          reducedMotion
            ? undefined
            : isRouteCommitAnimating
              ? {
                  opacity: 1,
                  scale: BOTTOM_NAV_ROUTE_COMMIT_ICON_SCALE,
                  y: -BOTTOM_NAV_ROUTE_COMMIT_ICON_LIFT_REM,
                }
              : pressing
                ? {
                    opacity: 1,
                    scale: iconPressScale,
                    y: -0.0625,
                  }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }
        }
        transition={
          reducedMotion
            ? undefined
            : isRouteCommitAnimating || isRouteCommitCycle
              ? bottomNavRouteCommitSpring
              : pressing
                ? iconPressTransition
                : bottomNavContentSpring
        }
      >
        {icon}
      </MotionSpan>
      <MotionSpan
        className={classNames.activeLabel}
        data-bottom-nav-label-active="true"
        initial={reducedMotion ? false : { opacity: 0.58, scale: 0.96, y: 0.125 }}
        animate={reducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
        transition={{ ...bottomNavContentSpring, delay: 0.03 }}
      >
        {item.label}
      </MotionSpan>
    </>
  );

  const inactiveContent = (
    <>
      <span
        className={classNames.icon}
        data-bottom-nav-icon-variant="outlined"
        data-bottom-nav-icon-state="inactive"
      >
        {icon}
      </span>
      <span className={classNames.label}>{item.label}</span>
    </>
  );

  const pendingGlow =
    isPending && !isVisualActive && classNames.pendingGlow ? (
      <span className={classNames.pendingGlow} aria-hidden="true" data-bottom-nav-pending-glow="true" />
    ) : null;

  const content = (
    <>
      {activePill ? (
        <span className={styles.pillSlot} aria-hidden="true" data-bottom-nav-pill-slot="true">
          {activePill}
        </span>
      ) : null}
      {pendingGlow}
      <span className={styles.contentLayer} data-bottom-nav-content-layer="true">
        {isVisualActive ? activeContent : inactiveContent}
      </span>
    </>
  );

  const handleLinkPendingChange = useCallback((pending: boolean) => {
    setLinkPending(pending);
  }, []);

  function beginPressFeedback() {
    setPressing(true);
  }

  function endPressFeedback() {
    setPressing(false);
  }

  function handlePointerDown(event: PointerEvent) {
    if (item.disabled || event.button !== 0) {
      return;
    }

    if (shouldBypassPressFeedback(event)) {
      return;
    }

    if (!item.href && !isRouteActive) {
      onPendingSelect?.(item.id);
    }

    beginPressFeedback();
  }

  function handlePointerUp(event: PointerEvent) {
    if (item.disabled || event.button !== 0) {
      return;
    }

    endPressFeedback();
  }

  function handlePointerCancel() {
    endPressFeedback();
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
      onPendingSelect?.(item.id);
    }

    beginPressFeedback();
    onItemSelect?.(item.id);
    endPressFeedback();
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
        className={itemClassName}
        {...itemDataAttributes}
        aria-current={isRouteActive ? 'page' : undefined}
        aria-disabled={item.disabled ? true : undefined}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClick={handleClick}
        {...tapMotionProps}
      >
        <BottomNavLinkPendingBridge onPendingChange={handleLinkPendingChange} />
        {content}
      </MotionLink>
    );
  }

  return (
    <MotionButton
      type="button"
      className={itemClassName}
      {...itemDataAttributes}
      disabled={item.disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      {...tapMotionProps}
    >
      {content}
    </MotionButton>
  );
}

export function BottomNav({
  items,
  activeId,
  onItemSelect,
  className = '',
  ariaLabel,
  classNames,
}: BottomNavProps) {
  const reducedMotion = useBottomNavReducedMotion();
  const routeCommitNonce = useBottomNavRouteCommitNonce(activeId);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const effectivePendingId =
    pendingItemId != null && pendingItemId !== activeId ? pendingItemId : null;

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
        className={[styles.nav, className].filter(Boolean).join(' ')}
        aria-label={ariaLabel}
        data-bottom-nav-global="true"
        data-bottom-nav-glass="true"
        data-hy-bottom-nav-reduced-motion={reducedMotion ? 'true' : 'false'}
        style={{ '--hy-bottom-nav-item-count': items.length } as CSSProperties}
      >
        <LayoutGroup id="hy-bottom-nav-layout">
          {items.map((item) => (
            <BottomNavItemControl
              key={item.id}
              item={item}
              routeActiveId={activeId}
              pendingItemId={effectivePendingId}
              classNames={classNames}
              onItemSelect={onItemSelect}
              onPendingSelect={setPendingItemId}
              reducedMotion={reducedMotion}
              routeCommitNonce={routeCommitNonce}
            />
          ))}
        </LayoutGroup>
      </nav>
    </BottomNavMotionProvider>
  );
}
