import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LiquidGlassSearchField } from '@/shared/design-system/primitives/liquid-glass-search-field';

describe('LiquidGlassSearchField', () => {
  it('renderiza input', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSearchField value="" onChange={() => undefined} />,
    );

    expect(html).toContain('type="search"');
    expect(html).toContain('aria-label="Buscar"');
  });

  it('renderiza placeholder', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSearchField
        value=""
        onChange={() => undefined}
        placeholder="Buscar cargas"
      />,
    );

    expect(html).toContain('placeholder="Buscar cargas"');
  });

  it('chama onChange', () => {
    const onChange = vi.fn();
    const element = LiquidGlassSearchField({ value: '', onChange });
    const input = element.props.children[1];

    input.props.onChange?.({
      target: { value: 'termo' },
    } as Parameters<NonNullable<typeof input.props.onChange>>[0]);

    expect(onChange).toHaveBeenCalledWith('termo');
  });

  it('aplica value', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSearchField value="Search Term" onChange={() => undefined} />,
    );

    expect(html).toContain('value="Search Term"');
    expect(html).toContain('data-state="value"');
  });

  it('renderiza microphone quando showMicrophone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSearchField
        value=""
        onChange={() => undefined}
        showMicrophone
      />,
    );

    expect(html).toContain('micGlyph');
  });

  it('chama onMicrophoneClick', () => {
    const onMicrophoneClick = vi.fn();
    const element = LiquidGlassSearchField({
      value: '',
      onChange: () => undefined,
      onMicrophoneClick,
    });
    const micButton = element.props.children[2];

    micButton.props.onClick?.();

    expect(onMicrophoneClick).toHaveBeenCalledTimes(1);
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSearchField
        value=""
        onChange={() => undefined}
        tone="dark"
      />,
    );

    expect(html).toContain('data-tone="dark"');
  });

  it('disabled bloqueia input', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSearchField value="" onChange={() => undefined} disabled />,
    );

    expect(html).toContain('disabled');
  });

  it('microfone vira botão quando há callback', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSearchField
        value=""
        onChange={() => undefined}
        onMicrophoneClick={() => undefined}
      />,
    );

    expect(html).toContain('aria-label="Usar microfone"');
    expect(html).toContain('<button');
  });

  it('microfone decorativo sem callback', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSearchField value="" onChange={() => undefined} />,
    );

    expect(html).not.toContain('aria-label="Usar microfone"');
    expect(html).not.toContain('<button');
  });
});
