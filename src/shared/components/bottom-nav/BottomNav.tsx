'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { useLocale } from 'next-intl';

import { getPathname, useRouter } from '@/core/i18n/navigation';

import {
  isBottomNavItemPending,
  PENDING_ACTIVE_TIMEOUT_MS,
  resolveVisualActiveId,
} from './bottom-nav-state';
import { BOTTOM_NAV_PRESS_DELAY_MS, shouldBypassPressFeedback } from './with-press-feedback';
import styles from './BottomNav.module.scss';

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
  activeIcon: string;
  activeLabel: string;
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

type BottomNavItemControlProps = {
  item: BottomNavItem;
  routeActiveId: string;
  pendingItemId: string | null;
  classNames: BottomNavClassNames;
  onItemSelect?: (id: string) => void | boolean;
  onPendingSelect?: (id: string) => void;
};

function BottomNavItemControl({
  item,
  routeActiveId,
  pendingItemId,
  classNames,
  onItemSelect,
  onPendingSelect,
}: BottomNavItemControlProps) {
  const router = useRouter();
  const locale = useLocale();
  const [pressing, setPressing] = useState(false);
  const pressReleaseTimerRef = useRef<number | null>(null);
  const navigationTimerRef = useRef<number | null>(null);

  const isRouteActive = item.id === routeActiveId;
  const visualActiveId = resolveVisualActiveId(routeActiveId, pendingItemId);
  const isVisualActive = item.id === visualActiveId;
  const isPending = isBottomNavItemPending(item.id, routeActiveId, pendingItemId);
  const icon = resolveItemIcon(item);

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

  const content = isVisualActive ? (
    <span className={classNames.activeBubble} data-bottom-nav-active-bubble="true">
      <span
        className={classNames.activeIcon}
        data-bottom-nav-icon-variant="outlined"
        data-bottom-nav-icon-state="active"
        data-bottom-nav-icon-active="true"
      >
        {icon}
      </span>
      <span className={classNames.activeLabel} data-bottom-nav-label-active="true">
        {item.label}
      </span>
    </span>
  ) : (
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

  function clearPressReleaseTimer() {
    if (pressReleaseTimerRef.current != null) {
      window.clearTimeout(pressReleaseTimerRef.current);
      pressReleaseTimerRef.current = null;
    }
  }

  function beginPressFeedback() {
    clearPressReleaseTimer();
    setPressing(true);
    pressReleaseTimerRef.current = window.setTimeout(() => {
      setPressing(false);
      pressReleaseTimerRef.current = null;
    }, BOTTOM_NAV_PRESS_DELAY_MS);
  }

  function clearNavigationTimer() {
    if (navigationTimerRef.current != null) {
      window.clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
  }

  function scheduleNavigation() {
    clearNavigationTimer();
    navigationTimerRef.current = window.setTimeout(() => {
      navigationTimerRef.current = null;
      performNavigation();
    }, BOTTOM_NAV_PRESS_DELAY_MS);
  }

  useEffect(
    () => () => {
      clearPressReleaseTimer();
      clearNavigationTimer();
    },
    [],
  );

  function applyOptimisticActive(
    event: Pick<MouseEvent, 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'button'>,
  ) {
    if (item.disabled || shouldBypassPressFeedback(event)) {
      return;
    }

    if (!isRouteActive) {
      onPendingSelect?.(item.id);
    }
  }

  function handlePointerDown(event: PointerEvent) {
    if (item.disabled || event.button !== 0) {
      return;
    }

    if (shouldBypassPressFeedback(event)) {
      return;
    }

    applyOptimisticActive(event);
    beginPressFeedback();
    scheduleNavigation();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (item.disabled) {
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
    scheduleNavigation();
  }

  function performNavigation() {
    if (onItemSelect?.(item.id) === true) {
      return;
    }

    if (item.href) {
      router.push(item.href as never);
    }
  }

  function handleClick(event: MouseEvent) {
    if (item.disabled) {
      return;
    }

    if (shouldBypassPressFeedback(event)) {
      return;
    }

    event.preventDefault();
  }

  if (item.href) {
    const localizedHref = getPathname({ href: item.href, locale });

    return (
      <a
        href={localizedHref}
        className={itemClassName}
        {...itemDataAttributes}
        aria-current={isRouteActive ? 'page' : undefined}
        aria-disabled={item.disabled ? true : undefined}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={itemClassName}
      {...itemDataAttributes}
      disabled={item.disabled}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {content}
    </button>
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
    <nav
      className={[styles.nav, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      data-bottom-nav-global="true"
      data-bottom-nav-glass="true"
    >
      {items.map((item) => (
        <BottomNavItemControl
          key={item.id}
          item={item}
          routeActiveId={activeId}
          pendingItemId={effectivePendingId}
          classNames={classNames}
          onItemSelect={onItemSelect}
          onPendingSelect={setPendingItemId}
        />
      ))}
    </nav>
  );
}
