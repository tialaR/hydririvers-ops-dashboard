import { describe, expect, it } from 'vitest';

import {
  resolveBottomSheetInitialSnapIndex,
  resolveBottomSheetSnapOrder,
} from '@/shared/components/bottom-sheet/BottomSheet';
import {
  buildBottomSheetSnapMetrics,
  parseViewportLengthToPx,
  resolveSnapIndexFromTranslate,
} from '@/shared/components/bottom-sheet/bottom-sheet-snap-math';

describe('BottomSheet snap helpers', () => {
  const snapHeights = {
    partial: '38dvh',
    expanded: '82dvh',
  };

  it('ordena snaps com initialSnap em primeiro índice', () => {
    expect(resolveBottomSheetSnapOrder(snapHeights, ['partial', 'expanded'], 'partial')).toEqual([
      'partial',
      'expanded',
    ]);
    expect(resolveBottomSheetInitialSnapIndex(['partial', 'expanded'], 'partial')).toBe(0);
    expect(resolveBottomSheetInitialSnapIndex(['partial', 'expanded'], 'expanded')).toBe(1);
  });

  it('usa ordem explícita quando initialSnap não está na lista', () => {
    expect(resolveBottomSheetSnapOrder(snapHeights, ['partial', 'expanded'], undefined)).toEqual([
      'partial',
      'expanded',
    ]);
    expect(resolveBottomSheetInitialSnapIndex(['partial', 'expanded'], undefined)).toBe(0);
  });
});

describe('bottom-sheet-snap-math', () => {
  it('converte dvh em pixels com base na viewport', () => {
    expect(parseViewportLengthToPx('36dvh', 800)).toBe(288);
    expect(parseViewportLengthToPx('45dvh', 800)).toBe(360);
    expect(parseViewportLengthToPx('95dvh', 800)).toBe(760);
  });

  it('calcula offsets de translate para partial e expanded', () => {
    const metrics = buildBottomSheetSnapMetrics(
      { partial: '36dvh', expanded: '95dvh' },
      ['partial', 'expanded'],
      800,
      0,
    );

    expect(metrics.maxHeightPx).toBe(760);
    expect(metrics.heightsPx).toEqual([288, 760]);
    expect(metrics.offsetsPx).toEqual([472, 0]);
    expect(metrics.closedTranslatePx).toBe(760);
  });

  it('resolve snap mais próximo e fecha abaixo do threshold', () => {
    const offsets = [400, 0];
    expect(resolveSnapIndexFromTranslate(480, offsets, 0, 72)).toEqual({ index: 0, shouldClose: true });
    expect(resolveSnapIndexFromTranslate(180, offsets, -0.4, 72)).toEqual({ index: 1, shouldClose: false });
    expect(resolveSnapIndexFromTranslate(360, offsets, 0, 72)).toEqual({ index: 0, shouldClose: false });
  });
});
