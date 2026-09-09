import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LiquidGlassSegmentedControl } from '@/shared/design-system/primitives/liquid-glass-segmented-control';

const sampleItems = [
  { id: 'a', label: 'Opção A' },
  { id: 'b', label: 'Opção B' },
  { id: 'c', label: 'Opção C' },
];

describe('LiquidGlassSegmentedControl', () => {
  it('renderiza items', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSegmentedControl items={sampleItems} value="a" />,
    );

    expect(html).toContain('Opção A');
    expect(html).toContain('Opção B');
    expect(html).toContain('Opção C');
  });

  it('aplica value selecionado', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSegmentedControl items={sampleItems} value="b" />,
    );

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('Opção B');
  });

  it('chama onChange ao clicar item', () => {
    const onChange = vi.fn();
    const element = LiquidGlassSegmentedControl({
      items: sampleItems,
      value: 'a',
      onChange,
    });

    const optionB = element.props.children[1];
    optionB.props.onClick();

    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('não chama onChange em item disabled', () => {
    const onChange = vi.fn();
    const items = [
      ...sampleItems.slice(0, 2),
      { ...sampleItems[2], disabled: true },
    ];

    const element = LiquidGlassSegmentedControl({
      items,
      value: 'a',
      onChange,
    });

    const disabledOption = element.props.children[2];
    disabledOption.props.onClick();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('aplica size sm', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSegmentedControl items={sampleItems} value="a" size="sm" />,
    );

    expect(html).toContain('data-size="sm"');
  });

  it('aplica size md', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSegmentedControl items={sampleItems} value="a" size="md" />,
    );

    expect(html).toContain('data-size="md"');
  });

  it('aplica tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSegmentedControl items={sampleItems} value="a" tone="dark" />,
    );

    expect(html).toContain('data-tone="dark"');
  });

  it('aplica fullWidth', () => {
    const htmlFull = renderToStaticMarkup(
      <LiquidGlassSegmentedControl items={sampleItems} value="a" fullWidth />,
    );
    const htmlInline = renderToStaticMarkup(
      <LiquidGlassSegmentedControl
        items={sampleItems}
        value="a"
        fullWidth={false}
      />,
    );

    expect(htmlFull).toContain('data-full-width="true"');
    expect(htmlInline).toContain('data-full-width="false"');
  });

  it('renderiza aria-label', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSegmentedControl
        items={sampleItems}
        value="a"
        aria-label="Filtro de status"
      />,
    );

    expect(html).toContain('aria-label="Filtro de status"');
    expect(html).toContain('role="radiogroup"');
  });

  it('itens usam aria-pressed', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassSegmentedControl items={sampleItems} value="a" />,
    );

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });
});
