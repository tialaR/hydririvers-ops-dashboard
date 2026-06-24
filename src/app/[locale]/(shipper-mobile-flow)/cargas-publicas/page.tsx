import { listPublicCargoes } from '@/features/shipper-mobile-flow/application/list-public-cargoes';
import { PublicCargoesScreen } from '@/features/shipper-mobile-flow/screens/public-cargoes-screen';

export default async function PublicCargoesPage() {
  const initialCargoes = await listPublicCargoes();
  return <PublicCargoesScreen initialCargoes={initialCargoes} />;
}
