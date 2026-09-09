import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSessionUser = vi.hoisted(() => vi.fn());
const mockGetTranslations = vi.hoisted(() => vi.fn());
const mockGetVesselById = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser
}));

vi.mock('@/features/marketplace/services/marketplace.service', () => ({
  getVesselById: mockGetVesselById,
  getNegotiationById: vi.fn(),
  listNegotiations: vi.fn(),
  listTrackingEvents: vi.fn(),
  listVessels: vi.fn(),
  listCargoes: vi.fn()
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

vi.mock('@/shared/ui/card/card', () => ({
  Card: ({ children, ...props }: { children: React.ReactNode }) => <article {...props}>{children}</article>
}));

vi.mock('@/features/vessels/components/vessel-detail/vessel-detail', () => ({
  VesselDetail: () => <div data-testid="vessel-detail" />
}));

vi.mock('@/features/government/components/government-dashboard/government-dashboard', () => ({
  GovernmentDashboard: () => <div data-testid="government-dashboard" />
}));

vi.mock('@/shared/ui/breadcrumb/breadcrumb', () => ({
  Breadcrumb: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav data-testid="breadcrumb">{items.map((item) => item.label).join(' > ')}</nav>
  )
}));

import GovernmentPage from '@/app/[locale]/(product-shell)/governo/page';
import VesselDetailPage from '@/app/[locale]/(product-shell)/embarcacoes/[id]/page';

describe('restricted route pages', () => {
  beforeEach(() => {
    mockGetSessionUser.mockReset();
    mockGetTranslations.mockReset();
    mockGetVesselById.mockReset();

    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.governmentPage') {
        return Promise.resolve({
          eyebrow: 'Valor público',
          title: 'Painel governamental',
          description: 'Visão institucional',
          unauthorizedTitle: 'Sem acesso',
          unauthorizedDescription: 'Área restrita'
        });
      }
      if (namespace === 'pages.vessels') {
        return Promise.resolve({
          eyebrow: 'Frota',
          title: 'Embarcações disponíveis',
          description: 'Capacidade regional',
          unauthorizedTitle: 'Sem acesso',
          unauthorizedDescription: 'Área restrita'
        });
      }
      return Promise.resolve({});
    });
  });

  it('mostra fallback humanizado no painel governamental para perfis sem acesso', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper', approved: true });

    const tree = await GovernmentPage({ params: Promise.resolve({ locale: 'pt-BR' }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain('Sem acesso');
    expect(html).toContain('Área restrita');
    expect(html).toContain('government-unauthorized');
  });

  it('mostra fallback humanizado na vista de embarcação para perfis sem acesso', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper', approved: true });
    mockGetVesselById.mockResolvedValue({ id: 'vessel-1', name: 'Rio Norte', route: 'Belém–Santarém', capacity: '100', eta: 'Hoje', status: 'available', owner: 'Carrier' });

    const tree = await VesselDetailPage({ params: Promise.resolve({ locale: 'pt-BR', id: 'vessel-1' }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain('Sem acesso');
    expect(html).toContain('Área restrita');
    expect(html).toContain('vessel-detail-unauthorized');
  });
});
