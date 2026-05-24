import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import { CargoMapViewportRouter } from '@/features/waterway-map/components/cargo-map-viewport-router';
import { MobileRouteSheet } from '@/features/waterway-map/components/mobile/mobile-route-sheet';
import { resolveCargoHydrowayMapModel } from '@/features/waterway-map/data/resolve-cargo-hydroway-model';
import { cargoWaterwayTrackingByCargoId } from '@/features/waterway-tracking/waterway-compat';
import { buildMobileRouteSheetViewModel } from '@/features/waterway-map/utils/mobile-route-view-model';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/shared/components/bottom-sheet/BottomSheet', () => ({
  BottomSheet: ({
    open,
    children,
    title,
  }: {
    open: boolean;
    children: React.ReactNode;
    title: string;
  }) => (open ? (
    <section data-testid="hydroway-map-mobile-route-sheet" aria-label={title}>
      {children}
    </section>
  ) : null),
}));

vi.mock('@/features/dashboard/components/operations-board/desktop-cargo-map', () => ({
  DesktopCargoMapExpandedPage: () => <div data-testid="desktop-cargo-map-expanded-page" />,
}));

vi.mock('@/features/waterway-map/components/mobile/mobile-hydroway-map-experience', () => ({
  MobileHydrowayMapExperience: () => <div data-testid="hydroway-map-mobile-experience" />,
}));

describe('mobile route sheet and viewport router', () => {
  it('renderiza sheet com conteúdo operacional quando aberto', () => {
    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    const model = resolveCargoHydrowayMapModel(cargo!);
    const tracking = cargoWaterwayTrackingByCargoId.get('CARGO-001');
    const viewModel = buildMobileRouteSheetViewModel(cargo!, model!, 15, tracking);

    const html = renderToStaticMarkup(
      <MobileRouteSheet open onOpenChange={() => undefined} viewModel={viewModel} />,
    );

    expect(html).toContain('data-testid="hydroway-map-mobile-route-sheet"');
    expect(html).toContain('data-testid="hydroway-map-mobile-route-sheet-content"');
    expect(html).toContain('mobileRouteSheetTimeline');
    expect(html).toContain('hydroway-map-mobile-timeline-origin');
  });

  it('não renderiza sheet quando fechado', () => {
    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    const model = resolveCargoHydrowayMapModel(cargo!);
    const tracking = cargoWaterwayTrackingByCargoId.get('CARGO-001');
    const viewModel = buildMobileRouteSheetViewModel(cargo!, model!, 15, tracking);

    const html = renderToStaticMarkup(
      <MobileRouteSheet open={false} onOpenChange={() => undefined} viewModel={viewModel} />,
    );

    expect(html).not.toContain('data-testid="hydroway-map-mobile-route-sheet"');
    expect(html).not.toContain('data-testid="hydroway-map-mobile-route-sheet-content"');
  });

  it('router mobile não renderiza componentes desktop quando viewport é mobile', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('901px') ? false : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    const cargo = publicCargosMock.find((entry) => entry.id === 'CARGO-001');
    const model = resolveCargoHydrowayMapModel(cargo!);

    const html = renderToStaticMarkup(<CargoMapViewportRouter cargo={cargo!} model={model!} />);

    expect(html).toContain('data-testid="hydroway-map-mobile-experience"');
    expect(html).not.toContain('data-testid="desktop-cargo-map-expanded-page"');
  });
});
