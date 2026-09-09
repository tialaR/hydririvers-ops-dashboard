import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LiquidGlassTabBar } from '@/shared/design-system/primitives/liquid-glass-tab-bar';

const sampleItems = [
  { id: 'home', label: 'Início', icon: <span data-testid="icon-home">H</span> },
  { id: 'cargo', label: 'Cargas', icon: <span data-testid="icon-cargo">C</span> },
  { id: 'map', label: 'Mapa', icon: <span data-testid="icon-map">M</span> },
];

describe('LiquidGlassTabBar', () => {
  it('renderiza items', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTabBar items={sampleItems} activeId="home" />,
    );

    expect(html).toContain('Início');
    expect(html).toContain('Cargas');
    expect(html).toContain('Mapa');
    expect(html).toContain('data-testid="icon-home"');
  });

  it('renderiza labels quando showLabels=true', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTabBar
        items={sampleItems}
        activeId="home"
        showLabels
        variant="expanded"
      />,
    );

    expect(html).toContain('Início');
    expect(html).toContain('Cargas');
  });

  it('oculta labels quando showLabels=false', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTabBar
        items={sampleItems}
        activeId="home"
        showLabels={false}
        variant="expanded"
      />,
    );

    expect(html).not.toContain('Início');
    expect(html).not.toContain('Cargas');
    expect(html).toContain('data-testid="icon-home"');
  });

  it('aplica activeId com aria-current', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTabBar items={sampleItems} activeId="cargo" />,
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Cargas');
  });

  it('chama onChange ao clicar tab', () => {
    const onChange = vi.fn();
    const element = LiquidGlassTabBar({
      items: sampleItems,
      activeId: 'home',
      onChange,
    });

    const group = element.props.children[0];
    const cargoButton = group.props.children[1];
    cargoButton.props.onClick();

    expect(onChange).toHaveBeenCalledWith('cargo');
  });

  it('não chama onChange para disabled', () => {
    const onChange = vi.fn();
    const items = [
      ...sampleItems.slice(0, 2),
      { ...sampleItems[2], disabled: true },
    ];

    const element = LiquidGlassTabBar({
      items,
      activeId: 'home',
      onChange,
    });

    const group = element.props.children[0];
    const mapButton = group.props.children[2];
    mapButton.props.onClick();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renderiza separateSearch', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTabBar
        items={sampleItems}
        activeId="home"
        separateSearch
        searchLabel="Buscar cargas"
      />,
    );

    expect(html).toContain('data-separate-search="true"');
    expect(html).toContain('aria-label="Buscar cargas"');
  });

  it('search chama onSearch', () => {
    const onSearch = vi.fn();
    const element = LiquidGlassTabBar({
      items: sampleItems,
      activeId: 'home',
      separateSearch: true,
      onSearch,
    });

    const searchButton = element.props.children[1];
    searchButton?.props?.onClick?.();

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('aplica variant expanded', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTabBar items={sampleItems} activeId="home" variant="expanded" />,
    );

    expect(html).toContain('data-variant="expanded"');
  });

  it('aplica variant minimized', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTabBar items={sampleItems} activeId="home" variant="minimized" />,
    );

    expect(html).toContain('data-variant="minimized"');
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTabBar items={sampleItems} activeId="home" tone="dark" />,
    );

    expect(html).toContain('data-tone="dark"');
  });

  it('renderiza badge', () => {
    const items = [
      { ...sampleItems[0], badge: 3 },
      sampleItems[1],
    ];

    const html = renderToStaticMarkup(
      <LiquidGlassTabBar items={items} activeId="home" />,
    );

    expect(html).toContain('>3<');
    expect(html).toContain('aria-label="Início: 3"');
  });
});
