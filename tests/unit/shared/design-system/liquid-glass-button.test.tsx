import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LiquidGlassButton } from '@/shared/design-system/primitives/liquid-glass-button';

describe('LiquidGlassButton', () => {
  it('renderiza label via prop label', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassButton label="Play" variant="text" />,
    );

    expect(html).toContain('Play');
  });

  it('renderiza children', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassButton variant="text">Custom</LiquidGlassButton>,
    );

    expect(html).toContain('Custom');
  });

  it('renderiza icon no variant icon', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassButton
        variant="icon"
        aria-label="Confirmar"
        icon={<span data-testid="icon-mark">✓</span>}
      />,
    );

    expect(html).toContain('✓');
    expect(html).toContain('aria-label="Confirmar"');
  });

  it('variant icon exige aria-label em desenvolvimento', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(() =>
      renderToStaticMarkup(
        <LiquidGlassButton variant="icon" icon={<span>✓</span>} />,
      ),
    ).toThrow(/aria-label/i);

    vi.unstubAllEnvs();
  });

  it('aplica data-variant, data-tone, data-fill, data-size e data-theme-tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassButton
        label="Play"
        variant="text"
        tone="accent"
        fill="tinted"
        size="lg"
        themeTone="dark"
      />,
    );

    expect(html).toContain('data-variant="text"');
    expect(html).toContain('data-tone="accent"');
    expect(html).toContain('data-fill="tinted"');
    expect(html).toContain('data-size="lg"');
    expect(html).toContain('data-theme-tone="dark"');
  });

  it('disabled bloqueia interação via atributo disabled', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassButton label="Play" disabled />,
    );

    expect(html).toContain('disabled');
  });

  it('selected aplica atributo visual', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassButton label="Play" selected />,
    );

    expect(html).toContain('data-selected="true"');
    expect(html).toContain('aria-pressed="true"');
  });

  it('onClick é chamado quando habilitado', () => {
    const onClick = vi.fn();
    const element = LiquidGlassButton({ label: 'Play', onClick });
    element.props.onClick?.({} as Parameters<NonNullable<typeof onClick>>[0]);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('onClick não é chamado quando disabled', () => {
    const onClick = vi.fn();
    const element = LiquidGlassButton({ label: 'Play', disabled: true, onClick });

    expect(element.props.disabled).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });
});
