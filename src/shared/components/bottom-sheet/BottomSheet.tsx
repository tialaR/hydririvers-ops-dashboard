'use client';

import { createPortal } from 'react-dom';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/shared/hooks/use-lock-body-scroll';
import { zIndex } from '@/shared/constants/z-index';
import {
  buildBottomSheetSnapMetrics,
  readSafeAreaInsetBottomPx,
  resolveSnapIndexFromTranslate,
} from './bottom-sheet-snap-math';
import styles from './BottomSheet.module.scss';

/** Duração alinhada ao CSS do sheet (transform). */
export const BOTTOM_SHEET_TRANSITION_MS = 300;
const BOTTOM_SHEET_PRESS_DELAY_MS = 160;

export type BottomSheetSnapPoint = 'auto' | '60vh' | '75vh' | '90vh' | '92vh' | '96vh' | 'fullscreen';

export type BottomSheetSnapHeights = Record<string, string>;

export type BottomSheetVariant = 'default' | 'strong' | 'light' | 'map' | 'fullscreen';

export type BottomSheetViewportAnchor = 'inset' | 'flush';

export type BottomSheetProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title: string;
  description?: string;
  /** Rótulo acessível do diálogo; quando definido, substitui `aria-labelledby` do título. */
  ariaLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  snapPoints?: BottomSheetSnapPoint[];
  /** Alturas nomeadas para snap vertical (ex.: partial / expanded em dvh). */
  snapHeights?: BottomSheetSnapHeights;
  /** Ordem explícita das chaves em `snapHeights` (padrão: ordem de inserção). */
  snapOrder?: string[];
  /** Snap inicial quando `snapHeights` está definido. */
  initialSnap?: string;
  snap?: 40 | 60 | 90;
  enableSnapDrag?: boolean;
  /** Alias de `enableSnapDrag` para contrato mobile. */
  enableDrag?: boolean;
  closeOnOverlayClick?: boolean;
  labelledById?: string;
  describedById?: string;
  className?: string;
  bodyClassName?: string;
  /** Accessible label for the close control (defaults to `title` when omitted). */
  closeAriaLabel?: string;
  /** Rótulo acessível da zona de arraste (handle). */
  dragHandleAriaLabel?: string;
  variant?: BottomSheetVariant;
  /** Variante visual do overlay; padrão: mesma de `variant`. */
  overlayVariant?: BottomSheetVariant;
  /**
   * `inset` (padrão): padding externo e max-height por snap.
   * `flush`: encosta no rodapé da viewport; movimento por translate3d entre snaps.
   */
  viewportAnchor?: BottomSheetViewportAnchor;
  /** Sobrescreve z-index do overlay/sheet (ex.: mapa mobile imersivo acima do shell). */
  stackingZIndex?: number;
  onSnapChange?: (snapId: string, index: number) => void;
};

export function resolveBottomSheetSnapOrder(
  snapHeights: BottomSheetSnapHeights | undefined,
  snapOrder: string[] | undefined,
  initialSnap: string | undefined,
) {
  if (!snapHeights) return [] as string[];
  const keys = snapOrder?.length ? snapOrder : Object.keys(snapHeights);
  if (!keys.length) return [] as string[];
  if (initialSnap && keys.includes(initialSnap)) {
    return [initialSnap, ...keys.filter((key) => key !== initialSnap)];
  }
  return keys;
}

export function resolveBottomSheetInitialSnapIndex(
  snapOrder: string[],
  initialSnap: string | undefined,
) {
  if (!snapOrder.length) return 0;
  if (!initialSnap) return 0;
  const index = snapOrder.indexOf(initialSnap);
  return index >= 0 ? index : 0;
}

function resolveSnapPoint(snapPoints: BottomSheetSnapPoint[] | undefined) {
  const snap = snapPoints?.[0] ?? 'auto';
  if (snap === 'fullscreen') return '100dvh';
  if (snap === '96vh') return '96dvh';
  if (snap === '92vh') return '92dvh';
  if (snap === '90vh') return '90dvh';
  if (snap === '75vh') return '75dvh';
  if (snap === '60vh') return '60dvh';
  return 'auto';
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(','))).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
}

function focusFirstElement(container: HTMLElement, fallback: HTMLElement | null) {
  const focusables = getFocusableElements(container);
  focusables[0]?.focus();
  if (!focusables.length && fallback) fallback.focus();
}

export function BottomSheet({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  ariaLabel,
  children,
  footer,
  snapPoints = ['90vh'],
  snapHeights,
  snapOrder,
  initialSnap,
  snap,
  enableSnapDrag,
  enableDrag,
  closeOnOverlayClick = true,
  labelledById,
  describedById,
  className,
  bodyClassName,
  closeAriaLabel,
  dragHandleAriaLabel,
  variant = 'default',
  overlayVariant,
  viewportAnchor = 'inset',
  stackingZIndex,
  onSnapChange,
}: BottomSheetProps) {
  const dragEnabled = enableDrag ?? enableSnapDrag ?? true;
  const orderedSnapIds = useMemo(
    () => resolveBottomSheetSnapOrder(snapHeights, snapOrder, initialSnap),
    [initialSnap, snapHeights, snapOrder],
  );
  const usesNamedSnaps = orderedSnapIds.length > 0 && Boolean(snapHeights);
  const usesFlushTransform = viewportAnchor === 'flush' && usesNamedSnaps;
  const initialSnapIndex = useMemo(
    () => resolveBottomSheetInitialSnapIndex(orderedSnapIds, initialSnap),
    [initialSnap, orderedSnapIds],
  );
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const dragStateRef = useRef({
    active: false,
    startY: 0,
    startTranslatePx: 0,
    liveTranslatePx: 0,
    lastY: 0,
    lastTimestamp: 0,
    velocityY: 0,
  });
  const snapIndexRef = useRef(initialSnapIndex);
  const dragListenersRef = useRef<{ move: (event: PointerEvent) => void; up: (event: PointerEvent) => void } | null>(null);
  const dragRafRef = useRef<number | null>(null);
  const pendingClientYRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragTranslateYpx, setDragTranslateYpx] = useState<number | null>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [snapIndex, setSnapIndex] = useState(initialSnapIndex);
  const [present, setPresent] = useState(open);
  const [visible, setVisible] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [closeButtonPressing, setCloseButtonPressing] = useState(false);
  const closePressTimerRef = useRef<number | null>(null);
  const prevOpenRef = useRef(open);
  const closeFallbackTimerRef = useRef<number | null>(null);
  const closeFinishedRef = useRef(false);
  const ignoreOverlayClickRef = useRef(false);
  const activeSnapId = usesNamedSnaps ? orderedSnapIds[snapIndex] ?? orderedSnapIds[0] : undefined;
  const resolvedOverlayVariant = overlayVariant ?? variant;

  const snapMetrics = useMemo(() => {
    if (!usesFlushTransform || !snapHeights || viewportHeight <= 0) return null;
    const safeAreaBottomPx = readSafeAreaInsetBottomPx();
    return buildBottomSheetSnapMetrics(snapHeights, orderedSnapIds, viewportHeight, safeAreaBottomPx);
  }, [orderedSnapIds, snapHeights, usesFlushTransform, viewportHeight]);

  const settledTranslateYpx = useMemo(() => {
    if (!snapMetrics) return 0;
    if (!visible || !motionReady) return snapMetrics.closedTranslatePx;
    return snapMetrics.offsetsPx[snapIndex] ?? snapMetrics.offsetsPx[0] ?? 0;
  }, [motionReady, snapMetrics, snapIndex, visible]);

  const sheetTranslateYpx = dragging && dragTranslateYpx !== null ? dragTranslateYpx : settledTranslateYpx;

  useEffect(() => {
    snapIndexRef.current = snapIndex;
  }, [snapIndex]);

  useEffect(() => {
    if (!usesFlushTransform) return undefined;
    const syncViewport = () => {
      setViewportHeight(window.visualViewport?.height ?? window.innerHeight);
    };
    syncViewport();
    window.addEventListener('resize', syncViewport);
    window.visualViewport?.addEventListener('resize', syncViewport);
    return () => {
      window.removeEventListener('resize', syncViewport);
      window.visualViewport?.removeEventListener('resize', syncViewport);
    };
  }, [usesFlushTransform]);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (open && !wasOpen) {
      setSnapIndex(initialSnapIndex);
      setDragOffset(0);
      setDragTranslateYpx(null);
    }
  }, [initialSnapIndex, open]);

  function clearClosePressTimer() {
    if (closePressTimerRef.current !== null) {
      window.clearTimeout(closePressTimerRef.current);
      closePressTimerRef.current = null;
    }
  }

  function clearCloseFallbackTimer() {
    if (closeFallbackTimerRef.current !== null) {
      window.clearTimeout(closeFallbackTimerRef.current);
      closeFallbackTimerRef.current = null;
    }
  }

  const finishCloseUnmount = useCallback(() => {
    if (closeFinishedRef.current) return;
    closeFinishedRef.current = true;
    clearCloseFallbackTimer();
    setPresent(false);
    setMotionReady(false);
    setDragOffset(0);
    setDragTranslateYpx(null);
    setSnapIndex(initialSnapIndex);
    snapIndexRef.current = initialSnapIndex;
  }, [initialSnapIndex]);

  useEffect(() => {
    clearCloseFallbackTimer();

    if (open) {
      closeFinishedRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ciclo mount/open do slide (paint fechado antes de animar)
      setPresent(true);
      setVisible(false);
      setMotionReady(false);

      const openFrame = window.requestAnimationFrame(() => {
        setViewportHeight(window.visualViewport?.height ?? window.innerHeight);
        window.requestAnimationFrame(() => {
          setMotionReady(true);
          window.requestAnimationFrame(() => {
            setVisible(true);
          });
        });
      });

      return () => window.cancelAnimationFrame(openFrame);
    }

    setVisible(false);
    closeFallbackTimerRef.current = window.setTimeout(() => {
      finishCloseUnmount();
    }, BOTTOM_SHEET_TRANSITION_MS + 48);

    return () => clearCloseFallbackTimer();
  }, [finishCloseUnmount, open]);

  useEffect(() => {
    if (!present || open || visible) return undefined;

    const sheet = sheetRef.current;
    if (!sheet) return undefined;

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== sheet) return;
      if (event.propertyName !== 'transform') return;
      finishCloseUnmount();
    };

    sheet.addEventListener('transitionend', onTransitionEnd);
    return () => sheet.removeEventListener('transitionend', onTransitionEnd);
  }, [finishCloseUnmount, open, present, visible]);

  useEffect(() => {
    if (!open || !usesNamedSnaps || !activeSnapId) return;
    onSnapChange?.(activeSnapId, snapIndex);
  }, [activeSnapId, onSnapChange, open, snapIndex, usesNamedSnaps]);

  const requestClose = useMemo(() => {
    return () => {
      setDragOffset(0);
      setDragTranslateYpx(null);
      if (onOpenChange) {
        onOpenChange(false);
        return;
      }
      onClose?.();
    };
  }, [onClose, onOpenChange]);

  useEffect(() => () => {
    if (closePressTimerRef.current !== null) {
      window.clearTimeout(closePressTimerRef.current);
      closePressTimerRef.current = null;
    }
  }, []);

  useLockBodyScroll(present);

  useEffect(() => {
    if (!present || !open) return undefined;

    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => {
      const sheet = sheetRef.current;
      if (!sheet) return;
      focusFirstElement(sheet, closeButtonRef.current);
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }

      if (event.key !== 'Tab') return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusables = getFocusableElements(sheet);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
      lastFocusedRef.current?.focus?.();
    };
  }, [open, present, requestClose]);

  const resolvedOverlayZIndex = stackingZIndex ?? zIndex.overlay;
  const resolvedSheetZIndex = stackingZIndex ? stackingZIndex + 1 : zIndex.bottomSheet;

  const resolvedSnapHeight = useMemo(() => {
    if (usesFlushTransform && snapMetrics) {
      return `${snapMetrics.maxHeightPx}px`;
    }
    if (usesNamedSnaps && snapHeights && activeSnapId) {
      return snapHeights[activeSnapId] ?? snapHeights[orderedSnapIds[0]];
    }
    if (snap) return `${snap}vh`;
    return resolveSnapPoint(snapPoints[snapIndex] ? [snapPoints[snapIndex]] : snapPoints);
  }, [activeSnapId, orderedSnapIds, snap, snapHeights, snapIndex, snapMetrics, snapPoints, usesFlushTransform, usesNamedSnaps]);

  const sheetStyle = useMemo<CSSProperties>(() => {
    if (usesFlushTransform) {
      return {
        ['--sheet-max-height' as string]: resolvedSnapHeight,
        ['--sheet-translate-y' as string]: `${sheetTranslateYpx}px`,
        zIndex: resolvedSheetZIndex,
      };
    }
    return {
      ['--sheet-offset' as string]: `${dragOffset}px`,
      ['--sheet-snap' as string]: resolvedSnapHeight,
      zIndex: resolvedSheetZIndex,
    };
  }, [dragOffset, resolvedSheetZIndex, resolvedSnapHeight, sheetTranslateYpx, usesFlushTransform]);

  const overlayStyle = useMemo<CSSProperties>(() => ({
    zIndex: resolvedOverlayZIndex,
  }), [resolvedOverlayZIndex]);

  function handleOverlayClick() {
    if (ignoreOverlayClickRef.current) return;
    if (closeOnOverlayClick) requestClose();
  }

  function queueCloseWithPressFeedback() {
    setCloseButtonPressing(true);
    clearClosePressTimer();
    closePressTimerRef.current = window.setTimeout(() => {
      setCloseButtonPressing(false);
      clearClosePressTimer();
      requestClose();
    }, BOTTOM_SHEET_PRESS_DELAY_MS);
  }

  function resetAndClose() {
    queueCloseWithPressFeedback();
  }

  const maxSnapIndex = usesNamedSnaps
    ? Math.max(0, orderedSnapIds.length - 1)
    : Math.max(0, snapPoints.length - 1);

  function clearDragListeners() {
    const listeners = dragListenersRef.current;
    if (!listeners) return;
    window.removeEventListener('pointermove', listeners.move);
    window.removeEventListener('pointerup', listeners.up);
    window.removeEventListener('pointercancel', listeners.up);
    dragListenersRef.current = null;
  }

  function cancelDragRaf() {
    if (dragRafRef.current !== null) {
      window.cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
  }

  function finishDrag() {
    if (!dragEnabled) return;
    if (!dragStateRef.current.active) return;
    clearDragListeners();
    cancelDragRaf();
    dragStateRef.current.active = false;
    setDragging(false);
    ignoreOverlayClickRef.current = true;
    window.setTimeout(() => {
      ignoreOverlayClickRef.current = false;
    }, 120);

    if (usesFlushTransform && snapMetrics) {
      const { liveTranslatePx, velocityY } = dragStateRef.current;
      const gap = snapMetrics.offsetsPx[1] !== undefined
        ? Math.abs((snapMetrics.offsetsPx[1] ?? 0) - (snapMetrics.offsetsPx[0] ?? 0))
        : 120;
      const closeThresholdPx = Math.max(72, gap * 0.22);
      const resolved = resolveSnapIndexFromTranslate(
        liveTranslatePx,
        snapMetrics.offsetsPx,
        velocityY,
        closeThresholdPx,
        {
          maxHeightPx: snapMetrics.maxHeightPx,
          viewportHeightPx: viewportHeight,
        },
      );

      if (resolved.shouldClose) {
        requestClose();
        return;
      }

      const nextIndex = Math.min(maxSnapIndex, Math.max(0, resolved.index));
      snapIndexRef.current = nextIndex;
      setSnapIndex(nextIndex);
      setDragTranslateYpx(null);
      dragStateRef.current.liveTranslatePx = snapMetrics.offsetsPx[nextIndex] ?? 0;
      return;
    }

    const offset = dragStateRef.current.liveTranslatePx;
    const currentSnapIndex = snapIndexRef.current;
    const expandThreshold = -72;
    const collapseThreshold = 72;
    const closeThreshold = 108;

    if (offset < expandThreshold && currentSnapIndex < maxSnapIndex) {
      const nextIndex = Math.min(maxSnapIndex, currentSnapIndex + 1);
      snapIndexRef.current = nextIndex;
      setSnapIndex(nextIndex);
      setDragOffset(0);
      dragStateRef.current.liveTranslatePx = 0;
      return;
    }
    if (offset > collapseThreshold && currentSnapIndex > 0) {
      const nextIndex = Math.max(0, currentSnapIndex - 1);
      snapIndexRef.current = nextIndex;
      setSnapIndex(nextIndex);
      setDragOffset(0);
      dragStateRef.current.liveTranslatePx = 0;
      return;
    }
    if (offset > closeThreshold && currentSnapIndex === 0) {
      requestClose();
      return;
    }
    setDragOffset(0);
    dragStateRef.current.liveTranslatePx = 0;
  }

  function applyFlushDrag(clientY: number) {
    if (!snapMetrics) return;
    const delta = clientY - dragStateRef.current.startY;
    const minOffset = snapMetrics.offsetsPx[maxSnapIndex] ?? 0;
    const maxOffset = snapMetrics.closedTranslatePx;
    const next = Math.min(maxOffset, Math.max(minOffset, dragStateRef.current.startTranslatePx + delta));
    dragStateRef.current.liveTranslatePx = next;
    setDragTranslateYpx(next);
  }

  function applyInsetDrag(clientY: number) {
    const delta = clientY - dragStateRef.current.startY;
    const next = Math.max(-160, Math.min(220, dragStateRef.current.startTranslatePx + delta));
    dragStateRef.current.liveTranslatePx = next;
    setDragOffset(next);
  }

  function scheduleDragUpdate(clientY: number) {
    pendingClientYRef.current = clientY;
    if (dragRafRef.current !== null) return;
    dragRafRef.current = window.requestAnimationFrame(() => {
      dragRafRef.current = null;
      const y = pendingClientYRef.current;
      const now = performance.now();
      const elapsed = now - dragStateRef.current.lastTimestamp;
      if (elapsed > 0) {
        dragStateRef.current.velocityY = (y - dragStateRef.current.lastY) / elapsed;
      }
      dragStateRef.current.lastY = y;
      dragStateRef.current.lastTimestamp = now;
      if (usesFlushTransform) {
        applyFlushDrag(y);
      } else {
        applyInsetDrag(y);
      }
    });
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragEnabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    const startTranslate = usesFlushTransform
      ? sheetTranslateYpx
      : dragOffset;
    dragStateRef.current = {
      active: true,
      startY: event.clientY,
      startTranslatePx: startTranslate,
      liveTranslatePx: startTranslate,
      lastY: event.clientY,
      lastTimestamp: performance.now(),
      velocityY: 0,
    };

    const onMove = (moveEvent: PointerEvent) => {
      if (!dragStateRef.current.active) return;
      scheduleDragUpdate(moveEvent.clientY);
    };

    const onUp = () => {
      finishDrag();
    };

    clearDragListeners();
    dragListenersRef.current = { move: onMove, up: onUp };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  useEffect(() => () => {
    clearDragListeners();
    cancelDragRaf();
  }, []);

  if (!present || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.overlay}
      data-variant={resolvedOverlayVariant}
      data-viewport-anchor={viewportAnchor}
      data-visible={visible ? 'true' : 'false'}
      data-motion={visible ? 'open' : present ? 'closing' : 'closed'}
      onClick={handleOverlayClick}
      data-open={open ? 'true' : 'false'}
      role="presentation"
      style={overlayStyle}
    >
      <section
        ref={sheetRef}
        className={[styles.sheet, className].filter(Boolean).join(' ')}
        data-variant={variant}
        data-snap={activeSnapId}
        data-dragging={dragging ? 'true' : 'false'}
        data-motion={visible ? 'open' : present ? 'closing' : 'closed'}
        data-testid="bottom-sheet-panel"
        style={sheetStyle}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : (labelledById ?? titleId)}
        aria-describedby={description ? (describedById ?? descriptionId) : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={styles.handleZone}
          data-testid="bottom-sheet-handle"
          role={dragEnabled ? 'slider' : undefined}
          aria-label={dragEnabled ? dragHandleAriaLabel : undefined}
          aria-valuemin={dragEnabled ? 0 : undefined}
          aria-valuemax={dragEnabled ? maxSnapIndex : undefined}
          aria-valuenow={dragEnabled ? snapIndex : undefined}
          aria-valuetext={dragEnabled && activeSnapId ? activeSnapId : undefined}
          onPointerDown={startDrag}
        >
          <span className={styles.handle} aria-hidden="true" />
        </div>

        <header className={styles.header}>
          <div className={styles.copy}>
            <h2 id={labelledById ?? titleId} className={styles.title}>{title}</h2>
            {description ? <p id={describedById ?? descriptionId} className={styles.description}>{description}</p> : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            data-pressing={closeButtonPressing ? "true" : undefined}
            onPointerDown={() => setCloseButtonPressing(true)}
            onPointerUp={() => setCloseButtonPressing(false)}
            onPointerLeave={() => setCloseButtonPressing(false)}
            onPointerCancel={() => setCloseButtonPressing(false)}
            onClick={resetAndClose}
            aria-label={closeAriaLabel ?? title}
          >
            <X size={18} />
          </button>
        </header>

        <div className={[styles.body, bodyClassName].filter(Boolean).join(' ')}>
          {children}
        </div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </section>
    </div>,
    document.body
  );
}
