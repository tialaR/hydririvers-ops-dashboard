import { createAuthExperienceRepository } from '../repositories/auth-experience-repository-provider';

export async function getCurrentAuthUser() {
  return createAuthExperienceRepository().getCurrentUser();
}
