import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { cargoes as marketplaceSeedCargoes } from '@/features/marketplace/data/marketplace.mock';
import { isPublicCargo } from '@/features/marketplace/services/cargo-visibility';
import { mergeCanonicalPublicCargo } from '@/features/cargo/constants/merge-canonical-public-cargo';
import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { normalizeCargoId, normalizeCargoIdForLookup } from '@/shared/routing/normalize-cargo-id';

function sortByPublishedAtDesc(left: Cargo, right: Cargo): number {
  const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
  const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;
  return rightTime - leftTime;
}

/**
 * Lista pública completa: todos os cargos `visibility: public` do seed,
 * mesclados com metadados canônicos quando existirem, mais entradas canônicas
 * exclusivas (ex.: CARGO-003 público no mock de produto apesar de privado no seed).
 */
export function resolvePublicMarketplaceCargoList(
  cargoes: Cargo[] = marketplaceSeedCargoes,
): Cargo[] {
  const canonicalByLookup = new Map(
    publicCargosMock.map((cargo) => [normalizeCargoIdForLookup(cargo.id), cargo]),
  );
  const byLookup = new Map<string, Cargo>();

  for (const stored of cargoes) {
    if (!isPublicCargo(stored)) {
      continue;
    }

    const normalizedId = normalizeCargoId(stored.id);
    const canonical = canonicalByLookup.get(normalizeCargoIdForLookup(stored.id));
    const merged = canonical
      ? mergeCanonicalPublicCargo(
          { ...stored, id: normalizedId },
          { ...canonical, id: normalizedId },
        )
      : { ...stored, id: normalizedId, visibility: 'public' as const };

    byLookup.set(normalizeCargoIdForLookup(merged.id), merged);
  }

  for (const canonical of publicCargosMock) {
    const key = normalizeCargoIdForLookup(canonical.id);
    if (byLookup.has(key)) {
      continue;
    }

    const stored = cargoes.find((cargo) => normalizeCargoIdForLookup(cargo.id) === key);
    if (stored && isPublicCargo(stored)) {
      const normalizedId = normalizeCargoId(stored.id);
      byLookup.set(
        key,
        mergeCanonicalPublicCargo(
          { ...stored, id: normalizedId },
          { ...canonical, id: normalizedId },
        ),
      );
      continue;
    }

    byLookup.set(key, { ...canonical, id: normalizeCargoId(canonical.id) });
  }

  return [...byLookup.values()].sort(sortByPublishedAtDesc);
}

export function resolvePublicMarketplaceCargoIds(
  cargoes: Cargo[] = marketplaceSeedCargoes,
): string[] {
  return resolvePublicMarketplaceCargoList(cargoes).map((cargo) => cargo.id);
}

export function findPublicMarketplaceCargo(
  cargoId: string,
  cargoes: Cargo[] = marketplaceSeedCargoes,
): Cargo | undefined {
  const key = normalizeCargoIdForLookup(cargoId);
  return resolvePublicMarketplaceCargoList(cargoes).find(
    (cargo) => normalizeCargoIdForLookup(cargo.id) === key,
  );
}
