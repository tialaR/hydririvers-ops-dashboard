import type { ReactNode } from 'react';

import { LocaleShell } from '@/shared/layout/locale-shell';

type ProductShellLayoutProps = {
  children: ReactNode;
};

/**
 * Product routes shell — AdminChrome, global header and mobile bottom nav.
 * Dev lab routes under `/[locale]/dev` are siblings and do not use this layout.
 */
export default function ProductShellLayout({ children }: ProductShellLayoutProps) {
  return <LocaleShell>{children}</LocaleShell>;
}
