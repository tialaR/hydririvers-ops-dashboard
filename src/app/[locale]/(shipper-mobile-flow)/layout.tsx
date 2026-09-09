import type { ReactNode } from 'react';

import { getCurrentAuthUser } from '@/features/auth/application/get-current-auth-user';
import { ProductShellProvider } from '@/features/product-shell/providers/product-shell-provider';

export default async function ShipperMobileFlowLayout({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentAuthUser();

  return <ProductShellProvider currentUser={currentUser}>{children}</ProductShellProvider>;
}
