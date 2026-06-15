import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { normalizeEtaValue } from '@/features/cargo/utils/normalize-eta-value';

const OWNED_CARGO_ETA_MAX_LENGTH = 28;

/** Valor curto de ETA/janela para o card da lista privada. */
export function resolveOwnedCargoEtaDisplay(cargo: Cargo): string {
  const windowValue = normalizeEtaValue(cargo.window);
  if (!windowValue) {
    return '—';
  }

  if (windowValue.length <= OWNED_CARGO_ETA_MAX_LENGTH) {
    return windowValue;
  }

  return `${windowValue.slice(0, OWNED_CARGO_ETA_MAX_LENGTH - 1).trimEnd()}…`;
}
