import { notFound } from 'next/navigation';
import { DocumentsScreen } from '@/features/shipper-mobile-flow/screens/documents-screen';
import { getShipperCargoById } from '@/features/shipper-mobile-flow/application/get-shipper-cargo-by-id';
import { getShipperDocuments } from '@/features/shipper-mobile-flow/application/get-shipper-documents';

type PageProps = { params: Promise<{ id: string }> };

export default async function DocumentsPage({ params }: PageProps) {
  const { id } = await params;
  const cargo = await getShipperCargoById(id);
  if (!cargo) notFound();
  const documents = await getShipperDocuments(id);
  return <DocumentsScreen cargo={cargo} documents={documents} />;
}
