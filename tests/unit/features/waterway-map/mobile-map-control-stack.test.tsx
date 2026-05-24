import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { MobileMapControlStack } from '@/features/waterway-map/components/mobile/mobile-map-control-stack';
import type { HydrowayMapRuntime } from '@/features/waterway-map/hooks/use-hydroway-map-runtime';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/features/waterway-map/components/shared/hydroway-map-floating-action', () => ({
  HydrowayMapFloatingAction: ({
    'data-testid': testId,
    'aria-pressed': ariaPressed,
  }: {
    'data-testid'?: string;
    'aria-pressed'?: boolean;
  }) => <button type="button" data-testid={testId} aria-pressed={ariaPressed} />,
}));

function createRuntimeStub(): HydrowayMapRuntime {
  return {
    mapLibreControlsDisabled: false,
    layerPresetPanelOpen: false,
    handleCenterCurrentCargo: () => undefined,
    handleFitRoute: () => undefined,
    handleFocusDestination: () => undefined,
    handleFocusOrigin: () => undefined,
    handleZoomIn: () => undefined,
    handleZoomOut: () => undefined,
  } as HydrowayMapRuntime;
}

describe('mobile map control stack', () => {
  const runtime = createRuntimeStub();

  it('mantém stack interativa quando o sheet está fechado', () => {
    const html = renderToStaticMarkup(
      <MobileMapControlStack
        runtime={runtime}
        isSuppressed={false}
        infoOpen={false}
        onToggleInfo={() => undefined}
        onToggleLayers={() => undefined}
      />,
    );

    expect(html).toContain('data-testid="hydroway-map-mobile-control-stack"');
    expect(html).toContain('data-suppressed="false"');
    expect(html).not.toContain('aria-hidden="true"');
    expect(html).not.toContain('inert');
  });

  it('suprime stack quando o sheet está aberto', () => {
    const html = renderToStaticMarkup(
      <MobileMapControlStack
        runtime={runtime}
        isSuppressed
        infoOpen
        onToggleInfo={() => undefined}
        onToggleLayers={() => undefined}
      />,
    );

    expect(html).toContain('data-suppressed="true"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('inert');
    expect(html).toContain('aria-pressed="true"');
  });
});
