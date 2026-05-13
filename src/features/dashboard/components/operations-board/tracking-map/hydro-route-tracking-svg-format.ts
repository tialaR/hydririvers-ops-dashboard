/** Precisão estável para strings SVG (evita mismatch de hidratação server/client). */
export const SVG_NUMBER_PRECISION = 3;

export function formatSvgNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return Number(value.toFixed(SVG_NUMBER_PRECISION)).toString();
}

export function formatSvgCoordinatePair(point: readonly [number, number]): string {
  return `${formatSvgNumber(point[0])} ${formatSvgNumber(point[1])}`;
}
