import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LiquidGlassSurface } from '@/shared/design-system/primitives/liquid-glass-surface';

describe('LiquidGlassSurface', () => {
  it('renderiza children', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSurface>
        <p>Conteúdo</p>
      </LiquidGlassSurface>,
    );

    expect(html).toContain('Conteúdo');
  });

  it('aplica size small', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSurface size="small">A</LiquidGlassSurface>,
    );

    expect(html).toContain('data-size="small"');
  });

  it('aplica size medium', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSurface size="medium">A</LiquidGlassSurface>,
    );

    expect(html).toContain('data-size="medium"');
  });

  it('aplica size large', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSurface size="large">A</LiquidGlassSurface>,
    );

    expect(html).toContain('data-size="large"');
  });

  it('aplica variant dynamic', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSurface variant="dynamic">A</LiquidGlassSurface>,
    );

    expect(html).toContain('data-variant="dynamic"');
  });

  it('aplica variant tinted', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSurface variant="tinted">A</LiquidGlassSurface>,
    );

    expect(html).toContain('data-variant="tinted"');
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSurface tone="dark">A</LiquidGlassSurface>,
    );

    expect(html).toContain('data-tone="dark"');
  });

  it('aplica elevated', () => {
    const elevated = renderToStaticMarkup(
      <LiquidGlassSurface elevated>A</LiquidGlassSurface>,
    );
    const flat = renderToStaticMarkup(
      <LiquidGlassSurface elevated={false}>A</LiquidGlassSurface>,
    );

    expect(elevated).toContain('data-elevated="true"');
    expect(flat).toContain('data-elevated="false"');
  });

  it('renderiza tag via as', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSurface as="section">A</LiquidGlassSurface>,
    );

    expect(html).toMatch(/<section\b/);
  });

  it('aplica className', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSurface className="custom-surface">A</LiquidGlassSurface>,
    );

    expect(html).toContain('custom-surface');
  });
});
