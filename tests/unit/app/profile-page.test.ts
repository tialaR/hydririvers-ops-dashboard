import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ptMessages from '../../../messages/pt-BR.json';

const mockGetTranslations = vi.hoisted(() => vi.fn());

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations
}));

vi.mock('@/features/auth/components/profile-panel/profile-panel', () => ({
  ProfilePanel: () => React.createElement('div', { 'data-testid': 'profile-panel' })
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

import ProfilePage from '@/app/[locale]/perfil/page';

describe('profile page', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockGetTranslations.mockImplementation(({ namespace }: { namespace: string }) => {
      if (namespace === 'pages.profile') {
        const m = ptMessages.pages.profile;
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

  it('renderiza topo humanizado e painel', async () => {
    const tree = await ProfilePage({ params: Promise.resolve({ locale: 'pt-BR' }) });
    const html = renderToStaticMarkup(tree as React.ReactElement);
    expect(html).toContain(ptMessages.pages.profile.title);
    expect(html).toContain(ptMessages.pages.profile.eyebrow);
    expect(html).toContain(ptMessages.pages.profile.description);
    expect(html).toContain('profile-panel');
  });
});
