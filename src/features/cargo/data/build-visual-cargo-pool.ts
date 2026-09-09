import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import { normalizeCargoId, normalizeCargoIdForLookup } from '@/shared/routing/normalize-cargo-id';

import { resolvePublicMarketplaceCargoList } from './resolve-public-marketplace-cargo-list';

const VISUAL_POOL_TARGET_SIZE = 20;

const VISUAL_STATUS_ROTATION: CargoStatus[] = [
  'open',
  'bidding',
  'contracting',
  'reserved',
  'boarded',
  'delivered',
];

const VISUAL_ETA_CONFIDENCE_ROTATION = [
  'ETA 36–44h • confiança média',
  'ETA 4–6 dias • confiança média',
  'ETA 52–72h • sazonal',
  'ETA 30–42h • alta confiança',
] as const;

/** ID estável exibido na lista `/cargas` (OperationsBoard) para slots duplicados do pool visual. */
export function buildVisualCargoId(sequence: number): string {
  return `HYD-2026-${String(sequence).padStart(5, '0')}`;
}

/**
 * Pool visual da lista de cargas: até 20 itens, preservando cargas reais e
 * completando com variantes `HYD-2026-NNNNN` determinísticas.
 */
export function buildVisualCargoPool(cargoes: Cargo[]): Cargo[] {
  if (cargoes.length >= VISUAL_POOL_TARGET_SIZE) {
    return cargoes.slice(0, VISUAL_POOL_TARGET_SIZE);
  }

  const targetSize = Math.max(VISUAL_POOL_TARGET_SIZE, cargoes.length);

  return Array.from({ length: targetSize }, (_, index) => {
    const base = cargoes[index % cargoes.length];
    const duplicate = index >= cargoes.length;
    const sequence = index + 1;
    const status = VISUAL_STATUS_ROTATION[index % VISUAL_STATUS_ROTATION.length];

    if (!duplicate) {
      return { ...base, id: normalizeCargoId(base.id) };
    }

    return {
      ...base,
      id: buildVisualCargoId(sequence),
      status,
      title: `${base.title} ${Math.floor(index / cargoes.length) + 1}`,
      etaConfidence: VISUAL_ETA_CONFIDENCE_ROTATION[index % VISUAL_ETA_CONFIDENCE_ROTATION.length],
    };
  });
}

export function resolveVisualCargoPool(sourceCargoes?: Cargo[]): Cargo[] {
  const base = sourceCargoes ?? resolvePublicMarketplaceCargoList();
  return buildVisualCargoPool(base);
}

export function resolveVisualCargoPoolIds(sourceCargoes?: Cargo[]): string[] {
  return resolveVisualCargoPool(sourceCargoes).map((cargo) => cargo.id);
}

export function findVisualCargoById(
  cargoId: string,
  sourceCargoes?: Cargo[],
): Cargo | undefined {
  const key = normalizeCargoIdForLookup(cargoId);
  return resolveVisualCargoPool(sourceCargoes).find(
    (cargo) => normalizeCargoIdForLookup(cargo.id) === key,
  );
}

export function isVisualCargoPoolId(cargoId: string): boolean {
  return Boolean(findVisualCargoById(cargoId));
}
