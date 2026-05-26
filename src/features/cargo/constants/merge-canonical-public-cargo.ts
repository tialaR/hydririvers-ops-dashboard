import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

/**
 * Mescla registro persistido em mock-db com metadados canônicos de lista/mapa.
 * Garante id, origem, destino e título alinhados aos mocks Hydroway.
 */
export function mergeCanonicalPublicCargo(stored: Cargo, canonical: Cargo): Cargo {
  return {
    ...stored,
    id: canonical.id,
    title: canonical.title,
    origin: canonical.origin,
    destination: canonical.destination,
    visibility: 'public',
    publishedAt: canonical.publishedAt ?? stored.publishedAt,
    status: canonical.status ?? stored.status,
    cargoType: canonical.cargoType ?? stored.cargoType,
    volume: canonical.volume ?? stored.volume,
    window: canonical.window ?? stored.window,
    co2Saving: canonical.co2Saving ?? stored.co2Saving,
    targetPrice: canonical.targetPrice ?? stored.targetPrice,
    ownerId: canonical.ownerId ?? stored.ownerId,
    shipperId: canonical.shipperId ?? stored.shipperId,
  };
}
