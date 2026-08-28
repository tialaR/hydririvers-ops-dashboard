import type { PublicCargoRecord, PublicCargoSafeView } from './public-cargo-types';

export function toPublicCargoSafeView(cargo: PublicCargoRecord): PublicCargoSafeView {
  return { ...cargo };
}

export function filterPublicCargoList(cargoes: PublicCargoRecord[]): PublicCargoSafeView[] {
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
