import { listPublicCargoes } from '@/features/cargo/public/application/list-public-cargoes';

import { PublicCargoesRouteClient } from './public-cargoes-route-client';

export default async function PublicCargoesPage() {
  const initialCargoes = await listPublicCargoes();
  return <PublicCargoesRouteClient initialCargoes={initialCargoes} />;
}
