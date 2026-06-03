import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { PublicCargasMobileList } from '@/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list';

const listSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-list.tsx',
);

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string, values?: { count?: number }) => {
    if (namespace === 'operationsBoard' && key === 'filters.results' && values?.count != null) {
      return `${values.count} resultados`;
    }
    return `${namespace}.${key}`;
  },
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const baseProps = {
  filteredCargoes: [],
  query: '',
  onQueryChange: vi.fn(),
  statusFilter: 'all' as const,
  onStatusFilterToggle: vi.fn(),
  advancedFilters: {
    corridor: [],
    origin: [],
    destination: [],
    type: [],
    document: [],
  },
  onToggleAdvancedFilter: vi.fn(),
  activeFilters: 0,
  hasAppliedFilters: false,
  onResetFilters: vi.fn(),
  onSyncListViewport: vi.fn(),
  negotiations: [],
  vessels: [],
  filterOptions: {
    corridor: [],
    origin: [],
    destination: [],
    type: [],
    document: [],
  },
};

describe('PublicCargasMobileList', () => {
  it('fixa light mode no SSR com escopo global root para os cards DS v2', () => {
    const html = renderToStaticMarkup(<PublicCargasMobileList {...baseProps} />);

    expect(html).toContain('data-theme="light"');
    expect(html).toMatch(/\broot\b/);
  });

  it('nao depende do toggle global para o tema inicial do shell', () => {
    const source = readFileSync(listSourcePath, 'utf8');

    expect(source).toContain('data-theme="light"');
    expect(source).toContain('cargoDsV2ThemeRootClassName');
    expect(source).not.toContain('useTheme(');
  });
});
