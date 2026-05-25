import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { MobileRouteDock } from '@/features/waterway-map/components/mobile/mobile-route-dock';
import { resolveCargoHydrowayMapModel } from '@/features/waterway-map/data/resolve-cargo-hydroway-model';
import { cargoWaterwayTrackingByCargoId } from '@/features/waterway-tracking/waterway-compat';
import {
  buildMobileRouteDockViewModel,
  buildMobileRouteSheetViewModel,
  resolveMobileSyncStatus,
} from '@/features/waterway-map/utils/mobile-route-view-model';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    if (namespace === 'common') return `common.${key}`;
    return key;
  },
}));

describe('mobile route dock foundation', () => {
  it('monta view model determinístico para CARGO-001', () => {
    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    const model = resolveCargoHydrowayMapModel(cargo!);
    const tracking = cargoWaterwayTrackingByCargoId.get('CARGO-001');

    expect(cargo).toBeDefined();
    expect(model).not.toBeNull();

    const viewModel = buildMobileRouteDockViewModel(cargo!, model!, 15, tracking);

    expect(viewModel.cargoId).toBe('CARGO-001');
    expect(viewModel.originLabel).toBeTruthy();
    expect(viewModel.destinationLabel).toBeTruthy();
    expect(viewModel.progressPercent).toBe(15);
    expect(viewModel.syncStatus).toBe(resolveMobileSyncStatus(cargo!, tracking));
    expect(viewModel.syncStatus).toBe('online');
  });

  it('sheet view model separa rota humana e referência técnica para CARGO-001', () => {
    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    const model = resolveCargoHydrowayMapModel(cargo!);
    const tracking = cargoWaterwayTrackingByCargoId.get('CARGO-001');
    const viewModel = buildMobileRouteSheetViewModel(cargo!, model!, 15, tracking);

    expect(viewModel.originLabel).toBe('Belém');
    expect(viewModel.destinationLabel).toBe('Santarém');
    expect(viewModel.routeTechnicalRef).toBe('port-belem → port-santarem');
    expect(viewModel.nextSegmentLabel).toBe('Abaetetuba');
    expect(viewModel.nextSegmentStatusKey).toBe('mobileRouteNextStatusAttention');
  });

  it('renderiza dock passivo compacto sem CTA nem gatilho de sheet', () => {
    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    const model = resolveCargoHydrowayMapModel(cargo!);
    const tracking = cargoWaterwayTrackingByCargoId.get('CARGO-001');
    const viewModel = buildMobileRouteDockViewModel(cargo!, model!, 15, tracking);

    const htmlClosed = renderToStaticMarkup(<MobileRouteDock viewModel={viewModel} />);

    expect(htmlClosed).toContain('data-testid="hydroway-map-mobile-route-dock"');
    expect(htmlClosed).not.toContain('data-sheet-open');
    expect(htmlClosed).not.toContain('role="button"');
    expect(htmlClosed).not.toContain('mobileRouteOpenDetails');
    expect(htmlClosed).not.toContain('aria-expanded');
    expect(htmlClosed).toContain('role="region"');
    expect(htmlClosed).toContain('CARGO-001');
    expect(htmlClosed).toContain('data-testid="hydroway-map-mobile-sync-pill"');

    const htmlOpen = renderToStaticMarkup(<MobileRouteDock viewModel={viewModel} sheetOpen />);

    expect(htmlOpen).toContain('dockSheetOpen');
    expect(htmlOpen).not.toContain('role="button"');
  });
});
