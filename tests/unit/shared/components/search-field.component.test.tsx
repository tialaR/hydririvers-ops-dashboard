import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { SearchField } from '@/shared/components/search-field';

const publicCargasListPath = resolve(
  process.cwd(),
  'src/features/cargo/public/components/public-cargas-mobile/public-cargas-mobile-list.tsx',
);
const searchFieldStylesPath = resolve(
  process.cwd(),
  'src/shared/components/search-field/SearchField.module.scss',
);

describe('SearchField', () => {
  it('é a primitive shared usada em /cargas mobile (sem terceira versão local)', () => {
    const source = readFileSync(publicCargasListPath, 'utf8');

    expect(source).toContain("from '@/shared/components/search-field'");
    expect(source).toContain('<SearchField');
    expect(source).not.toContain('liquid-glass-search-field');
    expect(source).not.toContain('LiquidGlassSearchField');
  });

  it('renderiza input com placeholder', () => {
    const html = renderToStaticMarkup(
      <SearchField value="" onChange={() => undefined} placeholder="Buscar cargas..." />,
    );

    expect(html).toContain('type="search"');
    expect(html).toContain('placeholder="Buscar cargas..."');
  });

  it('chama onChange com valor', () => {
    const onChange = vi.fn();
    const element = createElement(SearchField, {
      value: 'soja',
      onChange,
    });

    element.props.onChange('milho');
    expect(onChange).toHaveBeenCalledWith('milho');
  });

  it('respeita disabled', () => {
    const html = renderToStaticMarkup(
      <SearchField value="" onChange={() => undefined} disabled />,
    );

    expect(html).toContain('disabled');
  });

  it('renderiza rightSlot e ícone', () => {
    const html = renderToStaticMarkup(
      <SearchField
        value=""
        onChange={() => undefined}
        icon={<span data-testid="search-icon">S</span>}
        rightSlot={<span data-testid="slot">F</span>}
      />,
    );

    expect(html).toContain('data-testid="search-icon"');
    expect(html).toContain('data-testid="slot"');
  });

  it('aceita className', () => {
    const html = renderToStaticMarkup(
      <SearchField value="" onChange={() => undefined} className="lab-search" />,
    );

    expect(html).toContain('lab-search');
  });

  it('expõe densidade DS v2 light via ancestral data-theme', () => {
    const stylesSource = readFileSync(searchFieldStylesPath, 'utf8');

    expect(stylesSource).toContain(":global([data-theme='light']) .field");
    expect(stylesSource).toContain('--hy-size-control-height');
    expect(stylesSource).toContain('--hy-radius-search');
  });
});
