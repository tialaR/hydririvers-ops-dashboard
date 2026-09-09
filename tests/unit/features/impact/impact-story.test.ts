import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ptMessages from '../../../../messages/pt-BR.json';
import { ImpactStory } from '@/features/impact/components/impact-story/impact-story';

const mockGetTranslations = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) =>
    React.createElement('a', { href, className }, children)
}));

vi.mock('@/shared/ui/card/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { className }, children)
}));

vi.mock('@/shared/ui/hydro-icon/hydro-icon', () => ({
  HydroIcon: () => React.createElement('span', { 'data-testid': 'hydro-icon' })
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
    return Object.assign(empty, { has: () => false, raw: () => undefined });
  }
  const t = (key: string) => {
    const v = scope[key];
    return typeof v === 'string' ? v : key;
  };
  return Object.assign(t, {
    has: (key: string) => Object.prototype.hasOwnProperty.call(scope, key),
    raw: () => undefined
  });
}

describe('ImpactStory', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) =>
      Promise.resolve(makeTranslator(namespace))
    );
  });

  it('mostra intro humanizada, categorias e sublinha de métrica quando existir', async () => {
    const tree = await ImpactStory({ locale: 'pt-BR' });
    const html = renderToStaticMarkup(tree as React.ReactElement);
    expect(html).toContain(ptMessages.pages.impact.introTitle);
    expect(html).toContain(ptMessages.pages.impact.introFootnote);
    expect(html).toContain(ptMessages.impactCards.cost.kindLabel);
    expect(html).toContain(ptMessages.impactCards.sustainability.metricSubline as string);
  });
});
