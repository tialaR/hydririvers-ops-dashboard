import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetPublicCargos = vi.hoisted(() => vi.fn());
const mockListNegotiations = vi.hoisted(() => vi.fn());
const mockListTrackingEvents = vi.hoisted(() => vi.fn());
const mockListVessels = vi.hoisted(() => vi.fn());
const mockGetTranslations = vi.hoisted(() => vi.fn());
const mockOperationsBoard = vi.hoisted(() => vi.fn());

vi.mock('@/features/cargo/services/cargo.service', () => ({
  getPublicCargos: mockGetPublicCargos
}));

vi.mock('@/features/marketplace/services/marketplace.service', () => ({
  listNegotiations: mockListNegotiations,
  listTrackingEvents: mockListTrackingEvents,
  listVessels: mockListVessels
}));

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/features/dashboard/components/operations-board/operations-board', () => ({
  OperationsBoard: ({ cargoes, locale }: { cargoes: unknown[]; locale: string }) => mockOperationsBoard(cargoes, locale)
}));

vi.mock('@/shared/ui/page-shell/page-shell', () => ({
  PageShell: ({ children, eyebrow, title, description }: { children: React.ReactNode; eyebrow?: string; title?: string; description?: string }) => (
    <section data-testid="page-shell">
      <header>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>
      </header>
      {children}
    </section>
  )
}));

import CargoesPage from '@/app/[locale]/cargas/page';

describe('cargas page', () => {
  beforeEach(() => {
    mockGetPublicCargos.mockReset();
    mockListNegotiations.mockReset();
    mockListTrackingEvents.mockReset();
    mockListVessels.mockReset();
    mockGetTranslations.mockReset();
    mockOperationsBoard.mockReset();

    mockGetPublicCargos.mockResolvedValue([{ id: 'cargo-1', title: 'Carga pública' }]);
    mockListNegotiations.mockResolvedValue([]);
    mockListTrackingEvents.mockResolvedValue([]);
    mockListVessels.mockResolvedValue([]);
    mockOperationsBoard.mockImplementation((cargoes: unknown[]) => <div data-testid="operations-board" data-count={cargoes.length} />);
    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.cargoes') {
        return Promise.resolve({
          eyebrow: 'Marketplace',
          title: 'Cargas públicas',
          description: 'Marketplace de cargas fluviais e de cabotagem prontas para receber propostas.'
        });
      }
      return Promise.resolve({});
    });
  });

  it('usa apenas o marketplace público e apresenta copy de marketplace', async () => {
    const tree = await CargoesPage({ params: Promise.resolve({ locale: 'pt-BR' }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(mockGetPublicCargos).toHaveBeenCalledTimes(1);
    expect(html).toContain('Cargas públicas');
    expect(html).toContain('Marketplace de cargas fluviais e de cabotagem prontas para receber propostas.');
    expect(html).toContain('operations-board');
  });
});
