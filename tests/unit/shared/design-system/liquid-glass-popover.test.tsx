import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LiquidGlassPopover } from '@/shared/design-system/primitives/liquid-glass-popover';

describe('LiquidGlassPopover', () => {
  it('renderiza children', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassPopover>
        <p>Conteúdo do popover</p>
      </LiquidGlassPopover>,
    );

    expect(html).toContain('Conteúdo do popover');
  });

  it('aplica role default dialog', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassPopover>Item</LiquidGlassPopover>,
    );

    expect(html).toContain('role="dialog"');
  });

  it('aplica arrow via data-arrow e classe de seta', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassPopover arrow="top">
        Item
      </LiquidGlassPopover>,
    );

    expect(html).toContain('data-arrow="top"');
    expect(html).toMatch(/arrow_top/);
  });

  it('aplica size via data-size e classe de tamanho', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassPopover size="lg">
        Item
      </LiquidGlassPopover>,
    );

    expect(html).toContain('data-size="lg"');
    expect(html).toMatch(/size_lg/);
  });

  it('aplica tone via data-tone', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassPopover tone="dark">
        Item
      </LiquidGlassPopover>,
    );

    expect(html).toContain('data-tone="dark"');
  });

  it('aplica open e closed via data-open e aria-hidden', () => {
    const openHtml = renderToStaticMarkup(
      <LiquidGlassPopover open>
        Aberto
      </LiquidGlassPopover>,
    );
    const closedHtml = renderToStaticMarkup(
      <LiquidGlassPopover open={false}>
        Fechado
      </LiquidGlassPopover>,
    );

    expect(openHtml).toContain('data-open="true"');
    expect(openHtml).not.toContain('aria-hidden="true"');
    expect(closedHtml).toContain('data-open="false"');
    expect(closedHtml).toContain('aria-hidden="true"');
  });

  it('aceita className', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassPopover className="custom-popover">
        Item
      </LiquidGlassPopover>,
    );

    expect(html).toContain('custom-popover');
  });

  it('renderiza title quando informado', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassPopover title="Light">
        Item
      </LiquidGlassPopover>,
    );

    expect(html).toContain('Light');
  });

  it('aplica role menu quando solicitado', () => {
    const html = renderToStaticMarkup(
      <LiquidGlassPopover role="menu">
        Item
      </LiquidGlassPopover>,
    );

    expect(html).toContain('role="menu"');
  });
});
