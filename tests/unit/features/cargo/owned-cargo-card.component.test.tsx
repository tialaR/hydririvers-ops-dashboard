import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { OwnedCargoCard } from '@/features/cargo/components/owned-cargo-card/owned-cargo-card';
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

const cargo = userCargosMock[0]!;

describe('OwnedCargoCard', () => {
  it('renderiza card compacto com código, rota, progresso e CTA privado', () => {
    const html = renderToStaticMarkup(createElement(OwnedCargoCard, { cargo }));

    expect(html).toContain('data-testid="owned-cargo-card"');
    expect(html).toContain('href="/minhas-cargas/MY-CARGO-001"');
    expect(html).toContain('MY-CARGO-001');
    expect(html).toContain('Manaus, AM');
    expect(html).toContain('Santarém, PA');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('pages.minhasCargas.ownedCard:ctaComplete');
    expect(html).not.toContain('data-testid="cargo-card"');
  });

  it('expõe alerta principal quando há risco operacional', () => {
    const html = renderToStaticMarkup(createElement(OwnedCargoCard, { cargo }));
    expect(html).toContain('Cadeia térmica curta na origem');
  });

  it('normaliza href canônico cargo-N para bater com o loader do detalhe', () => {
    const html = renderToStaticMarkup(
      createElement(OwnedCargoCard, {
        cargo: { ...cargo, id: 'cargo-001' },
      }),
    );

    expect(html).toContain('href="/minhas-cargas/CARGO-001"');
    expect(html).toContain('>cargo-001<');
  });
});
