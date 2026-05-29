import { isValidElement, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LiquidGlassToolbar } from '@/shared/design-system/primitives/liquid-glass-toolbar';

const leadingAction = {
  label: 'Voltar',
  icon: <span data-testid="leading-icon">←</span>,
  onClick: vi.fn(),
};

const trailingAction = {
  label: 'Confirmar',
  icon: <span data-testid="trailing-icon">↑</span>,
  tone: 'accent' as const,
  onClick: vi.fn(),
};

describe('LiquidGlassToolbar', () => {
  it('renderiza title', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar title="Cargas" variant="default" />,
    );

    expect(html).toContain('Cargas');
  });

  it('renderiza subtitle', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar
        title="Cargas"
        subtitle="12 ativas"
        variant="twoLine"
      />,
    );

    expect(html).toContain('Cargas');
    expect(html).toContain('12 ativas');
  });

  it('renderiza leadingAction', () => {
    const tree = (
      <LiquidGlassToolbar title="Cargas" leadingAction={leadingAction} />
    );
    const html = renderToStaticMarkup(tree);

    expect(html).toContain('aria-label="Voltar"');
    expect(html).toContain('←');
    expect(findActionControl(tree, 'Voltar')).not.toBeNull();
  });

  it('renderiza trailingAction', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar title="Cargas" trailingAction={trailingAction} />,
    );

    expect(html).toContain('aria-label="Confirmar"');
    expect(html).toContain('↑');
  });

  it('chama leadingAction.onClick', () => {
    const onClick = vi.fn();
    const element = findActionControl(
      <LiquidGlassToolbar
        title="Cargas"
        leadingAction={{ ...leadingAction, onClick }}
      />,
      'Voltar',
    );

    element?.props.onClick?.({} as MouseEvent<HTMLButtonElement>);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('chama trailingAction.onClick', () => {
    const onClick = vi.fn();
    const element = findActionControl(
      <LiquidGlassToolbar
        title="Cargas"
        trailingAction={{ ...trailingAction, onClick }}
      />,
      'Confirmar',
    );

    element?.props.onClick?.({} as MouseEvent<HTMLButtonElement>);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('aplica variant default', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar title="Cargas" variant="default" />,
    );

    expect(html).toContain('data-variant="default"');
  });

  it('aplica variant twoLine', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar
        title="Cargas"
        subtitle="12 ativas"
        variant="twoLine"
      />,
    );

    expect(html).toContain('data-variant="twoLine"');
    expect(html).toContain('data-title-layout="twoLine"');
  });

  it('aplica variant twoLineLeft', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar
        title="Cargas"
        subtitle="12 ativas"
        variant="twoLineLeft"
      />,
    );

    expect(html).toContain('data-variant="twoLineLeft"');
    expect(html).toContain('data-title-layout="twoLineLeft"');
  });

  it('aplica variant largeTitle', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar
        title="Cargas"
        subtitle="Operações"
        variant="largeTitle"
      />,
    );

    expect(html).toContain('data-variant="largeTitle"');
    expect(html).toContain('data-title-layout="largeTitle"');
  });

  it('aplica variant compactLarge', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar title="Cargas" variant="compactLarge" />,
    );

    expect(html).toContain('data-variant="compactLarge"');
    expect(html).toContain('data-title-layout="compactLarge"');
  });

  it('aplica context sheet', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar title="Filtros" context="sheet" />,
    );

    expect(html).toContain('data-context="sheet"');
  });

  it('showGrabber renderiza grabber', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar title="Filtros" context="sheet" showGrabber />,
    );

    expect(html).toContain('grabberWrap');
  });

  it('tone é aplicado', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassToolbar title="Cargas" tone="dark" />,
    );

    expect(html).toContain('data-tone="dark"');
  });

  it('action disabled não chama callback', () => {
    const onClick = vi.fn();
    const element = findActionControl(
      <LiquidGlassToolbar
        title="Cargas"
        trailingAction={{
          ...trailingAction,
          disabled: true,
          onClick,
        }}
      />,
      'Confirmar',
    );

    expect(element?.props.disabled).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });
});

type ActionControlElement = ReactElement<{
  'aria-label'?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: ReactNode;
}>;

function findActionControl(
  node: ReactNode,
  ariaLabel: string,
): ActionControlElement | null {
  return findButton(expandFunctionComponents(node), ariaLabel);
}

function expandFunctionComponents(node: ReactNode): ReactNode {
  if (!isValidElement(node)) {
    return node;
  }

  const element = node as ReactElement<{ children?: ReactNode }>;

  if (typeof element.type === 'function') {
    const rendered = (
      element.type as (props: Record<string, unknown>) => ReactNode
    )(element.props as Record<string, unknown>);
    return expandFunctionComponents(rendered);
  }

  const { children } = element.props;
  if (children == null) {
    return element;
  }

  const list = Array.isArray(children) ? children : [children];
  const expandedChildren = list.map((child) => expandFunctionComponents(child));

  if (expandedChildren === list) {
    return element;
  }

  return {
    ...element,
    props: {
      ...element.props,
      children:
        expandedChildren.length === 1 ? expandedChildren[0] : expandedChildren,
    },
  };
}

function isActionControlType(type: unknown): boolean {
  if (type === 'button') {
    return true;
  }

  return typeof type === 'function' && type.name === 'LiquidGlassButton';
}

function findButton(node: ReactNode, ariaLabel: string): ActionControlElement | null {
  if (!isValidElement(node)) {
    return null;
  }

  const element = node as ActionControlElement;

  if (
    isActionControlType(element.type) &&
    element.props['aria-label'] === ariaLabel
  ) {
    return element;
  }

  const { children } = element.props;
  if (children == null) {
    return null;
  }

  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    const match = findButton(child, ariaLabel);
    if (match) {
      return match;
    }
  }

  return null;
}
