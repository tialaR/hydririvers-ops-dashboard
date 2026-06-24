import type { ShipperPhoneCountry, ShipperUser } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export type UserRepository = {
  getCurrentShipperUser(): Promise<ShipperUser>;
  getPhoneCountries(): Promise<ShipperPhoneCountry[]>;
  getMockOtp(): Promise<string>;
};
