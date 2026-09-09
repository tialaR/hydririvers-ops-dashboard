import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ptMessages from '../../../../messages/pt-BR.json';
import { ImpactDetailBody } from '@/features/impact/components/impact-detail-body/impact-detail-body';
import { listImpactEvidencesByImpactId } from '@/features/impact/domain/impact-evidence';

const mockGetTranslations = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

function scopeForNamespace(namespace: string): Record<string, unknown> | undefined {
  const parts = namespace.split('.');
  let cur: unknown = ptMessages;
  for (const p of parts) {
    cur = (cur as Record<string, unknown>)?.[p];
  }
  if (!cur || typeof cur !== 'object' || Array.isArray(cur)) return undefined;
  return cur as Record<string, unknown>;
}

function makeTranslator(namespace: string) {
  const scope = scopeForNamespace(namespace);
  if (!scope) {
    const empty = () => '';
    return Object.assign(empty, {
      has: () => false,
      raw: () => undefined
    });
  }
  const t = (key: string) => {
    const v = scope[key];
    return typeof v === 'string' ? v : key;
  };
  return Object.assign(t, {
    has: (key: string) => Object.prototype.hasOwnProperty.call(scope, key),
    raw: (pathKey: string) =>
      pathKey.split('.').reduce<unknown>((acc, k) => {
        if (acc && typeof acc === 'object' && !Array.isArray(acc)) return (acc as Record<string, unknown>)[k];
        return undefined;
      }, scope)
  });
}

describe('ImpactDetailBody', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) =>
      Promise.resolve(makeTranslator(namespace))
    );
  });

  it('renderiza seções de significado, valor, evidência, limites e operação (custo com stub)', async () => {
    const tree = await ImpactDetailBody({ id: 'cost', locale: 'pt-BR' });
    const html = renderToStaticMarkup(tree as React.ReactElement);
    expect(html).toContain(ptMessages.pages.impactDetail.meaningTitle);
    expect(html).toContain(ptMessages.pages.impactDetail.valueTitle);
    expect(html).toContain(ptMessages.pages.impactDetail.evidenceTitle);
    expect(html).toContain(ptMessages.pages.impactDetail.limitsTitle);
    expect(html).toContain(ptMessages.pages.impactDetail.operationTitle);
    expect(html).toContain('impact-detail-stub-evidence');
    expect(html).toContain(ptMessages.pages.impactDetail.evidenceStubBadge);
  });

  it('usa evidências reais quando existem (sustentabilidade)', async () => {
    const real = listImpactEvidencesByImpactId('sustainability');
    expect(real.length).toBeGreaterThan(0);
    const tree = await ImpactDetailBody({ id: 'sustainability', locale: 'pt-BR' });
    const html = renderToStaticMarkup(tree as React.ReactElement);
    expect(html).toContain(real[0].title);
    expect(html).not.toContain('impact-detail-stub-evidence');
  });
});
