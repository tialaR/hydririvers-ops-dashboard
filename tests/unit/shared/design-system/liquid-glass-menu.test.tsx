import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  LiquidGlassEditMenu,
  LiquidGlassMenu,
} from '@/shared/design-system/primitives/liquid-glass-menu';

describe('LiquidGlassMenu', () => {
  it('renderiza itens', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassMenu
        aria-label="Menu teste"
        items={[
          { id: 'a', label: 'Ação A' },
          { id: 'b', label: 'Ação B' },
        ]}
      />,
    );

    expect(html).toContain('Ação A');
    expect(html).toContain('Ação B');
    expect(html).toContain('role="menu"');
    expect(html).toContain('role="menuitem"');
  });

  it('chama onSelect ao clicar', () => {
    const onSelect = vi.fn();

    const element = LiquidGlassMenu({
      items: [{ id: 'a', label: 'Ação A', onSelect }],
    });

    const block = element.props.children[0] as any;
    const button = Array.isArray(block.props.children)
      ? block.props.children.find((c: any) => c?.type === 'button')
      : block.props.children;

    button.props.onClick();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('disabled não chama onSelect', () => {
    const onSelect = vi.fn();

    const element = LiquidGlassMenu({
      items: [{ id: 'a', label: 'Ação A', disabled: true, onSelect }],
    });

    const block = element.props.children[0] as any;
    const button = Array.isArray(block.props.children)
      ? block.props.children.find((c: any) => c?.type === 'button')
      : block.props.children;

    button.props.onClick();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('destructive aplica estado visual', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassMenu
        items={[
          { id: 'a', label: 'Apagar', destructive: true, onSelect: vi.fn() },
        ]}
      />,
    );

    expect(html).toContain('data-destructive="true"');
  });

  it('shortcut renderiza', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassMenu
        items={[
          { id: 'a', label: 'Copiar', shortcut: '⌘ C', onSelect: vi.fn() },
        ]}
      />,
    );

    expect(html).toContain('⌘ C');
  });

  it('subtitle renderiza', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassMenu
        items={[
          { id: 'a', label: 'Mover', subtitle: 'Sugerido', onSelect: vi.fn() },
        ]}
      />,
    );

    expect(html).toContain('Sugerido');
  });

  it('submenu indicator renderiza', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassMenu items={[{ id: 'a', label: 'Submenu', hasSubmenu: true }]} />,
    );

    expect(html).toContain('›');
  });

  it('section title renderiza', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassMenu
        items={[
          {
            id: 'a',
            label: 'Ação',
            sectionTitle: 'Seção',
            onSelect: vi.fn(),
          },
        ]}
      />,
    );

    expect(html).toContain('Seção');
  });

  it('tone e className são aplicados', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassMenu
        tone="dark"
        className="custom-menu-class"
        items={[{ id: 'a', label: 'Ação', onSelect: vi.fn() }]}
      />,
    );

    expect(html).toContain('data-tone="dark"');
    expect(html).toContain('custom-menu-class');
  });
});

describe('LiquidGlassEditMenu', () => {
  it('renderiza itens', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassEditMenu
        aria-label="Edit menu teste"
        items={[{ id: 'a', label: 'Desfazer' }, { id: 'b', label: 'Refazer' }]}
      />,
    );

    expect(html).toContain('Desfazer');
    expect(html).toContain('Refazer');
    expect(html).toContain('role="menu"');
    expect(html).toContain('role="menuitem"');
  });

  it('chama onSelect ao clicar', () => {
    const onSelect = vi.fn();

    const element = LiquidGlassEditMenu({
      items: [{ id: 'a', label: 'Desfazer', onSelect }],
    });

    const block = element.props.children[0] as any;
    const button = Array.isArray(block.props.children)
      ? block.props.children.find((c: any) => c?.type === 'button')
      : block.props.children;

    button.props.onClick();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('tone e className são aplicados', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassEditMenu
        tone="light"
        className="custom-edit-menu-class"
        items={[{ id: 'a', label: 'Cortar', onSelect: vi.fn() }]}
      />,
    );

    expect(html).toContain('data-tone="light"');
    expect(html).toContain('custom-edit-menu-class');
  });
});

