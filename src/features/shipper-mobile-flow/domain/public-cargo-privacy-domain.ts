import type { ShipperPublicCargo } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

/** Fields safe to expose on public cargo cards — v5 privacy gate. */
export type PublicCargoSafeView = Pick<
  ShipperPublicCargo,
  'id' | 'corridorId' | 'origin' | 'destination' | 'cargoTypeKey' | 'windowLabelKey' | 'statusKey' | 'riskLevel'
>;

export function toPublicCargoSafeView(cargo: ShipperPublicCargo): PublicCargoSafeView {
  return {
    id: cargo.id,
    corridorId: cargo.corridorId,
    origin: cargo.origin,
    destination: cargo.destination,
    cargoTypeKey: cargo.cargoTypeKey,
    windowLabelKey: cargo.windowLabelKey,
    statusKey: cargo.statusKey,
    riskLevel: cargo.riskLevel
  };
}

export function filterPublicCargoList(cargoes: ShipperPublicCargo[]): PublicCargoSafeView[] {
  return cargoes.map(toPublicCargoSafeView);
}

const CORRIDOR_I18N_KEY: Record<string, 'amazonasSolimoes' | 'madeira' | 'tapajos' | 'tocantinsAraguaia'> = {
  'amazonas-solimoes': 'amazonasSolimoes',
  madeira: 'madeira',
  tapajos: 'tapajos',
  'tocantins-araguaia': 'tocantinsAraguaia'
};

export function resolvePublicCorridorI18nKey(corridorId: string) {
  return CORRIDOR_I18N_KEY[corridorId] ?? 'tapajos';
}
