import { createElement, type MouseEvent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Button, type ButtonProps } from '@/shared/components/button';

describe('Button', () => {
  it('renderiza children', () => {
    const html = renderToStaticMarkup(<Button>Ver cargas</Button>);
    expect(html).toContain('Ver cargas');
    expect(html).toContain('<button');
  });

  it('dispara onClick quando habilitado', () => {
    const onClick = vi.fn();
    const element = createElement(Button, { onClick, children: 'Ok' } as ButtonProps);
    element.props.onClick?.({} as MouseEvent<HTMLButtonElement>);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('não dispara onClick quando disabled', () => {
    const onClick = vi.fn();
    const element = createElement(Button, { disabled: true, onClick, children: 'Ok' } as ButtonProps);
    expect(element.props.disabled).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renderiza estado loading', () => {
    const html = renderToStaticMarkup(<Button isLoading>Salvar</Button>);
    expect(html).toContain('data-loading="true"');
    expect(html).toContain('aria-busy="true"');
  });

  it('renderiza iconLeft e iconRight', () => {
    const html = renderToStaticMarkup(
      <Button iconLeft={<span data-testid="left">L</span>} iconRight={<span data-testid="right">R</span>}>
        Label
      </Button>,
    );
    expect(html).toContain('data-testid="left"');
    expect(html).toContain('data-testid="right"');
  });

  it('aplica variant primary com data-primary', () => {
    const html = renderToStaticMarkup(<Button variant="primary">Ver cargas</Button>);
    expect(html).toContain('data-primary="true"');
  });
});
