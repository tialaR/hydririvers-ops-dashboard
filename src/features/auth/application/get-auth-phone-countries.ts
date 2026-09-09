import { createAuthExperienceRepository } from '../repositories/auth-experience-repository-provider';

export async function getAuthPhoneCountries() {
  return createAuthExperienceRepository().getPhoneCountries();
}
