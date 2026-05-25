export function parseViewportLengthToPx(length: string, viewportHeight: number): number {
  const trimmed = length.trim();
  const match = trimmed.match(/^([\d.]+)(dvh|vh|svh|px)$/i);
  if (!match) return 0;
  const value = Number.parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 'px') return value;
  return (value / 100) * viewportHeight;
}

export type BottomSheetSnapMetrics = {
  maxHeightPx: number;
  heightsPx: number[];
  offsetsPx: number[];
  closedTranslatePx: number;
};

export function buildBottomSheetSnapMetrics(
  snapHeights: Record<string, string>,
  orderedIds: string[],
  viewportHeight: number,
  safeAreaBottomPx = 0,
): BottomSheetSnapMetrics {
  const heightsPx = orderedIds.map((id) => parseViewportLengthToPx(snapHeights[id] ?? '0', viewportHeight));
  const maxHeightPx = Math.max(0, ...heightsPx);
  const offsetsPx = heightsPx.map((heightPx) => Math.max(0, maxHeightPx - heightPx));
  const closedTranslatePx = maxHeightPx + safeAreaBottomPx;
  return { maxHeightPx, heightsPx, offsetsPx, closedTranslatePx };
}

export function readSafeAreaInsetBottomPx(): number {
  if (typeof document === 'undefined') return 0;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;padding-bottom:env(safe-area-inset-bottom,0px);';
  document.body.appendChild(probe);
  const value = Number.parseFloat(window.getComputedStyle(probe).paddingBottom) || 0;
  document.body.removeChild(probe);
  return value;
}

export function resolveSnapIndexFromTranslate(
  translatePx: number,
  offsetsPx: number[],
  velocityY: number,
  closeThresholdPx: number,
): { index: number; shouldClose: boolean } {
  if (!offsetsPx.length) {
    return { index: 0, shouldClose: false };
  }

  const lowestOffset = offsetsPx[0];
  if (translatePx > lowestOffset + closeThresholdPx) {
    return { index: 0, shouldClose: true };
  }

  const projected = translatePx + velocityY * 0.12;
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  offsetsPx.forEach((offset, index) => {
    const distance = Math.abs(projected - offset);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return { index: nearestIndex, shouldClose: false };
}
