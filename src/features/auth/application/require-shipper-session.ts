import 'server-only';

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/shared/server/auth';

export async function requireShipperSession(locale: string) {
  const user = await getSessionUser();
  if (!user || user.role !== 'shipper' || !user.approved) {
    redirect(`/${locale}/entrar?next=/${locale}/minhas-cargas`);
  }
  return user;
}
