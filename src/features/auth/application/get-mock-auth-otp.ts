import { createAuthExperienceRepository } from '../repositories/auth-experience-repository-provider';

export async function getMockAuthOtp() {
  return createAuthExperienceRepository().getMockOtp();
}
