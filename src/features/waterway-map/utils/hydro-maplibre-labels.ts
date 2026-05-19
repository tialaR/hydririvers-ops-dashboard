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
