import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { OtpInput } from '@/shared/components/otp-input';

describe('OtpInput', () => {
  it('renderiza slots com aria-label por dígito', () => {
    const html = renderToStaticMarkup(
      <OtpInput
        value="12"
        onChange={() => undefined}
        groupLabel="Código OTP"
        digitAriaLabel={(index) => `Dígito ${index}`}
      />,
    );

    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Código OTP"');
    expect(html).toContain('aria-label="Dígito 1"');
    expect(html).toContain('value="1"');
    expect(html).toContain('value="2"');
  });

  it('propaga estados inválido e desabilitado para todos os dígitos', () => {
    const html = renderToStaticMarkup(
      <OtpInput
        value="123456"
        onChange={() => undefined}
        groupLabel="Código de verificação"
        digitAriaLabel={(index) => `Dígito ${index}`}
        describedBy="otp-error"
        invalid
        disabled
      />,
    );

    expect(html).toContain('aria-describedby="otp-error"');
    expect(html.match(/aria-invalid="true"/g)).toHaveLength(6);
    expect(html.match(/disabled=""/g)).toHaveLength(6);
  });
});
