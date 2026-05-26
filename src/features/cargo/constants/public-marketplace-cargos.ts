import { resolveVisualCargoPoolIds } from '@/features/cargo/data/build-visual-cargo-pool';
import { resolvePublicMarketplaceCargoIds } from '@/features/cargo/data/resolve-public-marketplace-cargo-list';
import { normalizeCargoIdForLookup } from '@/shared/routing/normalize-cargo-id';

export { mergeCanonicalPublicCargo } from '@/features/cargo/constants/merge-canonical-public-cargo';

/** IDs exibidos na lista pública — todos os cargos públicos do seed + canônicos exclusivos. */
export const PUBLIC_MARKETPLACE_CARGO_IDS = resolvePublicMarketplaceCargoIds();

/** IDs da lista `/cargas` (pool visual de 20 itens) — inclui variantes `HYD-2026-NNNNN`. */
export const VISIBLE_CARGO_LIST_IDS = resolveVisualCargoPoolIds();

const PUBLIC_MARKETPLACE_LOOKUP_IDS = new Set(
  PUBLIC_MARKETPLACE_CARGO_IDS.map((cargoId) => normalizeCargoIdForLookup(cargoId)),
);

const MAP_ELIGIBLE_CARGO_LOOKUP_IDS = new Set([
  ...PUBLIC_MARKETPLACE_CARGO_IDS,
  ...VISIBLE_CARGO_LIST_IDS,
].map((cargoId) => normalizeCargoIdForLookup(cargoId)));

export function isPublicMarketplaceCargoId(cargoId: string): boolean {
  return PUBLIC_MARKETPLACE_LOOKUP_IDS.has(normalizeCargoIdForLookup(cargoId));
}

/** Carga pode abrir `/cargas/[id]/mapa` com mocks completos (lista pública + pool visual). */
export function isMapEligibleCargoId(cargoId: string): boolean {
  return MAP_ELIGIBLE_CARGO_LOOKUP_IDS.has(normalizeCargoIdForLookup(cargoId));
}
