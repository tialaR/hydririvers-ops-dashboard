import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LiquidGlassTextField } from '@/shared/design-system/primitives/liquid-glass-text-field';

describe('LiquidGlassTextField', () => {
  it('renderiza value', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTextField
        value="Valor preenchido"
        onChange={() => undefined}
        aria-label="Campo"
      />,
    );

    expect(html).toContain('value="Valor preenchido"');
  });

  it('renderiza placeholder', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTextField
        value=""
        onChange={() => undefined}
        placeholder="Value"
        aria-label="Campo"
      />,
    );

    expect(html).toContain('placeholder="Value"');
  });

  it('chama onChange', () => {
    const onChange = vi.fn();
    const element = LiquidGlassTextField({
      value: '',
      onChange,
      'aria-label': 'Campo',
    });
    const contents = element.props.children[0];
    const input = contents.props.children[0];

    input.props.onChange?.({
      target: { value: 'novo' },
    } as Parameters<NonNullable<typeof input.props.onChange>>[0]);

    expect(onChange).toHaveBeenCalledWith('novo');
  });

  it('renderiza botão limpar quando clearable e há value', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTextField
        value="Value"
        onChange={() => undefined}
        clearable
        aria-label="Campo"
      />,
    );

    expect(html).toContain('aria-label="Limpar campo"');
    expect(html).toContain('<button');
  });

  it('chama onClear', () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const element = LiquidGlassTextField({
      value: 'Value',
      onChange,
      clearable: true,
      onClear,
      'aria-label': 'Campo',
    });
    const contents = element.props.children[0];
    const clearButton = contents.props.children[1];

    clearButton.props.onClick?.();

    expect(onChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('disabled bloqueia input', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTextField
        value=""
        onChange={() => undefined}
        disabled
        aria-label="Campo"
      />,
    );

    expect(html).toContain('disabled');
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassTextField
        value=""
        onChange={() => undefined}
        tone="dark"
        aria-label="Campo"
      />,
    );

    expect(html).toContain('data-tone="dark"');
  });
});
