import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  LiquidGlassResizeHandle,
  LiquidGlassWindowControls,
  LiquidGlassWindowPanel,
} from '@/shared/design-system/primitives/liquid-glass-window';

function findElement(
  node: ReactNode,
  predicate: (element: ReactElement) => boolean,
): ReactElement | null {
  if (!isValidElement(node)) {
    return null;
  }

  if (predicate(node)) {
    return node;
  }

  const { children } = node.props as { children?: ReactNode };
  if (children == null) {
    return null;
  }

  const childList = Array.isArray(children) ? children : [children];
  for (const child of childList) {
    const match = findElement(child, predicate);
    if (match) {
      return match;
    }
  }

  return null;
}

describe('LiquidGlassWindowControls', () => {
  it('renderiza estado active', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassWindowControls state="active" />,
    );

    expect(html).toContain('data-state="active"');
  });

  it('renderiza estado inactive', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassWindowControls state="inactive" />,
    );

    expect(html).toContain('data-state="inactive"');
  });

  it('renderiza dots decorativos sem callbacks', () => {
    const html = renderToStaticMarkup(<LiquidGlassWindowControls />);

    expect(html).toContain('aria-hidden');
    expect(html).not.toContain('<button');
  });

  it('chama callbacks quando existem', () => {
    const onClose = vi.fn();
    const onMinimize = vi.fn();
    const onExpand = vi.fn();

    const tree = LiquidGlassWindowControls({
      onClose,
      onMinimize,
      onExpand,
    });

    const closeButton = findElement(
      tree,
      (node) =>
        node.type === 'button' &&
        (node.props as { 'aria-label'?: string })['aria-label'] === 'Fechar',
    );
    const minimizeButton = findElement(
      tree,
      (node) =>
        node.type === 'button' &&
        (node.props as { 'aria-label'?: string })['aria-label'] === 'Minimizar',
    );
    const expandButton = findElement(
      tree,
      (node) =>
        node.type === 'button' &&
        (node.props as { 'aria-label'?: string })['aria-label'] === 'Expandir',
    );

    expect(closeButton).toBeTruthy();
    expect(minimizeButton).toBeTruthy();
    expect(expandButton).toBeTruthy();

    (closeButton?.props as { onClick?: () => void }).onClick?.();
    (minimizeButton?.props as { onClick?: () => void }).onClick?.();
    (expandButton?.props as { onClick?: () => void }).onClick?.();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onMinimize).toHaveBeenCalledTimes(1);
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('aplica className', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassWindowControls className="custom-controls" />,
    );

    expect(html).toContain('custom-controls');
  });
});

describe('LiquidGlassResizeHandle', () => {
  it('renderiza handle visível', () => {
    const html = renderToStaticMarkup(<LiquidGlassResizeHandle />);

    expect(html).toContain('data-visible="true"');
    expect(html).toContain('aria-hidden');
  });

  it('oculta handle quando visible=false', () => {
    const html = renderToStaticMarkup(<LiquidGlassResizeHandle visible={false} />);

    expect(html).toContain('data-visible="false"');
  });

  it('aplica className', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassResizeHandle className="custom-resize" />,
    );

    expect(html).toContain('custom-resize');
  });
});

describe('LiquidGlassWindowPanel', () => {
  it('renderiza children', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassWindowPanel>
        <p>Conteúdo da janela</p>
      </LiquidGlassWindowPanel>,
    );

    expect(html).toContain('Conteúdo da janela');
  });

  it('renderiza resizeHandle quando habilitado', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassWindowPanel resizeHandle>
        <p>Painel</p>
      </LiquidGlassWindowPanel>,
    );

    expect(html).toContain('data-visible="true"');
  });

  it('não renderiza resizeHandle por padrão', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassWindowPanel>
        <p>Painel</p>
      </LiquidGlassWindowPanel>,
    );

    expect(html).not.toContain('data-visible="true"');
  });

  it('renderiza slot de controls', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassWindowPanel
        controls={<LiquidGlassWindowControls state="active" />}
      >
        <p>Painel</p>
      </LiquidGlassWindowPanel>,
    );

    expect(html).toContain('data-state="active"');
  });

  it('aplica tone, size e className', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassWindowPanel
        tone="dark"
        size="lg"
        className="custom-panel"
      >
        <p>Painel</p>
      </LiquidGlassWindowPanel>,
    );

    expect(html).toContain('data-tone="dark"');
    expect(html).toContain('data-size="lg"');
    expect(html).toContain('custom-panel');
  });
});
