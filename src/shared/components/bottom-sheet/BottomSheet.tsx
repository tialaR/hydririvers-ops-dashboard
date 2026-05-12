'use client';

import { createPortal } from 'react-dom';
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/shared/hooks/use-lock-body-scroll';
import { zIndex } from '@/shared/constants/z-index';
import styles from './BottomSheet.module.scss';

export type BottomSheetSnapPoint = 'auto' | '60vh' | '75vh' | '90vh' | 'fullscreen';

export type BottomSheetProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  snapPoints?: BottomSheetSnapPoint[];
  snap?: 40 | 60 | 90;
  enableSnapDrag?: boolean;
  closeOnOverlayClick?: boolean;
  labelledById?: string;
  describedById?: string;
  className?: string;
  bodyClassName?: string;
};

function resolveSnapPoint(snapPoints: BottomSheetSnapPoint[] | undefined) {
  const snap = snapPoints?.[0] ?? 'auto';
  if (snap === 'fullscreen') return '100dvh';
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
  children,
  footer,
  snapPoints = ['90vh'],
  snap,
  enableSnapDrag = true,
  closeOnOverlayClick = true,
  labelledById,
  describedById,
  className,
  bodyClassName
}: BottomSheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const dragStateRef = useRef({ active: false, startY: 0, offset: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  const [snapIndex, setSnapIndex] = useState(0);
  const requestClose = useMemo(() => {
    return () => {
      setDragOffset(0);
      setSnapIndex(0);
      if (onOpenChange) {
        onOpenChange(false);
        return;
      }
      onClose?.();
    };
  }, [onClose, onOpenChange]);

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return undefined;

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
  }, [open, requestClose]);

  const sheetStyle = useMemo<CSSProperties>(() => ({
    ['--sheet-offset' as string]: `${dragOffset}px`,
    ['--sheet-snap' as string]: snap
      ? `${snap}vh`
      : resolveSnapPoint(snapPoints[snapIndex] ? [snapPoints[snapIndex]] : snapPoints),
    zIndex: zIndex.bottomSheet
  }), [dragOffset, snap, snapIndex, snapPoints]);

  const overlayStyle = useMemo<CSSProperties>(() => ({
    zIndex: zIndex.overlay
  }), []);

  function handleOverlayClick() {
    if (closeOnOverlayClick) requestClose();
  }

  function resetAndClose() {
    requestClose();
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!enableSnapDrag) return;
    dragStateRef.current = { active: true, startY: event.clientY, offset: dragOffset };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!enableSnapDrag) return;
    if (!dragStateRef.current.active) return;
    const delta = event.clientY - dragStateRef.current.startY;
    // allow a small negative drag to "expand" to the next snap point
    const next = dragStateRef.current.offset + delta;
    setDragOffset(Math.max(-140, next));
  }

  function endDrag() {
    if (!enableSnapDrag) return;
    if (!dragStateRef.current.active) return;
    dragStateRef.current.active = false;
    if (dragOffset < -80) {
      setSnapIndex((current) => Math.min(snapPoints.length - 1, current + 1));
      setDragOffset(0);
      return;
    }
    if (dragOffset > 80 && snapIndex > 0) {
      setSnapIndex((current) => Math.max(0, current - 1));
      setDragOffset(0);
      return;
    }
    if (dragOffset > 120 && snapIndex === 0) {
      requestClose();
      return;
    }
    setDragOffset(0);
  }

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      data-open={open ? 'true' : 'false'}
      role="presentation"
      style={overlayStyle}
    >
      <section
        ref={sheetRef}
        className={[styles.sheet, className].filter(Boolean).join(' ')}
        style={sheetStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById ?? titleId}
        aria-describedby={description ? (describedById ?? descriptionId) : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={styles.handleZone}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className={styles.handle} aria-hidden="true" />
        </div>

        <header className={styles.header}>
          <div className={styles.copy}>
            <h2 id={labelledById ?? titleId} className={styles.title}>{title}</h2>
            {description ? <p id={describedById ?? descriptionId} className={styles.description}>{description}</p> : null}
          </div>
          <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={resetAndClose} aria-label={title}>
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
