import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/layout/admin-chrome/admin-chrome', () => ({
  AdminChrome: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-chrome">{children}</div>
  ),
}));

import { LocaleShell } from '@/shared/layout/locale-shell';

describe('LocaleShell', () => {
  it('renderiza AdminChrome para rotas do product shell', () => {
    const html = renderToStaticMarkup(
      <LocaleShell>
        <main>Cargas</main>
      </LocaleShell>,
    );

    expect(html).toContain('data-testid="admin-chrome"');
    expect(html).toContain('Cargas');
  });
});
