import { describe, expect, it } from 'vitest';

import {
  ICON_BUTTON_PRESS_RELEASE_MS,
  resolvePressStateAfterPointerDown,
  resolvePressStateAfterPointerUp,
} from '@/shared/components/icon-button/use-icon-button-press';

describe('useIconButtonPress state helpers', () => {
  it('pointer down inicia pressed quando habilitado', () => {
    expect(resolvePressStateAfterPointerDown(false)).toBe('pressed');
  });

  it('pointer down mantém idle quando disabled', () => {
    expect(resolvePressStateAfterPointerDown(true)).toBe('idle');
  });

  it('pointer up entra em release quando motion permitido', () => {
    expect(resolvePressStateAfterPointerUp(false, false)).toBe('release');
  });

  it('pointer up volta direto para idle com reduced motion', () => {
    expect(resolvePressStateAfterPointerUp(false, true)).toBe('idle');
  });

  it('pointer up mantém idle quando disabled', () => {
    expect(resolvePressStateAfterPointerUp(true, false)).toBe('idle');
  });

  it('release timer fica na janela curta de feedback', () => {
    expect(ICON_BUTTON_PRESS_RELEASE_MS).toBeGreaterThanOrEqual(120);
    expect(ICON_BUTTON_PRESS_RELEASE_MS).toBeLessThanOrEqual(360);
  });
});
