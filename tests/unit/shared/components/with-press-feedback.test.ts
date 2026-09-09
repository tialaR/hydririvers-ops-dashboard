import type { MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  BOTTOM_NAV_PRESS_DELAY_MS,
  runWithPressFeedback,
  shouldBypassPressFeedback,
} from '@/shared/components/bottom-nav/with-press-feedback';

function mockMouseEvent(overrides: Partial<MouseEvent> = {}): MouseEvent {
  return {
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    button: 0,
    preventDefault: vi.fn(),
    ...overrides,
  } as MouseEvent;
}

describe('with-press-feedback', () => {
  it('atraso padrão alinhado ao motion token (120–160ms)', () => {
    expect(BOTTOM_NAV_PRESS_DELAY_MS).toBeGreaterThanOrEqual(120);
    expect(BOTTOM_NAV_PRESS_DELAY_MS).toBeLessThanOrEqual(160);
  });

  it('executa ação imediata em ctrl/cmd/middle click', () => {
    const action = vi.fn();
    const event = mockMouseEvent({ ctrlKey: true });

    runWithPressFeedback(event, action);

    expect(action).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('mostra feedback antes da ação em clique primário', () => {
    vi.stubGlobal('window', {
      setTimeout: (callback: () => void, delay?: number) => setTimeout(callback, delay),
      clearTimeout: clearTimeout,
    });
    vi.useFakeTimers();
    const action = vi.fn();
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const event = mockMouseEvent();

    runWithPressFeedback(event, action, { onPressStart, onPressEnd, delayMs: 100 });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(action).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shouldBypassPressFeedback cobre modificadores e botão não primário', () => {
    expect(shouldBypassPressFeedback(mockMouseEvent())).toBe(false);
    expect(shouldBypassPressFeedback(mockMouseEvent({ metaKey: true }))).toBe(true);
    expect(shouldBypassPressFeedback(mockMouseEvent({ button: 1 }))).toBe(true);
  });
});
