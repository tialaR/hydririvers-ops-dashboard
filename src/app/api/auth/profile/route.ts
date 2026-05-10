import type { HydroUser } from '@/features/auth/domain/auth.types';
import { profileFormSchema } from '@/features/auth/domain/profile.schema';
import { getSessionUser, toPublicUser } from '@/shared/server/auth';
import { invalidPayload, unauthenticated } from '@/shared/server/api-errors';
import { upsertUser } from '@/shared/server/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  const current = await getSessionUser();
  if (!current) return unauthenticated();

  const payload = await request.json().catch(() => null);
  if (!payload) return invalidPayload('invalid-json');

  const parsed = profileFormSchema.safeParse(payload);
  if (!parsed.success) {
    return invalidPayload('missing-required-fields');
  }

  const user: HydroUser = {
    ...current,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    company: parsed.data.company,
    phone: parsed.data.phone,
    city: parsed.data.city,
    avatarUrl: parsed.data.avatarUrl,
    id: current.id,
    role: current.role,
    approved: current.approved,
    passwordHash: current.passwordHash
  };

  upsertUser(user);
  return Response.json({ user: toPublicUser(user) });
}
