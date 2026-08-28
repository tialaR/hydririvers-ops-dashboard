'use client';

import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import { Sheet } from '@/shared/design-system/core/sheet';
import { handleSheetEscapeKey } from './liquid-glass-sheet-keyboard';
import styles from './liquid-glass-sheet.module.scss';

export type LiquidGlassSheetVariant = 'fullScreen' | 'inspector';
export type LiquidGlassSheetTone = 'auto' | 'light' | 'dark';
export type LiquidGlassSheetRole = 'dialog' | 'region';
export type LiquidGlassSheetSnapPoint = 'content' | 'medium' | 'expanded';
export type LiquidGlassSheetPlacement = 'bottom' | 'center';

const DEFAULT_SNAP_POINTS: LiquidGlassSheetSnapPoint[] = ['content', 'medium', 'expanded'];
const CLOSE_DRAG_THRESHOLD_PX = 88;
const SNAP_DRAG_THRESHOLD_RATIO = 0.1;

export type LiquidGlassSheetProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  variant?: LiquidGlassSheetVariant;
  tone?: LiquidGlassSheetTone;
  stacked?: boolean;
  showGrabber?: boolean;
  showCloseButton?: boolean;
  showPrimaryAction?: boolean;
  primaryActionLabel?: string;
  closeLabel?: string;
  onClose?: () => void;
  onPrimaryAction?: () => void;
  className?: string;
  contentClassName?: string;
  role?: LiquidGlassSheetRole;
  placement?: LiquidGlassSheetPlacement;
  draggable?: boolean;
  snapPoints?: LiquidGlassSheetSnapPoint[];
  defaultSnapPoint?: LiquidGlassSheetSnapPoint;
  onSnapPointChange?: (snapPoint: LiquidGlassSheetSnapPoint) => void;
};

function resolveViewportHeight(): number {
  if (typeof window === 'undefined') {
    return 800;
  }
  return window.visualViewport?.height ?? window.innerHeight;
}

function getSnapHeightPx(
  snapPoint: LiquidGlassSheetSnapPoint,
  contentHeightPx: number,
  viewportHeightPx: number,
): number {
  const toolbarPx = 54;
  const contentSnapHeight = Math.min(
    Math.max(contentHeightPx + toolbarPx + 12, Math.round(viewportHeightPx * 0.42)),
    viewportHeightPx * 0.48,
  );

  switch (snapPoint) {
    case 'content':
      return contentSnapHeight;
    case 'medium':
      return Math.round(viewportHeightPx * 0.56);
    case 'expanded':
      return Math.round(viewportHeightPx * 0.98);
    default:
      return contentSnapHeight;
  }
}

function getSnapHeightExtentsPx(
  snapPoints: LiquidGlassSheetSnapPoint[],
  contentHeightPx: number,
  viewportHeightPx: number,
): { min: number; max: number } {
  const heights = snapPoints.map((point) =>
    getSnapHeightPx(point, contentHeightPx, viewportHeightPx),
  );

  return {
    min: Math.min(...heights),
    max: Math.max(...heights),
  };
}

function pickNearestSnapPoint(
  snapPoints: LiquidGlassSheetSnapPoint[],
  currentHeightPx: number,
  contentHeightPx: number,
  viewportHeightPx: number,
): LiquidGlassSheetSnapPoint {
  let nearest = snapPoints[0] ?? 'content';
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const point of snapPoints) {
    const height = getSnapHeightPx(point, contentHeightPx, viewportHeightPx);
    const distance = Math.abs(height - currentHeightPx);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = point;
    }
  }

  return nearest;
}

/**
 * Mobile sheet primitive (Figma Sheets — Full Screen / Inspector iPhone).
 *
 * Optional drag/snap (`draggable`) for lab and composed flows. Does not replace
 * the shared BottomSheet.
 */
export function LiquidGlassSheet({
  open,
  title,
  children,
  variant = 'inspector',
  tone = 'auto',
  stacked = false,
  showGrabber = true,
  showCloseButton = true,
  showPrimaryAction = false,
  primaryActionLabel,
  closeLabel = 'Fechar',
  onClose,
  onPrimaryAction,
  className = '',
  contentClassName = '',
  role = 'dialog',
  placement = 'bottom',
  draggable = false,
  snapPoints = DEFAULT_SNAP_POINTS,
  defaultSnapPoint = 'content',
  onSnapPointChange,
}: LiquidGlassSheetProps) {
  const titleId = useId();
  const contentRef = useRef<HTMLDivElement>(null);

  const [snapPoint, setSnapPoint] = useState<LiquidGlassSheetSnapPoint>(defaultSnapPoint);
  const [contentHeightPx, setContentHeightPx] = useState(0);
  const [viewportHeightPx, setViewportHeightPx] = useState(800);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  const dragStartRef = useRef({ pointerY: 0, offsetPx: 0, snapPoint: defaultSnapPoint });

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSnapPoint(defaultSnapPoint);
      setDragOffsetPx(0);
      setIsDragging(false);
    }
  }

  const measureContent = useCallback(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }
    setContentHeightPx(node.scrollHeight);
    setViewportHeightPx(resolveViewportHeight());
  }, []);

  useLayoutEffect(() => {
    if (!open || !draggable || typeof window === 'undefined') {
      return undefined;
    }

    measureContent();

    const handleResize = () => {
      measureContent();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draggable, measureContent, open]);

  useEffect(() => {
    if (!open || !draggable || typeof window === 'undefined') {
      return undefined;
    }

    const node = contentRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      measureContent();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [draggable, measureContent, open]);

  useEffect(() => {
    if (!open || !onClose || typeof window === 'undefined') {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      handleSheetEscapeKey(event, onClose);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const updateSnapPoint = useCallback(
    (next: LiquidGlassSheetSnapPoint) => {
      setSnapPoint(next);
      onSnapPointChange?.(next);
    },
    [onSnapPointChange],
  );

  const handleOverlayPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    // Round 21: close on pointerdown so the overlay consumes the original
    // gesture before the browser can dispatch a click to content behind it.
    event.preventDefault();
    event.stopPropagation();
    onClose?.();
  };

  const handleOverlayPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  const handleOverlayClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (!draggable || !open) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    measureContent();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerY: event.clientY,
      offsetPx: dragOffsetPx,
      snapPoint,
    };
    setIsDragging(true);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isDragging) {
      return;
    }

    const delta = event.clientY - dragStartRef.current.pointerY;
    const baseHeight = getSnapHeightPx(
      dragStartRef.current.snapPoint,
      contentHeightPx,
      viewportHeightPx,
    );
    const { max } = getSnapHeightExtentsPx(snapPoints, contentHeightPx, viewportHeightPx);
    const minOffsetPx = Math.min(0, baseHeight - max);
    const maxOffsetPx = Math.round(viewportHeightPx * 0.55);
    const nextOffset = dragStartRef.current.offsetPx + delta;

    setDragOffsetPx(Math.min(maxOffsetPx, Math.max(minOffsetPx, nextOffset)));
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLElement>) => {
    if (!isDragging) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);

    const baseHeight = getSnapHeightPx(
      dragStartRef.current.snapPoint,
      contentHeightPx,
      viewportHeightPx,
    );
    const projectedHeight = Math.max(0, baseHeight - dragOffsetPx);
    const { min: lowestHeight } = getSnapHeightExtentsPx(
      snapPoints,
      contentHeightPx,
      viewportHeightPx,
    );
    const isDraggingBelowLowestSnap = dragOffsetPx >= CLOSE_DRAG_THRESHOLD_PX &&
      projectedHeight <= lowestHeight * (1 - SNAP_DRAG_THRESHOLD_RATIO);

    if (isDraggingBelowLowestSnap) {
      setDragOffsetPx(0);
      onClose?.();
      return;
    }

    const nearest = pickNearestSnapPoint(
      snapPoints,
      projectedHeight,
      contentHeightPx,
      viewportHeightPx,
    );

    setDragOffsetPx(0);
    updateSnapPoint(nearest);
  };

  const overlayClassName = [styles.overlay, className].filter(Boolean).join(' ');
  const sheetClassName = [
    styles.sheet,
    variant === 'fullScreen' ? styles.variant_fullScreen : styles.variant_inspector,
  ]
    .filter(Boolean)
    .join(' ');
  const contentClasses = [styles.content, contentClassName].filter(Boolean).join(' ');

  const primaryLabel = primaryActionLabel?.trim() || 'Ação principal';
  const sheetHeightPx = draggable
    ? getSnapHeightPx(snapPoint, contentHeightPx, viewportHeightPx)
    : undefined;
  const contentScrollable = draggable && snapPoint !== 'content';

  const expandedDragHeightPx =
    draggable && open && sheetHeightPx != null
      ? sheetHeightPx - Math.min(0, dragOffsetPx)
      : undefined;

  const sheetStyle =
    draggable && open && expandedDragHeightPx != null
      ? {
          height: `${expandedDragHeightPx}px`,
          transform: dragOffsetPx > 0 ? `translateY(${dragOffsetPx}px)` : undefined,
        }
      : undefined;

  return (
    <div
      className={overlayClassName}
      data-open={open ? 'true' : 'false'}
      data-tone={tone}
      data-stacked={stacked ? 'true' : 'false'}
      data-placement={placement}
      inert={!open ? true : undefined}
      onPointerDown={open ? handleOverlayPointerDown : undefined}
      onPointerUp={open ? handleOverlayPointerUp : undefined}
      onClick={open ? handleOverlayClick : undefined}
    >
      {stacked ? <div className={styles.stackedRail} aria-hidden /> : null}

      <Sheet
        className={sheetClassName}
        style={sheetStyle}
        role={role}
        modal={open && role === 'dialog'}
        labelledBy={title ? titleId : undefined}
        data-variant={variant}
        data-tone={tone}
        data-stacked={stacked ? 'true' : 'false'}
        data-open={open ? 'true' : 'false'}
        data-draggable={draggable ? 'true' : 'false'}
        data-snap-point={draggable ? snapPoint : undefined}
        data-dragging={isDragging ? 'true' : 'false'}
      >
        <header
          className={styles.toolbar}
          onPointerDown={draggable ? handleDragStart : undefined}
          onPointerMove={draggable ? handleDragMove : undefined}
          onPointerUp={draggable ? handleDragEnd : undefined}
          onPointerCancel={draggable ? handleDragEnd : undefined}
        >
          {showGrabber ? (
            <div className={styles.grabberWrap}>
              <div className={styles.grabber} aria-hidden />
            </div>
          ) : null}

          <div className={styles.titleRow}>
            {showPrimaryAction ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={onPrimaryAction}
                aria-label={primaryLabel}
              >
                <span className={styles.primarySymbol} aria-hidden>
                  ↑
                </span>
              </button>
            ) : (
              <span className={styles.controlSpacer} aria-hidden />
            )}

            {title ? (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            ) : null}

            {showCloseButton ? (
              <button
                type="button"
                className={styles.controlButton}
                onClick={onClose}
                aria-label={closeLabel}
              >
                <span className={styles.controlSymbol} aria-hidden>
                  ×
                </span>
              </button>
            ) : (
              <span className={styles.controlSpacer} aria-hidden />
            )}
          </div>
        </header>

        <div
          ref={contentRef}
          className={contentClasses}
          data-scrollable={contentScrollable ? 'true' : 'false'}
        >
          {children}
        </div>
      </Sheet>
    </div>
  );
}
