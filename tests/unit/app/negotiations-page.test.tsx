import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ptMessages from '../../../messages/pt-BR.json';

const mockGetTranslations = vi.hoisted(() => vi.fn());
const mockListNegotiations = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/features/marketplace/services/marketplace.service', () => ({
  listNegotiations: mockListNegotiations
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

vi.mock('@/features/negotiations/components/negotiation-board/negotiation-board', () => ({
  NegotiationBoard: () => <div data-testid="negotiation-board" />
}));

import NegotiationsPage from '@/app/[locale]/(product-shell)/negociacoes/page';

describe('negotiations page', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockListNegotiations.mockReset();

    mockListNegotiations.mockResolvedValue([]);
    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.negotiations') {
        const pack = ptMessages.pages.negotiations as Record<string, unknown>;
        return Promise.resolve((key: string) => {
          const v = pack[key];
          return typeof v === 'string' ? v : key;
        });
      }
      return Promise.resolve((key: string) => key);
    });
  });

  it('humaniza o topo e renderiza o board', async () => {
    const tree = await NegotiationsPage({ params: Promise.resolve({ locale: 'pt-BR' }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain(ptMessages.pages.negotiations.eyebrow);
    expect(html).toContain(ptMessages.pages.negotiations.title);
    expect(html).toContain(ptMessages.pages.negotiations.description);
    expect(html).toContain('negotiation-board');
  });
});

