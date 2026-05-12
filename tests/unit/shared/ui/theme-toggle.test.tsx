import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from '@/shared/ui/theme-toggle/theme-toggle';

vi.mock('next-intl', () => ({
  useTranslations: () => ((key: string) => key)
}));

vi.mock('@/shared/preferences/client-preferences', () => ({
  persistStoredTheme: vi.fn(),
  readStoredTheme: () => 'dark'
}));

describe('shared/ui/theme-toggle', () => {
  it('renderiza um toggle compacto sem wrapper adicional', () => {
    const html = renderToStaticMarkup(<ThemeToggle ariaLabel="Alterar tema" variant="icon" />);

    expect(html).toContain('data-variant="icon"');
    expect(html).toContain('aria-label="Alterar tema"');
    expect(html).toContain('data-mode="dark"');
    expect(html).not.toContain('hx-sidebar-theme-toggle');
  });

  it('renderiza a variante pill para a sidebar sem perder acessibilidade', () => {
    const html = renderToStaticMarkup(<ThemeToggle ariaLabel="Alterar tema" variant="pill" />);

    expect(html).toContain('data-variant="pill"');
    expect(html).toContain('aria-label="Alterar tema"');
    expect(html).toContain('aria-pressed="true"');
  });
});
