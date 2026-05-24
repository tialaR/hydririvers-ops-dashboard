import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { MobileRouteDock } from '@/features/waterway-map/components/mobile/mobile-route-dock';
import { resolveCargoHydrowayMapModel } from '@/features/waterway-map/data/resolve-cargo-hydroway-model';
import { cargoWaterwayTrackingByCargoId } from '@/features/waterway-tracking/waterway-compat';
import {
  buildMobileRouteDockViewModel,
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

  it('renderiza dock compacto com test id e dados da rota', () => {
    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    const model = resolveCargoHydrowayMapModel(cargo!);
    const tracking = cargoWaterwayTrackingByCargoId.get('CARGO-001');
    const viewModel = buildMobileRouteDockViewModel(cargo!, model!, 15, tracking);

    const htmlClosed = renderToStaticMarkup(
      <MobileRouteDock viewModel={viewModel} onOpenDetails={() => undefined} />,
    );

    expect(htmlClosed).toContain('data-testid="hydroway-map-mobile-route-dock"');
    expect(htmlClosed).toContain('data-sheet-open="false"');

    const htmlOpen = renderToStaticMarkup(
      <MobileRouteDock viewModel={viewModel} sheetOpen onOpenDetails={() => undefined} />,
    );

    expect(htmlOpen).toContain('data-sheet-open="true"');

    const html = htmlClosed;
    expect(html).toContain('CARGO-001');
    expect(html).toContain('mobileRouteOpenDetails');
    expect(html).toContain('data-testid="hydroway-map-mobile-sync-pill"');
  });
});
