import type { ReactNode } from 'react';

import { getCurrentShipperUser } from '@/features/shipper-mobile-flow/application/get-current-shipper-user';
import { ShipperFlowProvider } from '@/features/shipper-mobile-flow/providers/shipper-flow-provider';

export default async function ShipperMobileFlowLayout({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentShipperUser();

  return <ShipperFlowProvider currentUser={currentUser}>{children}</ShipperFlowProvider>;
}
