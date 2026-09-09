import type { AuthExperienceUser } from '../domain/auth-experience-types';
import { getSessionUser } from '@/shared/server/auth';

export async function getCurrentAuthUser(): Promise<AuthExperienceUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== 'shipper') return null;

  return {
    id: user.id,
    name: user.name,
    company: user.company,
    role: 'shipper',
    avatarInitials: user.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(''),
    locale: 'pt-BR',
  };
}
