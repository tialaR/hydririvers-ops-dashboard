import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { InlineAlert } from '@/shared/components/inline-alert';

describe('InlineAlert', () => {
  it('usa role alert em tom error', () => {
    const html = renderToStaticMarkup(
      <InlineAlert tone="error" id="err">
        Falha no login
      </InlineAlert>,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('Falha no login');
  });

  it('usa status polite para feedback de sucesso e informação', () => {
    const success = renderToStaticMarkup(<InlineAlert tone="success">Dados salvos</InlineAlert>);
    const info = renderToStaticMarkup(<InlineAlert tone="info">Confira seu e-mail</InlineAlert>);

    expect(success).toContain('role="status"');
    expect(info).toContain('role="status"');
  });
});
