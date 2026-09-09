import type { ReactNode } from 'react';
import { requireShipperSession } from '@/features/auth/application/require-shipper-session';

export default async function OwnedCargoLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireShipperSession(locale);

  return children;
}
