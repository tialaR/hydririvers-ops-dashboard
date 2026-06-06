import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from '@/shared/components/status-badge';

describe('StatusBadge', () => {
  it('renderiza texto padrão por status', () => {
    const html = renderToStaticMarkup(<StatusBadge status="operating" />);

    expect(html).toContain('Em operação');
    expect(html).toContain('data-status="operacao"');
    expect(html).toContain('data-status-tone="operating"');
  });

  it('renderiza dot quando showDot=true', () => {
    const html = renderToStaticMarkup(<StatusBadge status="inTransit" showDot />);

    expect(html).toMatch(/withDot/);
  });

  it('oculta dot quando showDot=false', () => {
    const html = renderToStaticMarkup(<StatusBadge status="inTransit" showDot={false} size="sm" />);

    expect(html).toMatch(/noDot/);
  });

  it('aplica tone diferente por status', () => {
    const openHtml = renderToStaticMarkup(<StatusBadge status="open" />);
    const quotationHtml = renderToStaticMarkup(<StatusBadge status="quotation" />);

    expect(openHtml).toContain('data-status-tone="open"');
    expect(quotationHtml).toContain('data-status-tone="quotation"');
    expect(openHtml).not.toContain('data-status-tone="quotation"');
  });

  it('status desconhecido usa fallback neutro', () => {
    const html = renderToStaticMarkup(<StatusBadge status="unknown" />);

    expect(html).toContain('data-status-tone="unknown"');
    expect(html).toContain('data-status="desconhecido"');
  });

  it('permite children customizado', () => {
    const html = renderToStaticMarkup(
      <StatusBadge status="delayed">Atraso operacional</StatusBadge>,
    );

    expect(html).toContain('Atraso operacional');
    expect(html).toContain('data-status="atencao"');
    expect(html).toContain('data-status-tone="delayed"');
  });

  it('aceita className e aria-label', () => {
    const html = renderToStaticMarkup(
      <StatusBadge status="quotation" className="lab-status" ariaLabel="Status da carga" />,
    );

    expect(html).toContain('lab-status');
    expect(html).toContain('aria-label="Status da carga"');
    expect(html).toContain('data-status="cotacao"');
  });
});
