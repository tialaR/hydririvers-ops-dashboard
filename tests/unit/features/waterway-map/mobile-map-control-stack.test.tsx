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
    'aria-label': ariaLabel,
    onClick,
  }: {
    'data-testid'?: string;
    'aria-pressed'?: boolean;
    'aria-label'?: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      onClick={onClick}
    />
  ),
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

  it('mantém stack visível e interativa quando o sheet está fechado', () => {
    const html = renderToStaticMarkup(
      <MobileMapControlStack
        runtime={runtime}
        routeDetailsOpen={false}
        onOpenRouteDetails={() => undefined}
        onToggleLayers={() => undefined}
      />,
    );

    expect(html).toContain('data-testid="hydroway-map-mobile-control-stack"');
    expect(html).toContain('data-sheet-open="false"');
    expect(html).toContain('data-testid="hydroway-map-mobile-route-details-button"');
    expect(html).toContain('aria-label="mobileRouteOpenDetailsAria"');
    expect(html).not.toContain('aria-hidden="true"');
    expect(html).not.toContain('inert');
    expect(html).not.toContain('stackSuppressed');
  });

  it('mantém stack visível quando o sheet está aberto', () => {
    const html = renderToStaticMarkup(
      <MobileMapControlStack
        runtime={runtime}
        routeDetailsOpen
        routeSheetSnap="partial"
        onOpenRouteDetails={() => undefined}
        onToggleLayers={() => undefined}
      />,
    );

    expect(html).toContain('data-sheet-open="true"');
    expect(html).toContain('data-sheet-snap="partial"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain('aria-hidden="true"');
    expect(html).not.toContain('inert');
    expect(html).toContain('data-testid="hydroway-map-mobile-focus-origin-button"');
  });
});
