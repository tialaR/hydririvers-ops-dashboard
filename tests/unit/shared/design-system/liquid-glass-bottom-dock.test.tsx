import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LiquidGlassBottomDock } from '@/shared/design-system/primitives/liquid-glass-bottom-dock';

const items = [
  { id: 'cargas', label: 'Cargas', icon: <span>⌂</span> },
  { id: 'filters', label: 'Filtros', icon: <span>☰</span> },
  { id: 'attention', label: 'Atenção', icon: <span>!</span> },
  { id: 'map', label: 'Mapa', icon: <span>◎</span>, disabled: true },
];

describe('LiquidGlassBottomDock', () => {
  it('renderiza track, itens e bolha ativa', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassBottomDock items={items} activeId="filters" tone="dark" aria-label="Dock" />,
    );

    expect(html).toContain('liquid-glass-bottom-dock-active-bubble');
    expect(html).toContain('Cargas');
    expect(html).toContain('Filtros');
    expect(html).toContain('data-active="true"');
    expect(html).toContain('aria-current="page"');
  });

  it('aplica estilo inline na bolha ativa após layout', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassBottomDock items={items} activeId="attention" tone="dark" />,
    );

    expect(html).toContain('activeBubble');
  });

  it('marca item desabilitado com aria-disabled', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassBottomDock items={items} activeId="cargas" tone="dark" />,
    );

    expect(html).toContain('Mapa');
    expect(html).toContain('aria-disabled="true"');
  });
});
