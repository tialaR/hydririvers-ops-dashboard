import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PublicCargoActionSheetContent } from '@/features/cargo/public/components/public-cargas-mobile/public-cargo-action-sheet-content';
import type { CargoLabV2 } from '@/features/cargo/types/cargo-lab-v2.types';

const actionSheetSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/public/components/public-cargas-mobile/public-cargo-action-sheet.tsx',
);

const filterSheetSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/public/components/public-cargas-mobile/public-cargas-mobile-filter-sheet.tsx',
);

const contentSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/public/components/public-cargas-mobile/public-cargo-action-sheet-content.tsx',
);

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockCargo: CargoLabV2 = {
  id: 'CRG-7845',
  title: 'Soja granel Manaus → Belém',
  subtitle: 'Granel',
  status: 'transito',
  statusLabel: 'Em trânsito',
  origin: 'Manaus',
  originTerminal: 'Terminal Norte',
  destination: 'Belém',
  destinationTerminal: 'Porto Belém',
  eta: 'ETA 24 Mai, 14:00',
  delivery: '',
  volume: '12.000 t',
  vessel: 'Barco mock',
  cargoType: 'Granel',
};

describe('PublicCargoActionSheetContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não repete ETA ETA quando eta já vem prefixado', () => {
    const html = renderToStaticMarkup(<PublicCargoActionSheetContent cargo={mockCargo} />);

    expect(html).not.toContain('ETA ETA');
    expect(html).toContain('24 Mai, 14:00');
    expect(html).toContain('common.eta');
  });

  it('preserva hrefs reais nas action rows', () => {
    const html = renderToStaticMarkup(<PublicCargoActionSheetContent cargo={mockCargo} />);

    expect(html).toContain('href="/cargas/CRG-7845"');
    expect(html).toContain('href="/cargas/CRG-7845/mapa"');
    expect(html).toContain('data-public-cargo-action="true"');
    expect(html).not.toContain('/pt-BR/pt-BR');
  });
});

describe('Public mobile bottom sheet contract (source)', () => {
  it('filter sheet passa description e footer global', () => {
    const source = readFileSync(filterSheetSourcePath, 'utf8');

    expect(source).toContain("description={tBoard('filters.mobileDescription')}");
    expect(source).toContain('footer={');
    expect(source).toContain('CargoFilterSheetFooter');
    expect(source).not.toContain('<header');
  });

  it('action sheet usa title/description globais e não título da carga', () => {
    const actionSource = readFileSync(actionSheetSourcePath, 'utf8');
    const contentSource = readFileSync(contentSourcePath, 'utf8');

    expect(actionSource).toContain("title={tBoard('publicActionSheet.title')}");
    expect(actionSource).toContain("description={tBoard('publicActionSheet.description')}");
    expect(actionSource).not.toContain('title={cargo.title}');
    expect(actionSource).not.toContain('ariaLabel={');
    expect(contentSource).toContain('{cargo.title}');
    expect(contentSource).toContain('stripEtaPrefix');
  });
});
