import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { MobileMapLayerPanel } from '@/features/waterway-map/components/mobile/mobile-map-layer-panel';
import type { HydrowayMapRuntime } from '@/features/waterway-map/hooks/use-hydroway-map-runtime';

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string, values?: { mode?: string }) => {
    if (namespace === 'operationsBoard.map' && key === 'layersCurrent' && values?.mode) {
      return `layersCurrent:${values.mode}`;
    }
    return `${namespace}.${key}`;
  },
}));

function createRuntimeStub(): HydrowayMapRuntime {
  return {
    layerPresetPanelOpen: true,
    activeOperationalLayerMode: 'operation',
    operationalLayerModeOrder: ['operation', 'navigation', 'logistics', 'risk', 'government'],
    layerPresetControlsEnabled: true,
    handleSelectOperationalLayerMode: () => undefined,
    handleCloseLayerPresetPanel: () => undefined,
    handleLayerPresetPanelPointerEnter: () => undefined,
    handleLayerPresetPanelPointerLeave: () => undefined,
  } as unknown as HydrowayMapRuntime;
}

describe('MobileMapLayerPanel', () => {
  it('renderiza painel com modos operacionais', () => {
    const html = renderToStaticMarkup(<MobileMapLayerPanel runtime={createRuntimeStub()} />);

    expect(html).toContain('data-testid="hydroway-layer-panel"');
    expect(html).toContain('data-testid="hydroway-layer-mode-navigation"');
    expect(html).toContain('layersCurrent:');
    expect(html).not.toContain('mapCloseLayers');
    expect(html).toContain('data-panel-state="closed"');
  });
});
