import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';
import { OwnedCargoDetail } from '@/features/cargo/owned/components/owned-cargo-detail/owned-cargo-detail';

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const key = (name: string, values?: Record<string, string | number>) => {
      const serialized = values ? ` ${JSON.stringify(values)}` : '';
      return `${namespace}:${name}${serialized}`;
    };
    return key;
  },
  useLocale: () => 'pt-BR',
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/pt-BR/minhas-cargas/MY-CARGO-001',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock('@/shared/i18n/mock-content', () => ({
  translateMock: (_locale: string, value: string) => value,
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/features/cargo/owned/components/owned-cargo-map-sheet/owned-cargo-map-sheet', () => ({
  OwnedCargoMapSheet: () => null,
}));
vi.mock('@/features/cargo/owned/components/owned-cargo-timeline-sheet/owned-cargo-timeline-sheet', () => ({
  OwnedCargoTimelineSheet: () => null,
}));
vi.mock('@/features/cargo/owned/components/owned-cargo-documents-sheet/owned-cargo-documents-sheet', () => ({
  OwnedCargoDocumentsSheet: () => null,
}));
vi.mock('@/features/cargo/owned/components/owned-cargo-risks-sheet/owned-cargo-risks-sheet', () => ({
  OwnedCargoRisksSheet: () => null,
}));
vi.mock('@/features/cargo/owned/components/owned-cargo-tracking-sheet/owned-cargo-tracking-sheet', () => ({
  OwnedCargoTrackingSheet: () => null,
}));
vi.mock('@/features/cargo/owned/components/owned-cargo-process-sheet/owned-cargo-process-sheet', () => ({
  OwnedCargoProcessSheet: () => null,
}));

describe('OwnedCargoDetail', () => {
  it('renderiza cockpit com header da carga, mapa hero, mini previews e support cards', () => {
    const cargo = userCargosMock[0]!;
    const html = renderToStaticMarkup(<OwnedCargoDetail cargo={cargo} />);

    expect(html).toContain('data-testid="owned-cargo-detail"');
    expect(html).toContain('data-testid="owned-cargo-detail-header"');
    expect(html).toContain(cargo.title);
    expect(html).not.toContain('pages.minhasCargas.detail:editorial.headlineOpen');
    expect(html).not.toContain('data-testid="owned-cargo-status-card"');
    expect(html).toContain('data-testid="owned-cargo-support-cards"');
    expect(html).toContain('data-testid="owned-cargo-preview-map"');
    expect(html).toContain('data-testid="owned-cargo-preview-timeline"');
    expect(html).toContain('data-testid="owned-cargo-preview-documents"');
    expect(html).toContain('data-testid="owned-cargo-preview-risks"');
    expect(html).toContain('data-testid="owned-cargo-preview-process"');
    expect(html).toContain('data-context="origin"');
    expect(html).toContain('data-context="cargoType"');
    expect(html).toContain('data-panel-target="map"');
    expect(html).toContain('data-panel-target="timeline"');
    expect(html).toContain('data-panel-target="documents"');
    expect(html).toContain('data-panel-target="risks"');
    expect(html).toContain('data-panel-target="process"');
    expect(html).toContain(cargo.id);
  });
});
