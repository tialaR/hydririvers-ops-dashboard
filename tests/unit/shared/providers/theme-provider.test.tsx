import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/shared/providers/theme-provider';

vi.mock('@/shared/preferences/client-preferences', () => ({
  persistStoredTheme: vi.fn(),
  readStoredTheme: (defaultTheme: 'light' | 'dark') => defaultTheme
}));

describe('shared/providers/theme-provider', () => {
  it('renderiza o tema inicial do servidor no SSR', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider initialTheme="dark">
        <span data-testid="child" />
      </ThemeProvider>
    );

    expect(html).toContain('data-hydro-theme="dark"');
  });

  it('aceita tema claro como estado inicial sem divergir no markup estatico', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider initialTheme="light">
        <span data-testid="child" />
      </ThemeProvider>
    );

    expect(html).toContain('data-hydro-theme="light"');
  });
});
