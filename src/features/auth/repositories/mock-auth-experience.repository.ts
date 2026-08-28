import type { AuthExperienceRepository } from '../domain/auth-experience-repository';
import {
  AUTH_EXPERIENCE_MOCK_OTP,
  AUTH_EXPERIENCE_MOCK_USER,
  AUTH_EXPERIENCE_PHONE_COUNTRIES
} from '../mocks/auth-experience.mock';

export const mockAuthExperienceRepository: AuthExperienceRepository = {
  async getCurrentUser() {
    return AUTH_EXPERIENCE_MOCK_USER;
  },

  async getPhoneCountries() {
    return AUTH_EXPERIENCE_PHONE_COUNTRIES;
  },

  async getMockOtp() {
    return AUTH_EXPERIENCE_MOCK_OTP;
  }
};
