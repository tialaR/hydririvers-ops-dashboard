import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ptMessages from '../../../messages/pt-BR.json';

const mockGetTranslations = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/features/impact/components/impact-story/impact-story', () => ({
  ImpactStory: () => React.createElement('div', { 'data-testid': 'impact-story' })
}));

vi.mock('@/shared/ui/page-shell/page-shell', () => ({
  PageShell: ({
    children,
    eyebrow,
    title,
    description
  }: {
    children: React.ReactNode;
    eyebrow?: string;
    title?: string;
    description?: string;
  }) =>
    React.createElement(
      'section',
      { 'data-testid': 'page-shell' },
      React.createElement(
        'header',
        null,
        React.createElement('p', null, eyebrow),
        React.createElement('h1', null, title),
        React.createElement('span', null, description)
      ),
      children
    )
}));

import ImpactPage from '@/app/[locale]/impacto/page';

describe('impact page', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.impact') {
        const m = ptMessages.pages.impact;
        const t = (key: keyof typeof m) => m[key] as string;
        return Promise.resolve(
          Object.assign(t, {
            has: (key: string) => key in m,
            raw: () => undefined
          })
        );
      }
      return Promise.resolve(
        Object.assign(() => '', {
          has: () => false,
          raw: () => undefined
        })
      );
    });
  });

  it('renderiza topo humanizado e story', async () => {
    const tree = await ImpactPage({ params: Promise.resolve({ locale: 'pt-BR' }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);
    expect(html).toContain(ptMessages.pages.impact.title);
    expect(html).toContain(ptMessages.pages.impact.eyebrow);
    expect(html).toContain('impact-story');
  });
});
