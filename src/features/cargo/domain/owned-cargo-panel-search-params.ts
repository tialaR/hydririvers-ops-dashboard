import {
  OWNED_CARGO_PANEL_TARGETS,
  type OwnedCargoPreviewPanel,
} from '@/features/cargo/domain/derive-owned-cargo-detail';

/** Query param estável para sheets do cockpit em `/minhas-cargas/[id]`. */
export const OWNED_CARGO_PANEL_SEARCH_PARAM = 'panel' as const;

export type OwnedCargoPanelTarget = (typeof OWNED_CARGO_PANEL_TARGETS)[number];

export function isOwnedCargoPanelTarget(value: string): value is OwnedCargoPanelTarget {
  return (OWNED_CARGO_PANEL_TARGETS as readonly string[]).includes(value);
}

export function resolveOwnedCargoPanelFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): OwnedCargoPreviewPanel | null {
  const raw = searchParams.get(OWNED_CARGO_PANEL_SEARCH_PARAM);
  if (!raw) return null;
  return isOwnedCargoPanelTarget(raw) ? raw : null;
}

export function hasInvalidOwnedCargoPanelParam(
  searchParams: Pick<URLSearchParams, 'get'>,
): boolean {
  const raw = searchParams.get(OWNED_CARGO_PANEL_SEARCH_PARAM);
  return raw !== null && !isOwnedCargoPanelTarget(raw);
}

function cloneRouteSearchParams(searchParams: URLSearchParams): URLSearchParams {
  return new URLSearchParams(searchParams.toString());
}

/** Preserva demais query params ao definir `panel`. */
export function createOwnedCargoPanelHref(
  pathname: string,
  searchParams: URLSearchParams,
  panel: OwnedCargoPanelTarget,
): string {
  const next = cloneRouteSearchParams(searchParams);
  next.set(OWNED_CARGO_PANEL_SEARCH_PARAM, panel);
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Remove `panel` e preserva demais query params. */
export function removeOwnedCargoPanelParam(pathname: string, searchParams: URLSearchParams): string {
  const next = cloneRouteSearchParams(searchParams);
  next.delete(OWNED_CARGO_PANEL_SEARCH_PARAM);
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
