import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Negotiation } from '@/features/marketplace/domain/marketplace.types';
import { NegotiationBoard } from '@/features/negotiations/components/negotiation-board/negotiation-board';
import ptMessages from '../../../../messages/pt-BR.json';

const mockGetTranslations = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    locale?: string;
    className?: string;
    'data-testid'?: string;
    'aria-label'?: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

function flattenStrings(input: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof input !== 'object' || input === null) return out;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[next] = v;
    else if (typeof v === 'object' && v !== null) Object.assign(out, flattenStrings(v, next));
  }
  return out;
}

const pagesNegotiationsFlat = flattenStrings(ptMessages.pages.negotiations);
const commonFlat = flattenStrings(ptMessages.common);

function mockTranslator(flat: Record<string, string>) {
  return (key: string, values?: Record<string, string | number>) => {
    if (key === 'guideBadge' && values && typeof values.count === 'number') {
      const c = values.count;
      if (c === 0) return 'Nenhuma pendente';
      if (c === 1) return '1 precisa de resposta';
      return `${c} precisam de resposta`;
    }
    if (key === 'openNegotiation' && values?.title) return `Abrir negociação ${values.title}`;
    if (key === 'negotiationProgress' && values && typeof values.progress === 'number') {
      return `Progresso da negociação: ${values.progress}%`;
    }
    return flat[key] ?? key;
  };
}

function negotiationFixture(overrides: Partial<Negotiation>): Negotiation {
  return {
    id: 'neg-test-1',
    cargoTitle: 'Carga teste cotação',
    vesselName: 'Barco Teste',
    stage: 'quote',
    amount: 'R$ 1.000',
    lastUpdate: '2026-05-10T12:00:00.000Z',
    nextStep: 'Próximo passo cotação',
    parties: ['Coop. Demo', 'Transportadora Demo'],
    route: 'Belém → Santarém',
    ...overrides
  };
}

describe('NegotiationBoard render', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockGetTranslations.mockImplementation(async ({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.negotiations') return mockTranslator(pagesNegotiationsFlat);
      if (namespace === 'common') return mockTranslator(commonFlat);
      return mockTranslator({});
    });
  });

  it('renderiza título humanizado da guia e subtítulo explicativo', async () => {
    const negotiations: Negotiation[] = [negotiationFixture({ id: 'a', stage: 'quote' })];
    const html = renderToStaticMarkup(await NegotiationBoard({ negotiations, locale: 'pt-BR' }));
    expect(html).toContain(ptMessages.pages.negotiations.guideTitle);
    expect(html).toContain(ptMessages.pages.negotiations.guideDescription);
  });

  it('renderiza cartão com título, status, rota, valor e próximo passo', async () => {
    const negotiations: Negotiation[] = [
      negotiationFixture({
        id: 'neg-q',
        stage: 'quote',
        cargoTitle: 'Polpa de açaí',
        route: 'Manaus–Belém',
        amount: 'R$ 5.000',
        nextStep: 'Anexar documento'
      })
    ];
    const html = renderToStaticMarkup(await NegotiationBoard({ negotiations, locale: 'pt-BR' }));
    expect(html).toContain('Polpa de açaí');
    expect(html).toContain('Cotação');
    expect(html).toContain('Manaus–Belém');
    expect(html).toContain('R$');
    expect(html).toContain('Anexar documento');
    expect(html).toContain(ptMessages.pages.negotiations.card.nextStepLabel);
  });

  it('exibe Cotação, Contraproposta e Contrato e selo de ação na contraproposta', async () => {
    const negotiations: Negotiation[] = [
      negotiationFixture({ id: '1', stage: 'quote', cargoTitle: 'Carga A' }),
      negotiationFixture({ id: '2', stage: 'counteroffer', cargoTitle: 'Carga B' }),
      negotiationFixture({ id: '3', stage: 'contract', cargoTitle: 'Carga C' })
    ];
    const html = renderToStaticMarkup(await NegotiationBoard({ negotiations, locale: 'pt-BR' }));
    expect(html).toContain('Cotação');
    expect(html).toContain('Contraproposta');
    expect(html).toContain('Contrato');
    expect(html).toContain(ptMessages.pages.negotiations.actionRequiredBadge);
  });

  it('renderiza estado vazio quando não há negociações', async () => {
    const html = renderToStaticMarkup(await NegotiationBoard({ negotiations: [], locale: 'pt-BR' }));
    expect(html).toContain('data-testid="negotiations-empty"');
    expect(html).toContain(ptMessages.pages.negotiations.empty.title);
  });

  it('renderiza microcopy das métricas e selo de resposta nas contrapropostas quando aplicável', async () => {
    const negotiations: Negotiation[] = [negotiationFixture({ id: 'co', stage: 'counteroffer', cargoTitle: 'Carga contraproposta' })];
    const html = renderToStaticMarkup(await NegotiationBoard({ negotiations, locale: 'pt-BR' }));
    expect(html).toContain(ptMessages.pages.negotiations.summary.activeHint);
    expect(html).toContain(ptMessages.pages.negotiations.summary.respondBadge);
    expect(html).toContain(ptMessages.pages.negotiations.summary.metricsRegionAria);
  });
});
