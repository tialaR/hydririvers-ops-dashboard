import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { ThemeToggle } from '@/shared/ui/theme-toggle/theme-toggle';

vi.mock('next-intl', () => ({
  useTranslations: () => ((key: string) => key)
}));

vi.mock('@/shared/preferences/client-preferences', () => ({
  persistStoredTheme: vi.fn(),
  readStoredTheme: (defaultTheme: 'light' | 'dark') => defaultTheme
}));

function renderToggle(initialTheme: 'light' | 'dark', variant: 'icon' | 'pill' = 'icon') {
  return renderToStaticMarkup(
    <ThemeProvider initialTheme={initialTheme}>
      <ThemeToggle ariaLabel="Alterar tema" variant={variant} />
    </ThemeProvider>
  );
}

describe('shared/ui/theme-toggle', () => {
  it('renderiza um toggle compacto sem wrapper adicional', () => {
    const html = renderToggle('dark');

    expect(html).toContain('data-variant="icon"');
    expect(html).toContain('aria-label="Alterar tema"');
    expect(html).toContain('data-mode="dark"');
    expect(html).not.toContain('hx-sidebar-theme-toggle');
  });

  it('renderiza a variante pill para a sidebar sem perder acessibilidade', () => {
    const html = renderToggle('dark', 'pill');

    expect(html).toContain('data-variant="pill"');
    expect(html).toContain('aria-label="Alterar tema"');
    expect(html).toContain('aria-pressed="true"');
  });

  it('usa o tema inicial do provider no SSR sem ler preferencias locais', () => {
    const html = renderToggle('light');

    expect(html).toContain('data-mode="light"');
    expect(html).toContain('aria-pressed="false"');
  });

  it('renderiza o icone do tema inicial no SSR para evitar hydration mismatch', () => {
    const lightHtml = renderToggle('light');
    const darkHtml = renderToggle('dark');

    expect(lightHtml).toContain('M12 8a4');
    expect(darkHtml).toContain('M21 12.8');
  });
});
