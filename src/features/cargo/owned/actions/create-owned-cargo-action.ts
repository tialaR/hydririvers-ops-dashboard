'use server';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { commitPublishCargo } from '@/features/cargos/server/commit-publish-cargo';
import { getSessionUser, isNonEmptyText } from '@/shared/server/auth';

export type CreateOwnedCargoActionState =
  | { status: 'idle' }
  | { status: 'success'; cargoId: string }
  | { status: 'error'; code: 'unauthenticated' | 'forbidden' | 'missing-fields' | 'unknown' };

export async function createOwnedCargoAction(
  _previousState: CreateOwnedCargoActionState,
  formData: FormData,
): Promise<CreateOwnedCargoActionState> {
  try {
    const origin = formData.get('origin');
    const destination = formData.get('destination');
    const cargoType = formData.get('cargoType');
    const window = formData.get('window');
    const draft = formData.get('draft');

    if (![origin, destination, cargoType, window, draft].every((value) => isNonEmptyText(value))) {
      return { status: 'error', code: 'missing-fields' };
    }

    const payload: Partial<Cargo> = {
      origin: String(origin),
      destination: String(destination),
      cargoType: String(cargoType),
      window: String(window),
      volume: `Calado ${String(draft)} m`,
      title: `${String(cargoType)} · ${String(origin)} → ${String(destination)}`,
      status: 'open',
      visibility: 'public',
      operationalNextStep: 'Analisar propostas e concluir documentação.',
    };
    const result = commitPublishCargo(await getSessionUser(), payload);

    if (result.ok) return { status: 'success', cargoId: result.cargo.id };
    if (result.reason === 'unauthenticated') return { status: 'error', code: 'unauthenticated' };
    if (result.reason === 'forbidden-role' || result.reason === 'forbidden-unapproved') {
      return { status: 'error', code: 'forbidden' };
    }
    return { status: 'error', code: 'missing-fields' };
  } catch {
    return { status: 'error', code: 'unknown' };
  }
}
