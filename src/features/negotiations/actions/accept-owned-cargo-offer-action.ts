'use server';

import { getSessionUser } from '@/shared/server/auth';
import { readMock, writeMock } from '@/shared/server/mock-db';

export async function acceptOwnedCargoOfferAction(cargoId: string, offerId: string) {
  const user = await getSessionUser();
  if (!user || user.role !== 'shipper' || !user.approved) return { ok: false as const };

  const cargoes = readMock('cargoes');
  const cargo = cargoes.find(
    (item) => item.id === cargoId && (item.ownerId === user.id || item.shipperId === user.id),
  );
  if (!cargo) return { ok: false as const };

  const negotiations = readMock('negotiations');
  const target = negotiations.find(
    (item) => item.id === offerId && (item.cargoId === cargo.id || item.cargoTitle === cargo.title),
  );
  if (!target) return { ok: false as const };

  const now = new Date().toISOString();
  writeMock(
    'negotiations',
    negotiations.map((negotiation) =>
      negotiation.id === offerId
        ? {
            ...negotiation,
            cargoId: cargo.id,
            shipperId: user.id,
            status: 'accepted',
            stage: 'contract',
            lastUpdate: now,
            history: [
              ...(negotiation.history ?? []),
              { title: 'Proposta aceita', description: `Aceite realizado por ${user.company}.`, date: now },
            ],
          }
        : negotiation,
    ),
  );
  writeMock(
    'cargoes',
    cargoes.map((item) =>
      item.id === cargo.id
        ? { ...item, status: 'reserved', operationalNextStep: 'Concluir contratação e janela de embarque.', updatedAt: now }
        : item,
    ),
  );

  return { ok: true as const };
}
