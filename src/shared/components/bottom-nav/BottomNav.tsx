'use client';

import {
  useCallback,
  useEffect,
  useRef,
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
  bottomNavActiveIconPressScale,
  bottomNavBubblePressInSpring,
  bottomNavBubblePressOutSpring,
  bottomNavContentSpring,
  bottomNavItemTapProps,
  BottomNavMotionProvider,
  MotionButton,
  MotionLink,
  MotionSpan,
  useBottomNavReducedMotion,
} from './bottom-nav-motion';
import {
  BottomNavGooeyPillLayer,
  useBottomNavGooeyPillTransition,
} from './bottom-nav-gooey-pill';
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
  onBubblePressStart?: (id: string) => void;
  onBubblePressEnd?: () => void;
  reducedMotion: boolean;
};

function BottomNavItemControl({
  item,
  routeActiveId,
  pendingItemId,
  classNames,
  onItemSelect,
  onPendingSelect,
  onBubblePressStart,
  onBubblePressEnd,
  reducedMotion,
}: BottomNavItemControlProps) {
  const [pressing, setPressing] = useState(false);
  const [linkPending, setLinkPending] = useState(false);

  const isRouteActive = item.id === routeActiveId;
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
            : { opacity: 1, scale: iconPressScale, y: 0 }
        }
        transition={
          reducedMotion
            ? undefined
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
      {pendingGlow}
      {isVisualActive ? activeContent : inactiveContent}
    </>
  );

  const handleLinkPendingChange = useCallback((pending: boolean) => {
    setLinkPending(pending);
  }, []);

  function beginPressFeedback() {
    setPressing(true);
    onBubblePressStart?.(item.id);
  }

  function endPressFeedback() {
    setPressing(false);
    onBubblePressEnd?.();
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
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [bubblePressItemId, setBubblePressItemId] = useState<string | null>(null);
  const effectivePendingId =
    pendingItemId != null && pendingItemId !== activeId ? pendingItemId : null;

  useEffect(() => {
    if (!effectivePendingId) {
      return undefined;
    }

    const timer = window.setTimeout(() => setPendingItemId(null), PENDING_ACTIVE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [activeId, effectivePendingId]);

  const gooeyEnabled = !reducedMotion;
  const visualActiveId = resolveVisualActiveId(activeId, effectivePendingId);
  const trackRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef(new Map<string, HTMLDivElement>());
  const { metrics: pillMetrics, tailMetrics } = useBottomNavGooeyPillTransition(
    visualActiveId,
    trackRef,
    cellRefs,
    reducedMotion,
  );
  const bubblePressing =
    bubblePressItemId != null && bubblePressItemId === visualActiveId;

  const handleBubblePressStart = useCallback((id: string) => {
    setBubblePressItemId(id);
  }, []);

  const handleBubblePressEnd = useCallback(() => {
    setBubblePressItemId(null);
  }, []);

  return (
    <BottomNavMotionProvider>
      <nav
        className={[styles.nav, className].filter(Boolean).join(' ')}
        aria-label={ariaLabel}
        data-bottom-nav-global="true"
        data-bottom-nav-glass="true"
        data-hy-bottom-nav-gooey={gooeyEnabled ? 'true' : 'false'}
        data-hy-bottom-nav-reduced-motion={reducedMotion ? 'true' : 'false'}
        style={{ '--hy-bottom-nav-item-count': items.length } as CSSProperties}
      >
        {gooeyEnabled ? (
          <svg className={styles.gooeyDefs} aria-hidden="true" focusable="false">
            <defs>
              <filter id="hy-bottom-nav-goo" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>
          </svg>
        ) : null}
        <div
          ref={trackRef}
          className={styles.gooeyTrack}
          data-bottom-nav-gooey-track={gooeyEnabled ? 'true' : 'static'}
          aria-hidden="true"
        >
          {items.map((item) => (
            <div
              key={`track-${item.id}`}
              ref={(node) => {
                if (node) {
                  cellRefs.current.set(item.id, node);
                } else {
                  cellRefs.current.delete(item.id);
                }
              }}
              className={styles.gooeyCell}
              data-bottom-nav-gooey-cell={item.id}
            />
          ))}
          {pillMetrics ? (
            <BottomNavGooeyPillLayer
              metrics={pillMetrics}
              tailMetrics={tailMetrics}
              bubblePressing={bubblePressing}
              reducedMotion={reducedMotion}
              bubbleClassName={classNames.activeBubble}
              liquidClassName={classNames.activeLiquidLayer}
            />
          ) : (
            <span
              className={classNames.activeBubble}
              data-bottom-nav-active-bubble="true"
              data-bottom-nav-active-bubble-measuring="true"
              aria-hidden="true"
            />
          )}
        </div>
        {items.map((item) => (
          <BottomNavItemControl
            key={item.id}
            item={item}
            routeActiveId={activeId}
            pendingItemId={effectivePendingId}
            classNames={classNames}
            onItemSelect={onItemSelect}
            onPendingSelect={setPendingItemId}
            onBubblePressStart={handleBubblePressStart}
            onBubblePressEnd={handleBubblePressEnd}
            reducedMotion={reducedMotion}
          />
        ))}
      </nav>
    </BottomNavMotionProvider>
  );
}
