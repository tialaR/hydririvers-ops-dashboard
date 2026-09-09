import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LiquidGlassScrollEdge } from '@/shared/design-system/primitives/liquid-glass-scroll-edge';

describe('LiquidGlassScrollEdge', () => {
  it('renderiza edge top', () => {
    const html = renderToStaticMarkup(<LiquidGlassScrollEdge edge="top" />);

    expect(html).toContain('data-edge="top"');
  });

  it('renderiza edge bottom', () => {
    const html = renderToStaticMarkup(<LiquidGlassScrollEdge edge="bottom" />);

    expect(html).toContain('data-edge="bottom"');
  });

  it('renderiza edge leading', () => {
    const html = renderToStaticMarkup(<LiquidGlassScrollEdge edge="leading" />);

    expect(html).toContain('data-edge="leading"');
  });

  it('renderiza edge trailing', () => {
    const html = renderToStaticMarkup(<LiquidGlassScrollEdge edge="trailing" />);

    expect(html).toContain('data-edge="trailing"');
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassScrollEdge edge="top" tone="dark" />,
    );

    expect(html).toContain('data-tone="dark"');
  });

  it('aplica variant', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassScrollEdge edge="bottom" variant="solid" />,
    );

    expect(html).toContain('data-variant="solid"');
  });

  it('aplica size', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassScrollEdge edge="top" size="lg" />,
    );

    expect(html).toContain('data-size="lg"');
  });

  it('visible=false não renderiza', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassScrollEdge edge="top" visible={false} />,
    );

    expect(html).toBe('');
  });

  it('aria-hidden existe', () => {
    const html = renderToStaticMarkup(<LiquidGlassScrollEdge edge="top" />);

    expect(html).toContain('aria-hidden');
  });
});
