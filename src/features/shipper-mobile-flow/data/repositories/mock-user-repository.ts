import { SHIPPER_MOCK_OTP, SHIPPER_PHONE_COUNTRIES } from '@/features/shipper-mobile-flow/data/mock/shipper-auth-mock';
import { SHIPPER_MOCK_USER } from '@/features/shipper-mobile-flow/data/mock/shipper-user-mock';
import type { UserRepository } from '@/features/shipper-mobile-flow/domain/repositories/user-repository';

export const mockUserRepository: UserRepository = {
  async getCurrentShipperUser() {
    return SHIPPER_MOCK_USER;
  },

  async getPhoneCountries() {
    return SHIPPER_PHONE_COUNTRIES;
  },

  async getMockOtp() {
    return SHIPPER_MOCK_OTP;
  }
};
