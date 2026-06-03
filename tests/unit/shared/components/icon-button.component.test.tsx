import { createElement, type MouseEvent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { IconButton } from '@/shared/components/icon-button';

describe('IconButton', () => {
  it('renderiza button com aria-label', () => {
    const html = renderToStaticMarkup(
      <IconButton ariaLabel="Abrir filtros" icon={<span data-testid="icon">F</span>} />,
    );

    expect(html).toContain('aria-label="Abrir filtros"');
    expect(html).toContain('type="button"');
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

  it('renderiza badgeCount quando maior que zero', () => {
    const html = renderToStaticMarkup(
      <IconButton ariaLabel="Filtros" icon={<span>F</span>} badgeCount={3} />,
    );

    expect(html).toContain('>3<');
  });

  it('aplica estado ativo com aria-pressed', () => {
    const html = renderToStaticMarkup(
      <IconButton ariaLabel="Mapa" icon={<span>M</span>} isActive variant="map" />,
    );

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-active="true"');
  });

  it('aplica classes de variant e size', () => {
    const html = renderToStaticMarkup(
      <IconButton
        ariaLabel="Fechar"
        icon={<span>X</span>}
        variant="close"
        size="sm"
        className="sheet-close"
      />,
    );

    expect(html).toContain('sheet-close');
  });
});
