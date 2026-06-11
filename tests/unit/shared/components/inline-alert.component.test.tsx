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
});
