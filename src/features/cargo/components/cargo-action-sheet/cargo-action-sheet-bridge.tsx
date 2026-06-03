'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Flag,
  Map as MapIcon,
  ReceiptText,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/core/i18n/navigation';
import { intlAppPaths, type CargoDetailTabView } from '@/shared/routing/app-routes';
import { BottomSheet } from '@/shared/components/bottom-sheet/BottomSheet';
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

type CargoAction = {
  description: string;
  title: string;
  icon: ReactNode;
} & (
  | { destination: 'map' }
  | { destination: 'view'; view: CargoDetailTabView }
);

type CargoOptionButtonProps = {
  action: CargoAction;
  onClick: (action: CargoAction) => void;
  disabled?: boolean;
};

const MOBILE_VIEWPORT_MAX_WIDTH = 860;
const MOBILE_QUERY = `(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px)`;
const MAX_LABEL_LENGTH = 96;
const CARGO_CARD_SELECTOR =
  'button[data-cargo-id], button.hr-cargo-card, article[data-cargo-id]';
const CARGO_CODE_SELECTOR = '.hr-cargo-card__code';

function isModifiedNavigation(event: ReactMouseEvent<HTMLDivElement>): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

function normalizeCargoSegment(value: string): string {
  return value.trim().toLowerCase();
}

function isIgnoredCargoSegment(cargoId: string): boolean {
  const normalized = normalizeCargoSegment(cargoId);
  return normalized === 'nova' || normalized === 'minhas-cargas' || normalized === 'rastreio';
}

function buildCargoViewHref(locale: string, cargoId: string, view: CargoDetailTabView): string {
  void locale;
  return intlAppPaths.cargos.cargoView(cargoId, view);
}

function buildCargoActionHref(locale: string, cargoId: string, action: CargoAction): string {
  if (action.destination === 'map') {
    return intlAppPaths.cargos.cargoMap(cargoId);
  }

  return buildCargoViewHref(locale, cargoId, action.view);
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

function getCargoIdFromCard(card: HTMLElement): string | null {
  const dataCargoId = card.dataset.cargoId?.trim();

  if (dataCargoId && !isIgnoredCargoSegment(dataCargoId)) {
    return dataCargoId;
  }

  const codeElement = card.querySelector(CARGO_CODE_SELECTOR);
  const cargoCode = codeElement?.textContent?.trim();

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

function getCargoLabelFromCard(card: HTMLElement, cargoId: string): string {
  return (
    normalizeLabel(card.dataset.cargoLabel) ??
    normalizeLabel(card.querySelector('.hr-cargo-card__title')?.textContent) ??
    normalizeLabel(card.querySelector('h2')?.textContent) ??
    normalizeLabel(card.getAttribute('aria-label')) ??
    cargoId
  );
}

function CargoOptionButton({ action, onClick, disabled }: CargoOptionButtonProps) {
  return (
    <button
      type="button"
      className={styles.actionItem}
      onClick={() => onClick(action)}
      disabled={disabled}
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
  const tBoard = useTranslations('operationsBoard');
  const router = useRouter();
  const { navigateWithTransition, prefetchScreen } = useScreenTransitionNavigation();
  const [selectedCargo, setSelectedCargo] = useState<SelectedCargo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const actions = useMemo<CargoAction[]>(
    () => [
      {
        destination: 'map',
        title: tBoard('tabs.overview'),
        description: tBoard('actionSheet.overviewDescription'),
        icon: <MapIcon aria-hidden />,
      },
      {
        destination: 'view',
        view: 'jornada',
        title: tBoard('tabs.timeline'),
        description: tBoard('actionSheet.timelineDescription'),
        icon: <ClipboardList aria-hidden />,
      },
      {
        destination: 'view',
        view: 'documentos',
        title: tBoard('tabs.documents'),
        description: tBoard('actionSheet.documentsDescription'),
        icon: <FileText aria-hidden />,
      },
      {
        destination: 'view',
        view: 'custos',
        title: tBoard('tabs.cost'),
        description: tBoard('actionSheet.costDescription'),
        icon: <ReceiptText aria-hidden />,
      },
      {
        destination: 'view',
        view: 'prioridade',
        title: tBoard('tabs.priority'),
        description: tBoard('actionSheet.priorityDescription'),
        icon: <Flag aria-hidden />,
      },
    ],
    [tBoard],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) return;
    setSelectedCargo(null);
    setIsNavigating(false);
  }, []);

  useEffect(() => {
    if (!selectedCargo) {
      return undefined;
    }

    const hrefs = actions.map((action) => buildCargoActionHref(locale, selectedCargo.id, action));

    hrefs.forEach((href) => {
      void router.prefetch(href);
      prefetchScreen(href);
    });
    return undefined;
  }, [actions, locale, prefetchScreen, router, selectedCargo]);

  const navigateToCargoAction = (action: CargoAction) => {
    if (!selectedCargo || isNavigating) {
      return;
    }

    const href = buildCargoActionHref(locale, selectedCargo.id, action);
    setIsNavigating(true);
    navigateWithTransition(href);
  };

  const openSheetForCargo = (cargo: SelectedCargo) => {
    setSelectedCargo(cargo);
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

    if (!(card instanceof HTMLElement)) {
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

      {selectedCargo ? (
        <BottomSheet
          open
          onOpenChange={handleOpenChange}
          ariaLabel={tBoard('actionSheet.ariaLabel')}
          title={selectedCargo.label}
          description={tBoard('map.hud.selectedCargo')}
          closeAriaLabel={tBoard('actionSheet.close')}
          snapPoints={['75vh']}
          variant="strong"
          enableDrag
          closeOnOverlayClick
          className={styles.sheet}
          bodyClassName={styles.body}
        >
          <nav className={styles.actionList} aria-label={tBoard('actionSheet.navigationAria')}>
            {actions.map((action) => (
              <CargoOptionButton
                key={action.destination === 'map' ? 'map' : action.view}
                action={action}
                onClick={navigateToCargoAction}
                disabled={isNavigating}
              />
            ))}
          </nav>
        </BottomSheet>
      ) : null}
    </div>
  );
}
