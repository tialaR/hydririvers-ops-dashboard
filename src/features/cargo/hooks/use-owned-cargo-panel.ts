'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import type { OwnedCargoPreviewPanel } from '@/features/cargo/domain/derive-owned-cargo-detail';
import {
  OWNED_CARGO_PANEL_SEARCH_PARAM,
  createOwnedCargoPanelHref,
  hasInvalidOwnedCargoPanelParam,
  removeOwnedCargoPanelParam,
  resolveOwnedCargoPanelFromSearchParams,
} from '@/features/cargo/domain/owned-cargo-panel-search-params';

function readSearchParamsSnapshot(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

let searchParamsSnapshot = new URLSearchParams();
const searchParamsSubscribers = new Set<() => void>();

function publishSearchParamsSnapshot(nextSnapshot = readSearchParamsSnapshot()) {
  searchParamsSnapshot = nextSnapshot;
  searchParamsSubscribers.forEach((listener) => listener());
}

function handlePopStateSearchParams() {
  publishSearchParamsSnapshot();
}

function subscribeSearchParams(listener: () => void) {
  searchParamsSubscribers.add(listener);

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopStateSearchParams);
  }

  return () => {
    searchParamsSubscribers.delete(listener);

    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', handlePopStateSearchParams);
    }
  };
}

function getSearchParamsClientSnapshot() {
  return searchParamsSnapshot;
}

function getSearchParamsServerSnapshot() {
  return new URLSearchParams();
}

function resolveHrefSearchParams(href: string): URLSearchParams {
  try {
    return new URL(href, window.location.origin).searchParams;
  } catch {
    return readSearchParamsSnapshot();
  }
}

function commitSearchParams(nextSnapshot: URLSearchParams) {
  publishSearchParamsSnapshot(nextSnapshot);
}

/** URL (`?panel=`) como fonte única; push ao abrir, replace ao fechar/trocar panel. */
export function useOwnedCargoPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSyncExternalStore(
    subscribeSearchParams,
    getSearchParamsClientSnapshot,
    getSearchParamsServerSnapshot,
  );

  useEffect(() => {
    publishSearchParamsSnapshot();
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      publishSearchParamsSnapshot();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  const panelTarget = resolveOwnedCargoPanelFromSearchParams(searchParams);

  useEffect(() => {
    if (!hasInvalidOwnedCargoPanelParam(searchParams)) return;
    const href = removeOwnedCargoPanelParam(pathname, searchParams);
    commitSearchParams(resolveHrefSearchParams(href));
    router.replace(href as never);
  }, [pathname, router, searchParams]);

  const openPanel = useCallback(
    (panel: OwnedCargoPreviewPanel) => {
      if (panelTarget === panel) return;

      const href = createOwnedCargoPanelHref(pathname, searchParams, panel);
      commitSearchParams(resolveHrefSearchParams(href));

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
    const href = removeOwnedCargoPanelParam(pathname, searchParams);
    commitSearchParams(resolveHrefSearchParams(href));
    router.replace(href as never);
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
