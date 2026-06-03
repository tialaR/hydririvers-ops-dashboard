import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from '@/shared/components/status-badge';

describe('StatusBadge', () => {
  it('renderiza texto padrão por status', () => {
    const html = renderToStaticMarkup(<StatusBadge status="scheduled" />);

    expect(html).toContain('Agendado');
    expect(html).toContain('data-status="agendado"');
  });

  it('renderiza dot quando showDot=true', () => {
    const html = renderToStaticMarkup(<StatusBadge status="inTransit" showDot />);

    expect(html).toMatch(/withDot/);
  });

  it('oculta dot quando showDot=false', () => {
    const html = renderToStaticMarkup(<StatusBadge status="inTransit" showDot={false} size="sm" />);

    expect(html).toMatch(/noDot/);
  });

  it('permite children customizado', () => {
    const html = renderToStaticMarkup(
      <StatusBadge status="delayed">Atraso operacional</StatusBadge>,
    );

    expect(html).toContain('Atraso operacional');
    expect(html).toContain('data-status="atencao"');
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
