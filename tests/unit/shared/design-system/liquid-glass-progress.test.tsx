import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  LiquidGlassProgressBar,
  LiquidGlassSpinner,
} from '@/shared/design-system/primitives/liquid-glass-progress';

describe('LiquidGlassProgressBar', () => {
  it('renderiza', () => {
    const html = renderToStaticMarkup(<LiquidGlassProgressBar value={50} />);

    expect(html).toContain('role="progressbar"');
    expect(html).toMatch(/width:\s*50%/);
  });

  it('aplica aria-valuenow', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassProgressBar value={42} max={100} aria-label="Carregando" />,
    );

    expect(html).toContain('aria-valuenow="42"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-label="Carregando"');
  });

  it('faz clamp de value', () => {
    const belowMin = renderToStaticMarkup(
      <LiquidGlassProgressBar value={-10} max={100} />,
    );
    const aboveMax = renderToStaticMarkup(
      <LiquidGlassProgressBar value={150} max={100} />,
    );

    expect(belowMin).toContain('aria-valuenow="0"');
    expect(belowMin).toContain('width:0%');
    expect(aboveMax).toContain('aria-valuenow="100"');
    expect(aboveMax).toContain('width:100%');
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassProgressBar value={50} tone="dark" />,
    );

    expect(html).toContain('data-tone="dark"');
  });
});

describe('LiquidGlassSpinner', () => {
  it('renderiza', () => {
    const html = renderToStaticMarkup(<LiquidGlassSpinner />);

    expect(html).toContain('role="status"');
  });

  it('aplica size', () => {
    const html = renderToStaticMarkup(<LiquidGlassSpinner size="lg" />);

    expect(html).toContain('data-size="lg"');
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(<LiquidGlassSpinner tone="light" />);

    expect(html).toContain('data-tone="light"');
  });

  it('renderiza label quando showLabel=true', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSpinner label="Carregando dados" showLabel />,
    );

    expect(html).toContain('Carregando dados');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="Carregando dados"');
  });
});
