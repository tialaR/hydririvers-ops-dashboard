/** @deprecated Import from `@/features/shipper-mobile-flow/data/mock/*` or use application use cases. */
export { SHIPPER_MOCK_OTP, SHIPPER_PHONE_COUNTRIES } from '@/features/shipper-mobile-flow/data/mock/shipper-auth-mock';
export {
  SHIPPER_COCKPIT_METRICS,
  SHIPPER_DEFAULT_CARGO_ID,
  SHIPPER_DOCUMENTS,
  SHIPPER_OFFERS,
  SHIPPER_OWNED_CARGOES
} from '@/features/shipper-mobile-flow/data/mock/shipper-cargo-mock';
export {
  SHIPPER_CO2_BAR_SERIES,
  SHIPPER_HYDROLOGY_BASINS,
  SHIPPER_IMPACT_METRICS,
  SHIPPER_LANDING_CHART,
  SHIPPER_RIVER_LEVEL_SERIES
} from '@/features/shipper-mobile-flow/data/mock/shipper-hydro-mock';
export { SHIPPER_NOTIFICATIONS } from '@/features/shipper-mobile-flow/data/mock/shipper-notification-mock';
export { SHIPPER_PUBLIC_CARGOES } from '@/features/shipper-mobile-flow/data/mock/shipper-public-cargo-mock';
export { SHIPPER_MOCK_USER } from '@/features/shipper-mobile-flow/data/mock/shipper-user-mock';

import { SHIPPER_OWNED_CARGOES } from '@/features/shipper-mobile-flow/data/mock/shipper-cargo-mock';
import { SHIPPER_PUBLIC_CARGOES } from '@/features/shipper-mobile-flow/data/mock/shipper-public-cargo-mock';
import type { ShipperOwnedCargo, ShipperPublicCargo } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

/** @deprecated Use `getShipperCargoById` use case. */
export function getShipperOwnedCargo(id: string): ShipperOwnedCargo | undefined {
  return SHIPPER_OWNED_CARGOES.find((cargo) => cargo.id === id);
}

/** @deprecated Use `getPublicCargoById` use case. */
export function getShipperPublicCargo(id: string): ShipperPublicCargo | undefined {
  return SHIPPER_PUBLIC_CARGOES.find((cargo) => cargo.id === id);
}
