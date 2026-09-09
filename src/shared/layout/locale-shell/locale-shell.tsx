'use client';

import type { ReactNode } from 'react';

import { AdminChrome } from '@/shared/layout/admin-chrome/admin-chrome';

type LocaleShellProps = {
  children: ReactNode;
};

/** Product shell — AdminChrome for routes under `(product-shell)` only. */
export function LocaleShell({ children }: LocaleShellProps) {
  return <AdminChrome>{children}</AdminChrome>;
}
