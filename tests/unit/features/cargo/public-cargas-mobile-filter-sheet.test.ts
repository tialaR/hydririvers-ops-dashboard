import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const filterSheetSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/components/public-cargas-mobile/public-cargas-mobile-filter-sheet.tsx',
);

describe('PublicCargasMobileFilterSheet', () => {
  it('fixa escopo light no painel portaled com classe global root', () => {
    const source = readFileSync(filterSheetSourcePath, 'utf8');

    expect(source).toContain('cargoDsV2ThemeRootClassName');
    expect(source).toContain('usePublicCargoLightSheetPortal');
    expect(source).toContain('publicCargoLightSheetDefaults');
    expect(source).toContain('styles.filterBottomSheet');
  });
});
