import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';

const CARGO_STATUS_SEARCH_ALIASES: Record<CargoStatus, string[]> = {
  open: ['open', 'aberta', 'abierta'],
  bidding: ['bidding', 'cotacao', 'cotación', 'propostas'],
  contracting: ['contracting', 'contratando', 'contrato'],
  reserved: ['reserved', 'reservada', 'operacao', 'operación'],
  boarded: ['boarded', 'transito', 'trânsito', 'embarcada'],
  delivered: ['delivered', 'entregue', 'entregada', 'concluida', 'concluída'],
};

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function buildOwnedCargoSearchHaystack(cargo: Cargo): string {
  const statusAliases = CARGO_STATUS_SEARCH_ALIASES[cargo.status] ?? [cargo.status];

  return normalizeSearchValue(
    [
      cargo.id,
      cargo.title,
      cargo.origin,
      cargo.destination,
      cargo.status,
      ...statusAliases,
      cargo.corridor ?? '',
      cargo.cargoType ?? '',
    ].join(' '),
  );
}

export function matchesOwnedCargoSearchQuery(cargo: Cargo, query: string): boolean {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return true;
  }

  return buildOwnedCargoSearchHaystack(cargo).includes(normalizedQuery);
}

export function filterOwnedCargoesBySearch(items: Cargo[], query: string): Cargo[] {
  if (!query.trim()) {
    return items;
  }

  return items.filter((cargo) => matchesOwnedCargoSearchQuery(cargo, query));
}
