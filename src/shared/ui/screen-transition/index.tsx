'use client';

import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from '@/core/i18n/navigation';

const LOCALE_PREFIX = /^\/(pt-BR|en-US|es)(?=\/|$)/;

function normalizeNavigationHref(href: string): string {
  if (!href.startsWith('/')) {
    return href;
  }

  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const pathAndSearch = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const searchIndex = pathAndSearch.indexOf('?');
  const pathname = searchIndex >= 0 ? pathAndSearch.slice(0, searchIndex) : pathAndSearch;
  const search = searchIndex >= 0 ? pathAndSearch.slice(searchIndex) : '';
  const normalizedPathname = pathname.replace(LOCALE_PREFIX, '') || '/';

  return `${normalizedPathname}${search}${hash}`;
}

type ScreenTransitionProps = {
  children: ReactNode;
  className?: string;
};

export function ScreenTransition({
  children,
  className,
}: ScreenTransitionProps) {
  if (className) {
    return <div className={className}>{children}</div>;
  }

  return <>{children}</>;
}

export function useScreenTransitionNavigation() {
  const router = useRouter();

  const navigateWithTransition = useCallback(
    (href: string) => {
      router.push(normalizeNavigationHref(href));
    },
    [router],
  );

  const prefetchScreen = useCallback(
    (href: string) => {
      void router.prefetch(normalizeNavigationHref(href));
    },
    [router],
  );

  return {
    navigateWithTransition,
    prefetchScreen,
  };
}
