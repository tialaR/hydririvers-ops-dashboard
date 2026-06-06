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
});
