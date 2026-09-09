'use client';

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefCallback,
} from 'react';

import { useLinkStatus } from 'next/link';

import { MotionButton, MotionLink } from './bottom-nav-motion';
import { isBottomNavItemPending } from './bottom-nav-state';
import { shouldBypassPressFeedback } from './with-press-feedback';
import styles from './bottom-nav.module.sass';

export function resolveBottomNavCompactLabel(label: string, maxChars = 7): string {
  const trimmed = label.trim();

  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxChars - 1)}…`;
}

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

export function resolveBottomNavItemIcon(item: BottomNavItem): ReactNode {
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

export type BottomNavItemControlProps = {
  item: BottomNavItem;
  index: number;
  routeActiveId: string;
  pendingItemId: string | null;
  jumpingIndex: number | null;
  registerItemRef: (id: string) => RefCallback<HTMLElement>;
  onItemSelect?: (id: string) => void | boolean;
  onPendingSelect: (id: string) => void;
  onPressingChange: (id: string | null) => void;
};

export function BottomNavItemControl({
  item,
  index,
  routeActiveId,
  pendingItemId,
  jumpingIndex,
  registerItemRef,
  onItemSelect,
  onPendingSelect,
  onPressingChange,
}: BottomNavItemControlProps) {
  const [linkPending, setLinkPending] = useState(false);
  const icon = resolveBottomNavItemIcon(item);
  const isRouteActive = item.id === routeActiveId;
  const isPending = item.href
    ? linkPending
    : isBottomNavItemPending(item.id, routeActiveId, pendingItemId);
  const isIconJumping = isRouteActive && jumpingIndex === index;
  const compactLabel = resolveBottomNavCompactLabel(item.label);

  const itemDataAttributes = {
    'data-hy-bottom-nav-item': item.id,
    'data-bottom-nav-item': item.id,
    'data-index': index,
    'data-active': isRouteActive ? 'true' : 'false',
    'data-bottom-nav-active': isRouteActive ? 'true' : undefined,
    'data-bottom-nav-pending': isPending ? 'true' : undefined,
  } as const;

  const content = (
    <>
      {isPending && !isRouteActive ? (
        <span className={styles.pendingGlow} aria-hidden="true" data-bottom-nav-pending-glow="true" />
      ) : null}
      <span
        className={[styles.icon, isIconJumping ? styles.iconJumpActive : ''].filter(Boolean).join(' ')}
        data-bottom-nav-icon-variant="outlined"
      >
        {icon}
      </span>
      <span className={styles.label} data-bottom-nav-label-measure="true">
        <span className={styles.labelFull}>{item.label}</span>
        <span className={styles.labelCompact} aria-hidden="true">
          {compactLabel}
        </span>
      </span>
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

  const itemRef = registerItemRef(item.id);

  if (item.href) {
    return (
      <MotionLink
        ref={itemRef}
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
      ref={itemRef}
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
