'use server';

import { getSessionUser } from '@/shared/server/auth';
import { readMock, upsertCargo } from '@/shared/server/mock-db';

export async function resolveOwnedCargoDocumentsAction(cargoId: string) {
  const user = await getSessionUser();
  if (!user || user.role !== 'shipper' || !user.approved) return { ok: false as const };

  const cargo = readMock('cargoes').find(
    (item) => item.id === cargoId && (item.ownerId === user.id || item.shipperId === user.id),
  );
  if (!cargo) return { ok: false as const };

  upsertCargo({
    ...cargo,
    documentReadiness: 100,
    requiredDocuments: cargo.requiredDocuments?.map((document) => ({ ...document, status: 'ok' })),
    operationalNextStep: 'Documentação validada. Avaliar propostas recebidas.',
    updatedAt: new Date().toISOString(),
  });

  return { ok: true as const };
}
