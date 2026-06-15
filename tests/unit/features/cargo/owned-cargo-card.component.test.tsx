import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
  useRouter: () => ({ push: vi.fn() }),
}));

const ownedCargoCardSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/components/owned-cargo-card/owned-cargo-card.tsx',
);

const cargo = userCargosMock[0]!;

describe('OwnedCargoCard', () => {
  it('renderiza card owned próprio com rota, ETA e CTA Ver detalhes', () => {
    const html = renderToStaticMarkup(createElement(OwnedCargoCard, { cargo }));

    expect(html).toContain('data-testid="owned-cargo-card"');
    expect(html).toContain('href="/minhas-cargas/MY-CARGO-001"');
    expect(html).toContain('MY-CARGO-001');
    expect(html).toContain('Manaus, AM');
    expect(html).toContain('Santarém, PA');
    expect(html).toContain('pages.minhasCargas.ownedCard:viewDetails');
    expect(html).toContain('data-status="open"');
    expect(html).not.toContain('role="progressbar"');
    expect(html).not.toContain('pages.minhasCargas.ownedCard:ctaComplete');
    expect(html).not.toContain('data-testid="cargo-card"');
    expect(html).not.toContain('data-ds-v2-cargo-card="true"');
  });

  it('não importa nem compõe CargoCard público em runtime', () => {
    const source = readFileSync(ownedCargoCardSourcePath, 'utf8');

    expect(source).not.toContain('import { CargoCard');
    expect(source).not.toContain('components/cargo-card');
    expect(source).not.toContain('<CargoCard');
  });

  it('não exibe blocos densos de progresso ou próximo passo na lista', () => {
    const html = renderToStaticMarkup(createElement(OwnedCargoCard, { cargo }));

    expect(html).not.toContain('pages.minhasCargas.ownedCard:nextStepLabel');
    expect(html).not.toContain('pages.minhasCargas.ownedCard:progressLabel');
    expect(html).not.toContain('role="progressbar"');
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

  it('não renderiza âncoras aninhadas — card clicável com CTA link único', () => {
    const html = renderToStaticMarkup(createElement(OwnedCargoCard, { cargo }));
    const anchorOpenTags = html.match(/<a\b/g) ?? [];

    expect(anchorOpenTags).toHaveLength(1);
    expect(html).toContain('href="/minhas-cargas/MY-CARGO-001"');
    expect(html).toContain('role="button"');
    expect(html.match(/<a href=/g)?.length ?? 0).toBe(1);
  });
});
