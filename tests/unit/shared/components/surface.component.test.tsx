import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Surface } from '@/shared/components/surface';

describe('Surface', () => {
  it('renderiza filhos com tom glass', () => {
    const html = renderToStaticMarkup(
      <Surface tone="glass">
        <p>Conteúdo</p>
      </Surface>,
    );
    expect(html).toContain('Conteúdo');
  });
});
