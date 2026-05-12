import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Negotiation } from '@/features/marketplace/domain/marketplace.types';
import { NegotiationDetail } from '@/features/negotiations/components/negotiation-detail/negotiation-detail';
import ptMessages from '../../../../messages/pt-BR.json';

const mockGetTranslations = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) =>
    React.createElement('a', { href, className }, children)
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

const detailFlat = flattenStrings(ptMessages.pages.negotiationDetail);
const commonFlat = flattenStrings(ptMessages.common);

function mockT(flat: Record<string, string>) {
  return (key: string, values?: Record<string, string>) => {
    let template = flat[key] ?? key;
    if (values) {
      for (const [vk, vv] of Object.entries(values)) {
        template = template.replaceAll(`{${vk}}`, String(vv));
      }
    }
    return template;
  };
}

function baseNegotiation(overrides: Partial<Negotiation> = {}): Negotiation {
  return {
    id: 'neg-test',
    cargoTitle: 'Carga demonstração',
    vesselName: 'Barco Aurora',
    stage: 'quote',
    amount: 'R$ 3.000',
    lastUpdate: '2026-05-10T12:00:00.000Z',
    nextStep: 'Anexar laudo sanitário',
    parties: ['Coop. Norte', 'Transportadora Sul'],
    route: 'Belém → Santarém',
    paymentTerms: '50% na reserva',
    insurance: 'Cadeia fria coberta',
    documents: ['NF-e pendente de anexação', 'Romaneio validado'],
    history: [{ title: 'Cotação recebida', description: 'Valores alinhados ao corredor.', date: '2026-05-09T10:00:00.000Z' }],
    cargoId: 'cargo-demo-1',
    ...overrides
  };
}

describe('NegotiationDetail render', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockGetTranslations.mockImplementation(async ({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.negotiationDetail') return mockT(detailFlat);
      if (namespace === 'common') return mockT(commonFlat);
      return mockT({});
    });
  });

  it('renderiza guia com título e próximo passo', async () => {
    const html = renderToStaticMarkup(await NegotiationDetail({ negotiation: baseNegotiation(), locale: 'pt-BR' }));
    expect(html).toContain(ptMessages.pages.negotiationDetail.whatNowTitle);
    expect(html).toContain('data-testid="negotiation-detail-next-step"');
    expect(html).toContain('Anexar laudo sanitário');
  });

  it('renderiza resumo com valor negociado e título da carga', async () => {
    const html = renderToStaticMarkup(await NegotiationDetail({ negotiation: baseNegotiation(), locale: 'pt-BR' }));
    expect(html).toContain(ptMessages.pages.negotiationDetail.negotiatedValueLabel);
    expect(html).toContain('data-testid="negotiation-detail-value"');
    expect(html).toContain('data-testid="negotiation-detail-title"');
    expect(html).toContain('Carga demonstração');
  });

  it('renderiza termos com rótulos humanizados', async () => {
    const html = renderToStaticMarkup(await NegotiationDetail({ negotiation: baseNegotiation(), locale: 'pt-BR' }));
    expect(html).toContain('data-testid="negotiation-detail-terms"');
    expect(html).toContain(ptMessages.pages.negotiationDetail.partiesTitle);
    expect(html).toContain(ptMessages.pages.negotiationDetail.paymentTitle);
  });

  it('renderiza documentos com status pendente e validado', async () => {
    const html = renderToStaticMarkup(await NegotiationDetail({ negotiation: baseNegotiation(), locale: 'pt-BR' }));
    expect(html).toContain('data-testid="negotiation-detail-documents"');
    expect(html).toContain('data-testid="document-chip-pending"');
    expect(html).toContain('data-testid="document-chip-verified"');
    expect(html).toContain(ptMessages.pages.negotiationDetail.documentStatus.pending);
  });

  it('renderiza linha do tempo', async () => {
    const html = renderToStaticMarkup(await NegotiationDetail({ negotiation: baseNegotiation(), locale: 'pt-BR' }));
    expect(html).toContain('data-testid="negotiation-timeline"');
    expect(html).toContain(ptMessages.pages.negotiationDetail.history);
  });

  it('inclui link para carga quando há cargoId', async () => {
    const html = renderToStaticMarkup(
      await NegotiationDetail({ negotiation: baseNegotiation({ cargoId: 'cargo-x' }), locale: 'pt-BR' })
    );
    expect(html).toContain('/cargas/cargo-x');
    expect(html).toContain(ptMessages.pages.negotiationDetail.viewCargoLink);
  });
});
