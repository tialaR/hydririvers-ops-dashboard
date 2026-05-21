import type { HydrowayGeoRichMetadata } from '../domain/hydroway-geo.types';

/** Remove sufixos de fixture mock para exibição no mapa (dados continuam fictícios no backend). */
export function sanitizeHydrowayDisplayLabel(name: string): string {
  return name
    .replace(/\s*\(mock\)\s*/gi, ' ')
    .replace(/\s*\[mock\]\s*/gi, ' ')
    .replace(/\s*-\s*mock\s*$/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Abrevia rótulos longos de porto/terminal para evitar poluição. */
export function abbreviateHydrowayPortLabel(name: string, maxLength = 22): string {
  const clean = sanitizeHydrowayDisplayLabel(name);
  if (clean.length <= maxLength) return clean;
  const words = clean.split(/\s+/);
  if (words.length <= 2) return `${clean.slice(0, maxLength - 1)}…`;
  return `${words[0]} ${words[words.length - 1]}`;
}

const PORT_LABEL_SHORT: Record<string, string> = {
  'port-belem': 'Belém',
  'port-barcarena': 'Barcarena',
  'port-santarem': 'Santarém',
  'port-manaus': 'Manaus',
  'port-maraba': 'Marabá',
  'port-itacoatiara': 'Itacoatiara',
  'port-porto-velho': 'Porto Velho',
  'port-itaituba': 'Itaituba',
  'port-obidos': 'Óbidos',
  'port-breves': 'Breves',
  'port-juruti': 'Juruti',
  'port-altamira': 'Altamira',
  'port-prainha': 'Prainha',
  'terminal-belem-norte': 'Belém N.',
  'terminal-santarem-oeste': 'Santarém O.',
  'terminal-vila-conde': 'Vila Conde',
  'terminal-miritituba': 'Miritituba',
  'transshipment-belem-mosqueiro': 'Mosqueiro',
  'transshipment-santarem-tapajos': 'Sant. Tapajós',
};

const WATERWAY_LABEL_SHORT: Record<string, string> = {
  'amazonas-solimoes': 'Amazonas / Solimões',
  madeira: 'Madeira',
  tapajos: 'Tapajós',
  tocantins: 'Tocantins',
  'para-estuario': 'Estuário Pará',
  araguaia: 'Araguaia',
};

/** symbol-sort-key a partir de importance/priority (V2.7 — evita embolo de rótulos). */
export function hydrowayImportanceSortKey(
  importance?: HydrowayGeoRichMetadata['importance'],
  priority?: number,
): number {
  if (typeof priority === 'number' && Number.isFinite(priority)) {
    return Math.round(priority);
  }
  switch (importance) {
    case 'critical':
      return 100;
    case 'high':
      return 80;
    case 'medium':
      return 60;
    case 'low':
      return 40;
    default:
      return 50;
  }
}

/** Rótulo curto ao longo da hidrovia (symbol-placement: line). */
export function resolveHydrowayWaterwayDisplayLabel(
  featureId: string,
  name: string,
  waterwayCode?: string,
): string {
  const short = WATERWAY_LABEL_SHORT[featureId];
  if (short) return short;
  if (waterwayCode === 'HN-100') return 'Amazonas / Solimões';

  const clean = sanitizeHydrowayDisplayLabel(name);
  const withoutRio = clean.replace(/^Rio\s+/i, '').trim();
  return abbreviateHydrowayPortLabel(withoutRio || clean, 26);
}

/** Rótulo curto para symbol layer — evita embolo em clusters operacionais. */
export function resolveHydrowayPortDisplayLabel(
  featureId: string,
  name: string,
  kind: string,
): string {
  const short = PORT_LABEL_SHORT[featureId];
  if (short) return short;

  const clean = sanitizeHydrowayDisplayLabel(name);
  const withoutPrefix = clean
    .replace(/^Porto Interior\s+/i, '')
    .replace(/^Terminal\s+/i, '')
    .trim();

  return abbreviateHydrowayPortLabel(withoutPrefix || clean, kind === 'terminal' ? 18 : 16);
}

/** symbol-sort-key: terminais e portos principais acima de secundários. */
export function hydrowayPortLabelSortKey(
  featureId: string,
  kind: string,
  importance?: HydrowayGeoRichMetadata['importance'],
  priority?: number,
): number {
  const base = hydrowayImportanceSortKey(importance, priority);
  if (kind === 'terminal') return base + 8;
  if (featureId === 'port-belem' || featureId === 'port-santarem') return Math.max(base, 85);
  if (featureId === 'port-maraba' || featureId === 'port-manaus') return Math.max(base, 78);
  return base;
}
