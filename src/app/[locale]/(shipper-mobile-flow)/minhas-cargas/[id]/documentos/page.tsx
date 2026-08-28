import { notFound } from 'next/navigation';

import { getOwnedCargoById } from '@/features/cargo/owned/application/get-owned-cargo-by-id';
import { getOwnedCargoDocuments } from '@/features/cargo/owned/application/get-owned-cargo-documents';

import { OwnedCargoDocumentsRouteClient } from './owned-cargo-documents-route-client';

type PageProps = { params: Promise<{ id: string }> };

export default async function DocumentsPage({ params }: PageProps) {
  const { id } = await params;
  const cargo = await getOwnedCargoById(id);
  if (!cargo) notFound();
  const documents = await getOwnedCargoDocuments(id);
  return <OwnedCargoDocumentsRouteClient cargo={cargo} documents={documents} />;
}
