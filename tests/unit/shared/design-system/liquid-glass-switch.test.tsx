import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LiquidGlassSwitch } from '@/shared/design-system/primitives/liquid-glass-switch';

describe('LiquidGlassSwitch', () => {
  it('renderiza checked', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSwitch checked label="Notificações" />,
    );

    expect(html).toContain('checked');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('data-checked="true"');
  });

  it('renderiza unchecked', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSwitch checked={false} aria-label="Alternar" />,
    );

    expect(html).not.toContain('checked=""');
    expect(html).toContain('aria-checked="false"');
    expect(html).toContain('data-checked="false"');
  });

  it('chama onChange', () => {
    const onChange = vi.fn();
    const element = LiquidGlassSwitch({
      checked: false,
      onChange,
      'aria-label': 'Alternar',
    });
    const switchControl = element.props.children;
    const input = switchControl.props.children[0];

    input.props.onChange?.({
      target: { checked: true },
    } as Parameters<NonNullable<typeof input.props.onChange>>[0]);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('disabled não chama onChange', () => {
    const onChange = vi.fn();
    const element = LiquidGlassSwitch({
      checked: false,
      disabled: true,
      onChange,
      'aria-label': 'Alternar',
    });
    const switchControl = element.props.children;
    const input = switchControl.props.children[0];

    expect(input.props.disabled).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSwitch checked tone="dark" aria-label="Alternar" />,
    );

    expect(html).toContain('data-tone="dark"');
  });

  it('exige label ou aria-label em desenvolvimento', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(() =>
      renderToStaticMarkup(<LiquidGlassSwitch checked={false} />),
    ).toThrow(/label|aria-label/i);

    vi.unstubAllEnvs();
  });

  it('aplica className', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSwitch
        checked
        className="custom-switch"
        aria-label="Alternar"
      />,
    );

    expect(html).toContain('custom-switch');
  });
});
