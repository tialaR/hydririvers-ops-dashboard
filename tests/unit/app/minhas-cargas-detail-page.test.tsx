import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSessionUser = vi.hoisted(() => vi.fn());
const mockGetMyCargoByIdForUser = vi.hoisted(() => vi.fn());
const mockGetTranslations = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
  redirect: mockRedirect
}));

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser
}));

vi.mock('@/features/cargo/services/cargo.service', () => ({
  getMyCargoByIdForUser: mockGetMyCargoByIdForUser
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

vi.mock('@/shared/ui/breadcrumb/breadcrumb', () => ({
  Breadcrumb: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav data-testid="breadcrumb">{items.map((item) => item.label).join(' > ')}</nav>
  )
}));

vi.mock('@/features/cargo-market/components/cargo-detail/cargo-detail-loader', () => ({
  CargoDetailLoader: ({ id }: { id: string }) => <div data-testid="cargo-detail-loader" data-id={id} />
}));

vi.mock('@/shared/i18n/mock-content', () => ({
  translateMock: (_locale: string, value: string) => value
}));

import MyCargoDetailPage from '@/app/[locale]/(product-shell)/minhas-cargas/[id]/page';

const cargo = {
  id: 'MY-CARGO-001',
  title: 'Açaí congelado para entrega regional',
  origin: 'Belém, PA',
  destination: 'Santarém, PA'
};

describe('minhas-cargas/[id] page', () => {
  beforeEach(() => {
    mockGetSessionUser.mockReset();
    mockGetMyCargoByIdForUser.mockReset();
    mockGetTranslations.mockReset();
    mockNotFound.mockReset();
    mockRedirect.mockReset();

    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.cargoDetail') {
        return Promise.resolve({
          eyebrow: 'Detalhe',
          title: 'Detalhe',
          description: 'Descrição'
        });
      }
      if (namespace === 'nav') {
        return Promise.resolve({
          dashboard: 'Dashboard',
          myCargoes: 'Minhas cargas'
        });
      }
      if (namespace === 'common') {
        return Promise.resolve({
          routeArrow: ' → '
        });
      }
      return Promise.resolve({});
    });
  });

  it('renderiza o detalhe privado quando a carga pertence ao usuário', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-1',
      role: 'shipper',
      approved: true
    });
    mockGetMyCargoByIdForUser.mockResolvedValue(cargo);

    const tree = await MyCargoDetailPage({ params: Promise.resolve({ locale: 'pt-BR', id: cargo.id }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain('data-testid="cargo-detail-loader"');
    expect(html).toContain('Minhas cargas');
    expect(mockNotFound).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('mostra estado seguro quando a carga não pertence ao usuário', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'u-shipper-1',
      role: 'shipper',
      approved: true
    });
    mockGetMyCargoByIdForUser.mockResolvedValue(undefined);
    mockNotFound.mockImplementation(() => {
      throw new Error('notFound');
    });

    await expect(
      MyCargoDetailPage({ params: Promise.resolve({ locale: 'pt-BR', id: 'missing-id' }) })
    ).rejects.toThrow('notFound');
  });
});
