'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Flag,
  Map as MapIcon,
  ReceiptText,
  X,
} from 'lucide-react';
import { useScreenTransitionNavigation } from '@/shared/ui/screen-transition';

import styles from './cargo-action-sheet-bridge.module.scss';

type CargoActionSheetBridgeProps = {
  locale: string;
  children: ReactNode;
};

type SelectedCargo = {
  id: string;
  label: string;
};

type CargoView = 'visao-geral' | 'jornada' | 'documentos' | 'custos' | 'prioridade';

type CargoAction = {
  description: string;
  icon: ReactNode;
  title: string;
  view: CargoView;
};

type CargoOptionButtonProps = {
  action: CargoAction;
  onClick: (view: CargoView) => void;
};

const MOBILE_VIEWPORT_MAX_WIDTH = 860;
const MOBILE_QUERY = `(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px)`;
const MAX_LABEL_LENGTH = 96;
const CARGO_CARD_SELECTOR = 'button[data-cargo-id], button.hr-cargo-card';
const CARGO_CODE_SELECTOR = '.hr-cargo-card__code';
const SHEET_ENTER_ANIMATION_MS = 320;
const SHEET_EXIT_ANIMATION_MS = 220;

const ACTIONS: CargoAction[] = [
  {
    view: 'visao-geral',
    title: 'Visão geral',
    description: 'Mapa imersivo, progresso e rota hidroviária.',
    icon: <MapIcon aria-hidden />,
  },
  {
    view: 'jornada',
    title: 'Jornada',
    description: 'Eventos, checkpoints e linha do tempo.',
    icon: <ClipboardList aria-hidden />,
  },
  {
    view: 'documentos',
    title: 'Documentos',
    description: 'Pacote documental, pendências e validações.',
    icon: <FileText aria-hidden />,
  },
  {
    view: 'custos',
    title: 'Custos',
    description: 'Resumo financeiro, saving e composição.',
    icon: <ReceiptText aria-hidden />,
  },
  {
    view: 'prioridade',
    title: 'Prioridade',
    description: 'SLA operacional, urgência e criticidade.',
    icon: <Flag aria-hidden />,
  },
];

function isModifiedNavigation(event: ReactMouseEvent<HTMLDivElement>): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

function isIgnoredCargoSegment(cargoId: string): boolean {
  return (
    cargoId === 'nova' ||
    cargoId === 'minhas-cargas' ||
    cargoId === 'rastreio' ||
    cargoId === 'visao-geral'
  );
}

function buildCargoViewHref(locale: string, cargoId: string, view: CargoView): string {
  return `/${locale}/cargas/${encodeURIComponent(cargoId)}?view=${view}`;
}

function getCargoIdFromAnchor(anchor: HTMLAnchorElement, locale: string): string | null {
  const url = new URL(anchor.href);
  const pathSegments = url.pathname.split('/').filter(Boolean);

  if (pathSegments.length !== 3) {
    return null;
  }

  const [pathLocale, resourceSegment, rawCargoId] = pathSegments;

  if (pathLocale !== locale || resourceSegment !== 'cargas' || !rawCargoId) {
    return null;
  }

  if (url.searchParams.has('view')) {
    return null;
  }

  const cargoId = decodeURIComponent(rawCargoId);

  if (isIgnoredCargoSegment(cargoId)) {
    return null;
  }

  return cargoId;
}

function getCargoIdFromCard(card: HTMLButtonElement): string | null {
  const dataCargoId = card.dataset.cargoId?.trim().toLowerCase();

  if (dataCargoId && !isIgnoredCargoSegment(dataCargoId)) {
    return dataCargoId;
  }

  const codeElement = card.querySelector(CARGO_CODE_SELECTOR);
  const cargoCode = codeElement?.textContent?.trim().toLowerCase();

  if (!cargoCode || isIgnoredCargoSegment(cargoCode)) {
    return null;
  }

  return cargoCode;
}

function normalizeLabel(label: string | null | undefined): string | null {
  const normalized = label?.trim().replace(/\s+/g, ' ');

  if (!normalized || normalized.length > MAX_LABEL_LENGTH) {
    return null;
  }

  return normalized;
}

function getCargoLabelFromAnchor(anchor: HTMLAnchorElement, cargoId: string): string {
  return (
    normalizeLabel(anchor.getAttribute('aria-label')) ??
    normalizeLabel(anchor.textContent) ??
    cargoId
  );
}

function getCargoLabelFromCard(card: HTMLButtonElement, cargoId: string): string {
  return (
    normalizeLabel(card.dataset.cargoLabel) ??
    normalizeLabel(card.querySelector('.hr-cargo-card__title')?.textContent) ??
    normalizeLabel(card.getAttribute('aria-label')) ??
    cargoId
  );
}

function CargoOptionButton({ action, onClick }: CargoOptionButtonProps) {
  return (
    <button
      type="button"
      className={styles.actionItem}
      onClick={() => onClick(action.view)}
      aria-label={`${action.title}: ${action.description}`}
    >
      <span className={styles.actionIcon}>{action.icon}</span>

      <span className={styles.actionCopy}>
        <strong>{action.title}</strong>
        <small>{action.description}</small>
      </span>

      <ArrowRight className={styles.actionArrow} aria-hidden />
    </button>
  );
}

export function CargoActionSheetBridge({
  locale,
  children,
}: CargoActionSheetBridgeProps) {
  const router = useRouter();
  const { navigateWithTransition, prefetchScreen } = useScreenTransitionNavigation();
  const [selectedCargo, setSelectedCargo] = useState<SelectedCargo | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const finishClose = useCallback(() => {
    clearCloseTimeout();
    setSelectedCargo(null);
    setIsClosing(false);
    setIsNavigating(false);
  }, [clearCloseTimeout]);

  const scheduleClose = useCallback((onClosed?: () => void) => {
    clearCloseTimeout();
    setIsClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      finishClose();
      onClosed?.();
    }, SHEET_EXIT_ANIMATION_MS);
  }, [clearCloseTimeout, finishClose]);

  useEffect(() => {
    if (!selectedCargo) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        scheduleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scheduleClose, selectedCargo]);

  useEffect(() => {
    if (!selectedCargo) {
      return undefined;
    }

    const hrefs = ACTIONS.map((action) =>
      buildCargoViewHref(locale, selectedCargo.id, action.view)
    );

    hrefs.forEach((href) => {
      router.prefetch(href);
      prefetchScreen(href);
    });
    return undefined;
  }, [locale, prefetchScreen, router, selectedCargo]);

  useEffect(() => {
    if (!selectedCargo || typeof document === 'undefined') {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;

    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';

    return () => {
      body.style.overflow = previousOverflow;
      body.style.touchAction = previousTouchAction;
    };
  }, [selectedCargo]);

  useEffect(() => () => clearCloseTimeout(), [clearCloseTimeout]);

  const closeSheet = useCallback(() => {
    if (!selectedCargo || isClosing) {
      return;
    }

    scheduleClose();
  }, [isClosing, scheduleClose, selectedCargo]);

  const navigateToCargoView = (view: CargoView) => {
    if (!selectedCargo || isClosing || isNavigating) {
      return;
    }

    const href = buildCargoViewHref(locale, selectedCargo.id, view);
    setIsNavigating(true);
    scheduleClose(() => {
      navigateWithTransition(href);
    });
  };

  const openSheetForCargo = (cargo: SelectedCargo) => {
    clearCloseTimeout();
    setSelectedCargo(cargo);
    setIsClosing(false);
    setIsNavigating(false);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isModifiedNavigation(event) || !isMobileViewport()) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest('a[href]');

    if (anchor instanceof HTMLAnchorElement) {
      const cargoId = getCargoIdFromAnchor(anchor, locale);

      if (!cargoId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openSheetForCargo({
        id: cargoId,
        label: getCargoLabelFromAnchor(anchor, cargoId),
      });
      return;
    }

    const card = target.closest(CARGO_CARD_SELECTOR);

    if (!(card instanceof HTMLButtonElement)) {
      return;
    }

    const cargoId = getCargoIdFromCard(card);

    if (!cargoId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    openSheetForCargo({
      id: cargoId,
      label: getCargoLabelFromCard(card, cargoId),
    });
  };

  return (
    <div className={styles.scope} onClickCapture={handleClickCapture}>
      {children}

      {selectedCargo && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={isClosing ? `${styles.overlay} ${styles.overlayClosing}` : styles.overlay}
              role="presentation"
              onClick={closeSheet}
              style={{ ['--cargo-action-sheet-enter-ms' as string]: `${SHEET_ENTER_ANIMATION_MS}ms`, ['--cargo-action-sheet-exit-ms' as string]: `${SHEET_EXIT_ANIMATION_MS}ms` }}
            >
              <section
                className={isClosing ? `${styles.sheet} ${styles.sheetClosing}` : styles.sheet}
                role="dialog"
                aria-modal="true"
                aria-label="Escolher visão da carga"
                onClick={(event) => event.stopPropagation()}
              >
                <div className={styles.handle} aria-hidden />

                <header className={styles.header}>
                  <div>
                    <span className={styles.eyebrow}>Carga selecionada</span>
                    <h2>{selectedCargo.label}</h2>
                  </div>

                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={closeSheet}
                    aria-label="Fechar opções da carga"
                    disabled={isNavigating}
                  >
                    <X aria-hidden />
                  </button>
                </header>

                <nav className={styles.actionList} aria-label="Visões da carga">
                  {ACTIONS.map((action) => (
                    <CargoOptionButton
                      key={action.view}
                      action={action}
                      onClick={navigateToCargoView}
                    />
                  ))}
                </nav>
              </section>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
