'use client';

import { useEffect, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { appRoutes, localizedAppPath } from '@/shared/routing/app-routes';
import type { AppLocale } from '@/shared/routing/route-types';
import { MyCargoesListSkeleton } from '../my-cargoes-list/my-cargoes-list-skeleton';

type MinhasCargasAuthGateProps = {
  children: ReactNode;
};

/**
 * Client guard for `/minhas-cargas` — neutral skeleton until session resolves;
 * redirects to login with `next` when unauthenticated (no private content flash).
 */
export function MinhasCargasAuthGate({ children }: MinhasCargasAuthGateProps) {
  const { user, ready } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;

  useEffect(() => {
    if (!ready || user) return;
    const nextPath = localizedAppPath(locale, pathname);
    router.replace(appRoutes.auth.login(locale, nextPath));
  }, [ready, user, router, locale, pathname]);

  if (!ready || !user) {
    return <MyCargoesListSkeleton />;
  }

  return children;
}
