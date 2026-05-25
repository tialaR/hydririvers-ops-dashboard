import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { MobileRouteSheetPartialSummary } from '@/features/waterway-map/components/mobile/mobile-route-sheet-partial-summary';
import { resolveCargoHydrowayMapModel } from '@/features/waterway-map/data/resolve-cargo-hydroway-model';
import { cargoWaterwayTrackingByCargoId } from '@/features/waterway-tracking/waterway-compat';
import { buildMobileRouteSheetViewModel } from '@/features/waterway-map/utils/mobile-route-view-model';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('MobileRouteSheetPartialSummary', () => {
  it('renderiza métricas operacionais e preenche o resumo sem layout expandido', () => {
    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    const model = resolveCargoHydrowayMapModel(cargo!);
    const tracking = cargoWaterwayTrackingByCargoId.get('CARGO-001');
    const viewModel = buildMobileRouteSheetViewModel(cargo!, model!, 15, tracking);

    const html = renderToStaticMarkup(<MobileRouteSheetPartialSummary viewModel={viewModel} />);

    expect(html).toContain('hydroway-map-mobile-route-eta');
    expect(html).toContain('hydroway-map-mobile-route-progress-stat');
    expect(html).toContain('hydroway-map-mobile-route-progress');
    expect(html).toContain('hydroway-map-mobile-route-sync');
    expect(html).toContain('hydroway-map-mobile-route-next');
    expect(html).toContain('hydroway-map-mobile-route-partial-fill');
    expect(html).toContain('Belém → Santarém');
    expect(html).toContain('port-belem → port-santarem');
    expect(html).not.toContain('mobileRouteSheetTimeline');
    expect(html).not.toContain('hydroway-map-mobile-timeline-origin');
  });
});
