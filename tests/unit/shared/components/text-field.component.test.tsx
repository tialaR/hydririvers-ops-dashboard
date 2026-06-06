import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { TextField } from '@/shared/components/text-field';

describe('TextField', () => {
  it('associa label, hint e aria-describedby', () => {
    const html = renderToStaticMarkup(
      <TextField
        id="email"
        label="E-mail"
        hint="Use seu e-mail corporativo"
        value=""
        onChange={() => undefined}
      />,
    );

    expect(html).toContain('id="email"');
    expect(html).toContain('aria-describedby="email-hint"');
    expect(html).toContain('Use seu e-mail corporativo');
  });

  it('expõe erro com role alert e aria-invalid', () => {
    const html = renderToStaticMarkup(
      <TextField
        id="phone"
        label="Telefone"
        error="Telefone inválido"
        value=""
        onChange={() => undefined}
      />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('Telefone inválido');
    expect(html).toContain('aria-invalid="true"');
  });
});
