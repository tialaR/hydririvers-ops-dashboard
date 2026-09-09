import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const mockGetTranslations = vi.hoisted(() => vi.fn());
const mockGetOperationalDashboardSummary = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/features/marketplace/services/marketplace.service', () => ({
  getOperationalDashboardSummary: () => mockGetOperationalDashboardSummary()
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  )
}));

vi.mock('@/shared/ui/hydro-icon/hydro-icon', () => ({
  HydroIcon: () => <span data-testid="hydro-icon" />
}));

import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview/dashboard-overview';

describe('dashboard overview', () => {
  it('renderiza o card guia com CTAs para cargas publicas e minhas cargas', async () => {
    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.dashboardOverview') {
        return Promise.resolve({
          sectionAriaLabel: 'Resumo operacional',
          heroEyebrow: 'Resumo operacional',
          heroTitle: 'Comece por aqui: um resumo do que merece sua atenção.',
          heroDescription: 'Texto',
          marketplaceCta: 'Explorar cargas públicas',
          myCargoesCta: 'Acompanhar minhas cargas',
          activeCargoes: 'Cargas em andamento',
          activeMarketplace: 'em acompanhamento agora',
          pendingDocuments: 'Documentos pendentes',
          documentsNeedAttention: 'itens para validar',
          availableVessels: 'Embarcações disponíveis',
          riverRoutes: 'capacidade para novas rotas',
          activeNegotiations: 'Negociações em curso',
          quotesAndBookings: 'propostas e acordos',
          averageCo2Saving: 'Economia média de CO₂',
          roadComparison: 'estimativa vs. rodoviário',
          attentionPanel: 'O que precisa de atenção',
          operation: 'prioridade',
          busiestCorridors: 'Corredores com mais movimento',
          corridorSummary: '{count} cargas no corredor',
          movement: 'movimento',
          readiness: 'prontidão documental: {value}%',
          watch: 'revisar',
          liveMock: 'dados de demonstração',
          recentActivity: 'Atividade recente',
          activeCount: '{count} em andamento',
          metricTrendOpenCargoes: 'tendência: +18%',
          metricTrendPendingDocs: 'pendências: +4%',
          metricTrendVessels: 'tendência: +7%',
          metricTrendNegotiations: 'tendência: +12%'
        });
      }
      if (namespace === 'common') {
        return Promise.resolve({
          routeArrow: ' → ',
          inlineListSeparator: ' • ',
          brDoMar: 'BR do Mar',
          'dealStage.open': 'open'
        });
      }
      return Promise.resolve({});
    });

    mockGetOperationalDashboardSummary.mockResolvedValue({
      activeCargoes: 4,
      pendingDocuments: 2,
      availableVessels: 1,
      activeNegotiations: 3,
      averageSaving: '12%',
      attentionCargoes: [],
      busiestCorridors: [],
      recentNegotiations: []
    });

    const tree = await DashboardOverview({ locale: 'pt-BR' });
    const html = renderToStaticMarkup(tree as React.ReactElement);

    expect(html).toContain('Comece por aqui');
    expect(html).toContain('Explorar cargas públicas');
    expect(html).toContain('Acompanhar minhas cargas');
  });
});

