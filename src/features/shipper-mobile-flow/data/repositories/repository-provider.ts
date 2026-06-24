import { mockCargoRepository } from '@/features/shipper-mobile-flow/data/repositories/mock-cargo-repository';
import { mockHydroRepository } from '@/features/shipper-mobile-flow/data/repositories/mock-hydro-repository';
import { mockNotificationRepository } from '@/features/shipper-mobile-flow/data/repositories/mock-notification-repository';
import { mockPublicCargoRepository } from '@/features/shipper-mobile-flow/data/repositories/mock-public-cargo-repository';
import { mockUserRepository } from '@/features/shipper-mobile-flow/data/repositories/mock-user-repository';
import type { CargoRepository } from '@/features/shipper-mobile-flow/domain/repositories/cargo-repository';
import type { HydroRepository } from '@/features/shipper-mobile-flow/domain/repositories/hydro-repository';
import type { NotificationRepository } from '@/features/shipper-mobile-flow/domain/repositories/notification-repository';
import type { PublicCargoRepository } from '@/features/shipper-mobile-flow/domain/repositories/public-cargo-repository';
import type { UserRepository } from '@/features/shipper-mobile-flow/domain/repositories/user-repository';

export type ShipperMobileRepositories = {
  cargo: CargoRepository;
  publicCargo: PublicCargoRepository;
  hydro: HydroRepository;
  notification: NotificationRepository;
  user: UserRepository;
};

export function createShipperMobileRepositories(): ShipperMobileRepositories {
  return {
    cargo: mockCargoRepository,
    publicCargo: mockPublicCargoRepository,
    hydro: mockHydroRepository,
    notification: mockNotificationRepository,
    user: mockUserRepository
  };
}
