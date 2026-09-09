import { notFound } from 'next/navigation';

import { getOwnedCargoById } from '@/features/cargo/owned/application/get-owned-cargo-by-id';
import { getOwnedCargoDocuments } from '@/features/cargo/owned/application/get-owned-cargo-documents';

import { OwnedCargoDocumentsRouteClient } from './owned-cargo-documents-route-client';
import { requireShipperSession } from '@/features/auth/application/require-shipper-session';

type PageProps = { params: Promise<{ id: string; locale: string }> };

export default async function DocumentsPage({ params }: PageProps) {
  const { id, locale } = await params;
  const user = await requireShipperSession(locale);
  const cargo = await getOwnedCargoById(id, user.id);
  if (!cargo) notFound();
  const documents = await getOwnedCargoDocuments(id, user.id);
  return <OwnedCargoDocumentsRouteClient cargo={cargo} documents={documents} />;
}
