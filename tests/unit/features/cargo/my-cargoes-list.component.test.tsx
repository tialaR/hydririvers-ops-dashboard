import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { MyCargoesList } from '@/features/cargo-market/components/my-cargoes-list/my-cargoes-list';
import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, string | number>) => {
    if (values) {
      return `${namespace ?? 'root'}:${key}:${JSON.stringify(values)}`;
    }
    return `${namespace ?? 'root'}:${key}`;
  },
  useLocale: () => 'pt-BR',
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) =>
    createElement('a', { href, ...rest }, children),
}));

describe('MyCargoesList', () => {
  it('renderiza resumo compacto e cards owned com dados mock', () => {
    const html = renderToStaticMarkup(
      createElement(MyCargoesList, {
        cargoes: userCargosMock.slice(0, 2),
        canCreateCargo: true,
      }),
    );

    expect(html).toContain('data-testid="minhas-cargas-summary"');
    expect(html).toContain('data-testid="minhas-cargas-grid"');
    expect(html).toContain('data-testid="owned-cargo-card"');
    expect(html).not.toContain('data-testid="cargo-card"');
  });

  it('renderiza empty state quando não há cargas', () => {
    const html = renderToStaticMarkup(
      createElement(MyCargoesList, {
        cargoes: [],
        canCreateCargo: true,
      }),
    );

    expect(html).toContain('data-testid="minhas-cargas-empty"');
    expect(html).not.toContain('data-testid="owned-cargo-card"');
    expect(html).not.toContain('data-testid="minhas-cargas-summary"');
  });
});
