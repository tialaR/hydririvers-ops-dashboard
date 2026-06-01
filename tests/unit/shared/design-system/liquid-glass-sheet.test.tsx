import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { handleSheetEscapeKey } from '@/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet-keyboard';
import { LiquidGlassSheet } from '@/shared/design-system/primitives/liquid-glass-sheet';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useId: () => 'sheet-title-id',
    useEffect: (effect: () => void | (() => void)) => {
      const cleanup = effect();
      return typeof cleanup === 'function' ? cleanup : undefined;
    },
    useLayoutEffect: (effect: () => void | (() => void)) => {
      const cleanup = effect();
      return typeof cleanup === 'function' ? cleanup : undefined;
    },
  };
});

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

describe('LiquidGlassSheet', () => {
  it('aplica inert quando open=false sem usar aria-hidden', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open={false} title="Filtros">
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('data-open="false"');
    expect(html).toContain('inert=""');
    expect(html).not.toContain('aria-hidden="true"');
  });

  it('renderiza title', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open title="Minha carga">
        Item
      </LiquidGlassSheet>,
    );

    expect(html).toContain('Minha carga');
    expect(html).toContain('id="sheet-title-id"');
  });

  it('renderiza children', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open>
        <p>Linha da lista</p>
      </LiquidGlassSheet>,
    );

    expect(html).toContain('Linha da lista');
  });

  it('close button fica à direita do título (padrão mobile)', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open title="CARGO-001" closeLabel="Fechar">
        Conteúdo
      </LiquidGlassSheet>,
    );

    const titleIndex = html.indexOf('CARGO-001');
    const closeIndex = html.indexOf('aria-label="Fechar"');
    expect(titleIndex).toBeGreaterThan(-1);
    expect(closeIndex).toBeGreaterThan(titleIndex);
  });

  it('Escape chama onClose', () => {
    const onClose = vi.fn();
    const preventDefault = vi.fn();

    handleSheetEscapeKey({ key: 'Escape', preventDefault }, onClose);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('primary action aparece quando showPrimaryAction=true', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet
        open
        showPrimaryAction
        primaryActionLabel="Confirmar"
        title="Título"
      >
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('aria-label="Confirmar"');
    expect(html).toMatch(/primaryButton/);
  });

  it('aplica variant fullScreen', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open variant="fullScreen">
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('data-variant="fullScreen"');
    expect(html).toMatch(/variant_fullScreen/);
  });

  it('aplica variant inspector', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open variant="inspector">
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('data-variant="inspector"');
    expect(html).toMatch(/variant_inspector/);
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open tone="dark">
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('data-tone="dark"');
  });

  it('showGrabber=false oculta grabber', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open showGrabber={false}>
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).not.toMatch(/grabberWrap/);
    expect(html).not.toMatch(/"grabber"/);
  });

  it('expõe role e aria básicos quando dialog aberto', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open title="Título" role="dialog">
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="sheet-title-id"');
  });

  it('aceita role region sem aria-modal', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open role="region" title="Painel">
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('role="region"');
    expect(html).not.toContain('aria-modal');
  });

  it('aplica stacked via data-stacked', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open stacked>
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('data-stacked="true"');
    expect(html).toMatch(/stackedRail/);
  });

  it('expõe drag/snap quando draggable=true', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet
        open
        draggable
        snapPoints={['content', 'medium', 'expanded']}
        defaultSnapPoint="content"
      >
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('data-draggable="true"');
    expect(html).toContain('data-snap-point="content"');
    expect(html).toContain('data-scrollable="false"');
  });

  it('mantém altura inline em sheets arrastáveis para animar snap vertical', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSheet open draggable defaultSnapPoint="medium">
        Conteúdo
      </LiquidGlassSheet>,
    );

    expect(html).toContain('height:');
    expect(html).toContain('data-draggable="true"');
  });
});
