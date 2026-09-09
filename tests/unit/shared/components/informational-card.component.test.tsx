import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { InformationalCard } from '@/shared/components/informational-card';

const componentPath = resolve(
  process.cwd(),
  'src/shared/components/informational-card/InformationalCard.tsx',
);
const stylesPath = resolve(
  process.cwd(),
  'src/shared/components/informational-card/InformationalCard.module.scss',
);

describe('InformationalCard', () => {
  const componentSource = readFileSync(componentPath, 'utf8');
  const stylesSource = readFileSync(stylesPath, 'utf8');

  it('renderiza title, description e icon', () => {
    const html = renderToStaticMarkup(
      <InformationalCard
        tone="info"
        icon={<span data-testid="info-icon">i</span>}
        title="Nenhuma carga encontrada"
        description="Não encontramos cargas com os filtros atuais."
      />,
    );

    expect(html).toContain('data-informational-card="true"');
    expect(html).toContain('data-informational-card-title="true"');
    expect(html).toContain('data-informational-card-description="true"');
    expect(html).toContain('data-informational-card-icon="true"');
    expect(html).toContain('Nenhuma carga encontrada');
    expect(html).toContain('Não encontramos cargas com os filtros atuais.');
    expect(html).toContain('data-testid="info-icon"');
  });

  it('permite markers de feature sem perder markers shared', () => {
    const html = renderToStaticMarkup(
      <InformationalCard
        title="Nenhuma carga encontrada"
        description="Ajuste os filtros."
        dataAttributes={{
          'data-public-cargas-empty-state': 'true',
          'data-public-cargas-empty-variant': 'filtered',
        }}
        icon={<span>i</span>}
        iconDataAttributes={{ 'data-public-cargas-empty-icon': 'true' }}
        titleDataAttributes={{ 'data-public-cargas-empty-title': 'true' }}
        descriptionDataAttributes={{ 'data-public-cargas-empty-description': 'true' }}
      />,
    );

    expect(html).toContain('data-informational-card="true"');
    expect(html).toContain('data-public-cargas-empty-state="true"');
    expect(html).toContain('data-public-cargas-empty-variant="filtered"');
    expect(html).toContain('data-public-cargas-empty-icon="true"');
    expect(html).toContain('data-public-cargas-empty-title="true"');
    expect(html).toContain('data-public-cargas-empty-description="true"');
  });

  it('não é clicável por padrão', () => {
    const html = renderToStaticMarkup(
      <InformationalCard title="Estado informativo" description="Somente leitura." />,
    );

    expect(html).not.toContain('role="button"');
    expect(html).not.toContain('role="link"');
    expect(html).not.toContain('href=');
    expect(componentSource).not.toContain('onClick');
    expect(stylesSource).toContain('cursor: default');
  });

  it('tone info aplica markers e tokens semânticos', () => {
    const html = renderToStaticMarkup(
      <InformationalCard tone="info" title="Info" description="Detalhe" />,
    );

    expect(html).toContain('data-informational-card-tone="info"');
    expect(stylesSource).toContain('--hy-color-info-card-surface');
    expect(stylesSource).toContain('--hy-color-info-card-icon');
    expect(stylesSource).toContain('.tone_neutral');
  });

  it('centraliza conteúdo por padrão', () => {
    const html = renderToStaticMarkup(<InformationalCard title="Centro" />);

    expect(html).toContain('data-informational-card-align="center"');
    expect(stylesSource).toContain('.align_center');
    expect(stylesSource).toContain('text-align: center');
  });
});
