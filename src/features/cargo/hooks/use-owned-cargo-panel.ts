'use client';

import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import type { OwnedCargoPreviewPanel } from '@/features/cargo/domain/derive-owned-cargo-detail';
import {
  OWNED_CARGO_PANEL_SEARCH_PARAM,
  createOwnedCargoPanelHref,
  hasInvalidOwnedCargoPanelParam,
  removeOwnedCargoPanelParam,
  resolveOwnedCargoPanelFromSearchParams,
} from '@/features/cargo/domain/owned-cargo-panel-search-params';

/** URL (`?panel=`) como fonte única; push ao abrir, replace ao fechar/trocar panel. */
export function useOwnedCargoPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const panelTarget = resolveOwnedCargoPanelFromSearchParams(searchParams);

  useEffect(() => {
    if (!hasInvalidOwnedCargoPanelParam(searchParams)) return;
    router.replace(removeOwnedCargoPanelParam(pathname, searchParams) as never);
  }, [pathname, router, searchParams]);

  const openPanel = useCallback(
    (panel: OwnedCargoPreviewPanel) => {
      if (panelTarget === panel) return;

      const href = createOwnedCargoPanelHref(pathname, searchParams, panel);
      if (panelTarget) {
        router.replace(href as never);
        return;
      }

      router.push(href as never);
    },
    [panelTarget, pathname, router, searchParams],
  );

  const closePanel = useCallback(() => {
    if (!searchParams.get(OWNED_CARGO_PANEL_SEARCH_PARAM)) return;
    router.replace(removeOwnedCargoPanelParam(pathname, searchParams) as never);
  }, [pathname, router, searchParams]);

  const isPanelOpen = useCallback(
    (panel: OwnedCargoPreviewPanel) => panelTarget === panel,
    [panelTarget],
  );

  return {
    panelTarget,
    openPanel,
    closePanel,
    isPanelOpen,
  };
}
