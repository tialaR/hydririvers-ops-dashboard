import type { AuthExperienceUser, AuthPhoneCountryOption } from './auth-experience-types';

export type AuthExperienceRepository = {
  getCurrentUser(): Promise<AuthExperienceUser>;
  getPhoneCountries(): Promise<AuthPhoneCountryOption[]>;
  getMockOtp(): Promise<string>;
};
