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
  'port-santarem': 'Santarém',
  'port-manaus': 'Manaus',
  'port-maraba': 'Marabá',
  'terminal-belem-norte': 'Belém N.',
  'terminal-santarem-oeste': 'Santarém O.',
  'terminal-vila-conde': 'Vila Conde',
};

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
export function hydrowayPortLabelSortKey(featureId: string, kind: string): number {
  if (kind === 'terminal') return 90;
  if (featureId === 'port-belem' || featureId === 'port-santarem') return 80;
  if (featureId === 'port-maraba' || featureId === 'port-manaus') return 70;
  return 50;
}
