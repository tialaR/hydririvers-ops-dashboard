import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ptMessages from '../../../messages/pt-BR.json';

const mockGetTranslations = vi.hoisted(() => vi.fn());
const mockGetSessionUser = vi.hoisted(() => vi.fn());
const mockGetNegotiationById = vi.hoisted(() => vi.fn());
const mockGetCargoById = vi.hoisted(() => vi.fn());
const mockCanNegotiateCargo = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/shared/server/auth', () => ({
  getSessionUser: mockGetSessionUser
}));

vi.mock('@/features/marketplace/services/marketplace.service', () => ({
  getNegotiationById: mockGetNegotiationById,
  getCargoById: mockGetCargoById
}));

vi.mock('@/features/auth/domain/access-control', () => ({
  canNegotiateCargo: mockCanNegotiateCargo
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
  Breadcrumb: () => <nav data-testid="breadcrumb" />
}));

vi.mock('@/features/negotiations/components/negotiation-detail/negotiation-detail', () => ({
  NegotiationDetail: () => <div data-testid="negotiation-detail" />
}));

import NegotiationDetailPage from '@/app/[locale]/negociacoes/[id]/page';

describe('negotiation detail page', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockGetSessionUser.mockReset();
    mockGetNegotiationById.mockReset();
    mockGetCargoById.mockReset();
    mockCanNegotiateCargo.mockReset();

    mockGetSessionUser.mockResolvedValue({ id: 'u-shipper-1', role: 'shipper', approved: true });
    mockGetNegotiationById.mockResolvedValue({
      id: 'n-1',
      cargoTitle: 'Açaí congelado',
      vesselName: 'Frio Tapajós',
      stage: 'quote',
      amount: '6080',
      lastUpdate: '2026-05-10T00:00:00.000Z',
      parties: ['A', 'B'],
      cargoId: 'cargo-1'
    });
    mockGetCargoById.mockResolvedValue({ id: 'cargo-1' });
    mockCanNegotiateCargo.mockReturnValue(true);

    mockGetTranslations.mockImplementation(async ({ namespace }: { namespace: string }) => {
      const d = ptMessages.pages.negotiationDetail;
      if (namespace === 'pages.negotiationDetail') {
        return (key: string, values?: Record<string, string>) => {
          if (key === 'descriptionWithVessel' && values?.vessel) {
            return d.descriptionWithVessel.replace('{vessel}', values.vessel);
          }
          if (key === 'descriptionPlain') return d.descriptionPlain;
          const v = d[key as keyof typeof d];
          if (typeof v === 'string') return v;
          return key;
        };
      }
      if (namespace === 'nav') {
        return (key: string) => String(ptMessages.nav[key as keyof typeof ptMessages.nav] ?? key);
      }
      return () => '';
    });
  });

  it('renderiza label humanizado, título da negociação e subtítulo com embarcação', async () => {
    const tree = await NegotiationDetailPage({ params: Promise.resolve({ locale: 'pt-BR', id: 'n-1' }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain(ptMessages.pages.negotiationDetail.eyebrow);
    expect(html).toContain('Açaí congelado');
    expect(html).toContain('Frio Tapajós');
    expect(html).toContain('Revise valor, documentos e próximos passos antes da operação avançar.');
    expect(html).toContain('negotiation-detail');
  });

  it('quando sem acesso, mostra mensagem de access denied', async () => {
    mockCanNegotiateCargo.mockReturnValue(false);
    const tree = await NegotiationDetailPage({ params: Promise.resolve({ locale: 'pt-BR', id: 'n-1' }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain(ptMessages.pages.negotiationDetail.accessDeniedTitle);
    expect(html).toContain('negotiation-detail-unauthorized');
  });
});
