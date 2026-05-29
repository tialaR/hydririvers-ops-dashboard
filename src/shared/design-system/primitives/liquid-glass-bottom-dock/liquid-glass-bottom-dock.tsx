'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-bottom-dock.module.scss';

export type LiquidGlassBottomDockItem = {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  badge?: string | number;
};

export type LiquidGlassBottomDockTone = 'auto' | 'light' | 'dark';

export type LiquidGlassBottomDockProps = {
  items: LiquidGlassBottomDockItem[];
  activeId: string;
  onChange?: (id: string) => void;
  tone?: LiquidGlassBottomDockTone;
  className?: string;
  'aria-label'?: string;
};

type ActiveBubbleMetrics = {
  width: number;
  transform: string;
};

const INITIAL_BUBBLE: ActiveBubbleMetrics = {
  width: 0,
  transform: 'translateX(0px)',
};

/**
 * Floating bottom glass dock with a sliding active lens/bubble.
 * Distinct from bottom sheets — used for primary tab navigation in lab flows.
 */
export function LiquidGlassBottomDock({
  items,
  activeId,
  onChange,
  tone = 'auto',
  className = '',
  'aria-label': ariaLabel = 'Navegação inferior',
}: LiquidGlassBottomDockProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const [bubbleMetrics, setBubbleMetrics] = useState<ActiveBubbleMetrics>(INITIAL_BUBBLE);

  const measureActiveBubble = useCallback(() => {
    const track = trackRef.current;
    const activeButton = itemRefs.current.get(activeId);

    if (!track || !activeButton) {
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    const left = buttonRect.left - trackRect.left;

    setBubbleMetrics({
      width: buttonRect.width,
      transform: `translateX(${left}px)`,
    });
  }, [activeId]);

  useLayoutEffect(() => {
    measureActiveBubble();
  }, [activeId, items, measureActiveBubble]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      measureActiveBubble();
    });

    observer.observe(track);
    return () => observer.disconnect();
  }, [measureActiveBubble]);

  const bubbleStyle: CSSProperties = {
    width: bubbleMetrics.width > 0 ? `${bubbleMetrics.width}px` : undefined,
    transform: bubbleMetrics.transform,
  };

  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <nav className={rootClassName} aria-label={ariaLabel} data-tone={tone}>
      <div ref={trackRef} className={styles.track} data-tone={tone}>
        <span
          className={styles.activeBubble}
          style={bubbleStyle}
          data-testid="liquid-glass-bottom-dock-active-bubble"
          aria-hidden
        />
        {items.map((item) => {
          const isActive = item.id === activeId;
          const itemClassName = [styles.item, isActive ? styles.itemActive : '']
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) {
                  itemRefs.current.set(item.id, node);
                  return;
                }
                itemRefs.current.delete(item.id);
              }}
              type="button"
              className={itemClassName}
              data-active={isActive ? 'true' : undefined}
              disabled={item.disabled}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={item.disabled || undefined}
              onClick={() => {
                if (item.disabled) {
                  return;
                }
                onChange?.(item.id);
              }}
            >
              <span className={styles.icon} aria-hidden>
                {item.icon}
              </span>
              <span className={styles.label}>{item.label}</span>
              {item.badge != null ? (
                <span className={styles.badge} aria-label={`${item.label}: ${item.badge}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
