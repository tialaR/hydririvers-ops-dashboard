import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement, type MouseEvent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { IconButton } from '@/shared/components/icon-button';
import { renderIconButtonIcon } from '@/shared/components/icon-button/icon-button-icons';

describe('IconButton', () => {
  it('renderiza button com aria-label e marker global v2', () => {
    const html = renderToStaticMarkup(
      <IconButton ariaLabel="Abrir filtros" icon={<span data-testid="icon">F</span>} />,
    );

    expect(html).toContain('aria-label="Abrir filtros"');
    expect(html).toContain('type="button"');
    expect(html).toContain('data-icon-button-global="true"');
    expect(html).toContain('variant_v2');
    expect(html).toContain('data-testid="icon"');
  });

  it('dispara onClick quando habilitado', () => {
    const onClick = vi.fn();
    const element = createElement(IconButton, {
      ariaLabel: 'Filtrar',
      icon: <span>F</span>,
      onClick,
    });

    element.props.onClick?.({} as MouseEvent<HTMLButtonElement>);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('não dispara onClick quando disabled', () => {
    const onClick = vi.fn();
    const element = createElement(IconButton, {
      ariaLabel: 'Filtrar',
      icon: <span>F</span>,
      disabled: true,
      onClick,
    });

    expect(element.props.disabled).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renderiza badgeContent sem alterar shell global', () => {
    const html = renderToStaticMarkup(
      <IconButton ariaLabel="Filtros" iconName="notifications" badgeContent={3} />,
    );

    expect(html).toContain('>3<');
    expect(html).toContain('data-icon-button-global="true"');
    expect(html).toContain('variant_v2');
  });

  it('iconName troca apenas o ícone mantendo shell v2', () => {
    const filterHtml = renderToStaticMarkup(
      <IconButton ariaLabel="Filtros" iconName="filter" iconButtonRole="page" />,
    );
    const closeHtml = renderToStaticMarkup(
      <IconButton ariaLabel="Fechar" iconName="close" iconButtonRole="sheet" />,
    );

    expect(filterHtml).toContain('variant_v2');
    expect(closeHtml).toContain('variant_v2');
    expect(filterHtml).not.toContain('variant_pageAction');
    expect(closeHtml).not.toContain('variant_sheetClose');
    expect(filterHtml).toContain('data-icon-button-role="page"');
    expect(closeHtml).toContain('data-icon-button-role="sheet"');
  });

  it('aplica estado ativo com aria-pressed', () => {
    const html = renderToStaticMarkup(
      <IconButton ariaLabel="Mapa" icon={<span>M</span>} active variant="map" />,
    );

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-active="true"');
  });

  it('header, page e field usam o mesmo shell v2', () => {
    const headerHtml = renderToStaticMarkup(
      <IconButton ariaLabel="Idioma" icon={<span>PT</span>} iconButtonRole="header" />,
    );
    const pageHtml = renderToStaticMarkup(
      <IconButton ariaLabel="Filtros" iconName="filter" iconButtonRole="page" />,
    );
    const fieldHtml = renderToStaticMarkup(
      <IconButton ariaLabel="Filtros" iconName="filter" iconButtonRole="field" />,
    );

    for (const html of [headerHtml, pageHtml, fieldHtml]) {
      expect(html).toContain('data-icon-button-global="true"');
      expect(html).toContain('variant_v2');
      expect(html).not.toContain('variant_chrome');
      expect(html).not.toContain('variant_pageAction');
      expect(html).not.toContain('variant_fieldAction');
    }
  });

  it('sheet close usa shell v2 global com marker de fechamento', () => {
    const html = renderToStaticMarkup(
      <IconButton
        ariaLabel="Fechar"
        iconName="close"
        iconButtonRole="sheet"
        className="sheet-close"
        data-bottom-sheet-close="true"
      />,
    );

    expect(html).toContain('data-icon-button-global="true"');
    expect(html).toContain('variant_v2');
    expect(html).not.toContain('variant_sheetClose');
    expect(html).toContain('data-icon-button-role="sheet"');
    expect(html).toContain('sheet-close');
    expect(html).toContain('data-bottom-sheet-close="true"');
  });

  it('variants semânticos legados mapeiam para shell v2 sem classe visual divergente', () => {
    const html = renderToStaticMarkup(
      <IconButton ariaLabel="Idioma" icon={<span>PT</span>} variant="chrome" iconButtonRole="header" />,
    );

    expect(html).toContain('variant_v2');
    expect(html).not.toContain('variant_chrome');
    expect(html).toContain('data-icon-button-role="header"');
  });

  it('tamanho padrão usa tokens de hit area no shell v2', () => {
    const html = renderToStaticMarkup(<IconButton ariaLabel="Ação" iconName="close" />);

    expect(html).toContain('size_md');
    expect(html).toContain('variant_v2');
  });

  it('shell v2 usa densidade DS v2 light alinhada ao /dev-v2', () => {
    const stylesPath = resolve(process.cwd(), 'src/shared/components/icon-button/IconButton.module.scss');
    const tokensPath = resolve(process.cwd(), 'src/shared/styles/tokens/_hy-v2-light.scss');
    const stylesSource = readFileSync(stylesPath, 'utf8');
    const tokensSource = readFileSync(tokensPath, 'utf8');

    expect(stylesSource).toContain('backdrop-filter');
    expect(stylesSource).toContain('--hy-size-icon-button-svg');
    expect(stylesSource).toContain('--hy-shadow-icon-button');
    expect(tokensSource).toContain('--hy-color-icon-button-surface: rgba(226, 234, 246, 0.68)');
    expect(tokensSource).toContain('--hy-shadow-icon-button: 0 0.875rem 1.875rem');
    expect(tokensSource).toContain('--hy-blur-icon-button');
  });

  it('iconName="filter" renderiza sliders horizontais, não funil', () => {
    const html = renderToStaticMarkup(
      <IconButton ariaLabel="Filtros" iconName="filter" iconButtonRole="field" />,
    );

    expect(html).toContain('lucide-sliders-horizontal');
    expect(html).not.toContain('lucide-filter');
  });

  it('renderIconButtonIcon filter usa SlidersHorizontal como fonte única', () => {
    const html = renderToStaticMarkup(<>{renderIconButtonIcon('filter')}</>);

    expect(html).toContain('lucide-sliders-horizontal');
    expect(html).not.toContain('lucide-filter');
  });
});
