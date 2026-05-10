import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetTranslations = vi.hoisted(() => vi.fn());
const mockDashboardOverview = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/features/dashboard/components/dashboard-overview/dashboard-overview', () => ({
  DashboardOverview: ({ locale }: { locale: string }) => mockDashboardOverview(locale)
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

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock('@/shared/ui/hydro-icon/hydro-icon', () => ({
  HydroIcon: () => <span data-testid="hydro-icon" />
}));

import DashboardPage from '@/app/[locale]/dashboard/page';

describe('dashboard page', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockDashboardOverview.mockReset();
    mockDashboardOverview.mockImplementation((locale: string) => <div data-testid="dashboard-overview" data-locale={locale} />);

    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.dashboard') {
        return Promise.resolve({
          eyebrow: 'Operação',
          title: 'Dashboard',
          description: 'Visão operacional das cargas, embarcações e rotas.',
          marketplaceEyebrow: 'Atalho operacional',
          marketplaceTitle: 'Abrir o marketplace de cargas',
          marketplaceDescription: 'Consulte oportunidades públicas.',
          marketplaceCta: 'Ver cargas públicas',
          myCargoesCta: 'Ver minhas cargas'
        });
      }
      return Promise.resolve({});
    });
  });

  it('prioriza visão operacional e CTA para o marketplace', async () => {
    const tree = await DashboardPage({ params: Promise.resolve({ locale: 'pt-BR' }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain('Dashboard');
    expect(html).toContain('Visão operacional das cargas, embarcações e rotas.');
    expect(html).toContain('Ver cargas públicas');
    expect(html).toContain('dashboard-overview');
  });
});
