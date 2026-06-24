import { listShipperCargoes } from '@/features/shipper-mobile-flow/application/list-shipper-cargoes';
import { MyCargoesScreen } from '@/features/shipper-mobile-flow/screens/my-cargoes-screen';

export default async function MyCargoesPage() {
  const initialCargoes = await listShipperCargoes();
  return <MyCargoesScreen initialCargoes={initialCargoes} />;
}
