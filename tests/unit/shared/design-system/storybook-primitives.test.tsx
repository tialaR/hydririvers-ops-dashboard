import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ProgressBar } from '@/shared/design-system/components/progress-bar';
import { Surface } from '@/shared/design-system/components/surface';
import { Button } from '@/shared/ui/button';

describe('Storybook core primitive contracts', () => {
  it('keeps Button loading state native, named and unavailable', () => {
    const html = renderToStaticMarkup(
      <Button loading loadingLabel="Atualizando operação">Atualizar operação</Button>,
    );

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('disabled');
    expect(html).toContain('Atualizando operação');
  });

  it('exposes a named progressbar and clamps overflow', () => {
    const html = renderToStaticMarkup(
      <ProgressBar value={140} label="Progresso da viagem" showValue />,
    );

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-label="Progresso da viagem"');
    expect(html).toContain('aria-valuenow="100"');
    expect(html).toContain('width:100%');
    expect(html).toContain('100%');
  });

  it('preserves semantic attributes passed to Surface', () => {
    const html = renderToStaticMarkup(
      <Surface interactive role="button" tabIndex={0} aria-label="Abrir contexto operacional">
        Contexto operacional
      </Surface>,
    );

    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-label="Abrir contexto operacional"');
  });
});
