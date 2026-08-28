import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const bridgeSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/components/cargo-action-sheet/cargo-action-sheet-bridge.tsx',
);

const actionSheetSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/public/components/public-cargas-mobile/public-cargo-action-sheet.tsx',
);

const filterSheetSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/public/components/public-cargas-mobile/public-cargas-mobile-filter-sheet.tsx',
);

const actionContentSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/public/components/public-cargas-mobile/public-cargo-action-sheet-content.tsx',
);

describe('CargoActionSheetBridge', () => {
  it('compõe a casca global BottomSheet sem portal legado', () => {
    const source = readFileSync(bridgeSourcePath, 'utf8');

    expect(source).toContain("from '@/shared/components/bottom-sheet/BottomSheet'");
    expect(source).toContain('<BottomSheet');
    expect(source).toContain('article[data-cargo-id]');
    expect(source).toContain("card.closest('[data-public-cargas-mobile=\"true\"]')");
    expect(source).toContain("anchor.closest('[data-public-cargas-mobile=\"true\"]')");
    expect(source).toContain('data-public-cargo-action');
    expect(source).toContain('data-public-cargo-action-sheet');
    expect(source).not.toContain('createPortal');
    expect(source).not.toContain('cargoActionSheetOverlayIn');
  });
});

describe('Public mobile bottom sheets shell parity', () => {
  it('filter e action sheet usam BottomSheet shared com variant light e flush anchor', () => {
    const filterSource = readFileSync(filterSheetSourcePath, 'utf8');
    const actionSource = readFileSync(actionSheetSourcePath, 'utf8');
    const defaultsSource = readFileSync(
      resolve(process.cwd(), 'src/features/cargo/components/cargo-mobile-sheet/cargo-mobile-sheet.ts'),
      'utf8',
    );

    expect(defaultsSource).toContain('cargoMobileSheetDefaults');
    expect(defaultsSource).toContain('cargoMobileSheetSnapHeights');
    expect(defaultsSource).toContain("viewportAnchor: 'flush'");
    expect(defaultsSource).toContain("variant: 'light'");
    expect(defaultsSource).toContain("overlayVariant: 'light'");
    expect(defaultsSource).toContain("initialSnap: 'collapsed'");

    for (const source of [filterSource, actionSource]) {
      expect(source).toContain("from '@/shared/components/bottom-sheet'");
      expect(source).toContain('publicCargoLightSheetDefaults');
      expect(source).toContain('publicCargoLightSheetSnapHeights');
    }

    expect(actionSource).not.toContain('initialSnap="expanded"');
  });

  it('PublicCargoActionSheet marca portal público e não repete título da carga no header', () => {
    const actionSource = readFileSync(actionSheetSourcePath, 'utf8');
    const contentSource = readFileSync(actionContentSourcePath, 'utf8');

    expect(actionSource).toContain('publicCargoActionSheetPortalAttributes');
    expect(actionSource).toContain('usePublicCargoLightSheetPortal');
    expect(actionSource).toContain("title={tBoard('publicActionSheet.title')}");
    expect(actionSource).not.toContain('title={cargo.title}');
    expect(actionSource).not.toContain('locale:');
    expect(contentSource).toContain('styles.summaryTitle');
    expect(contentSource).toContain('{cargo.title}');
  });
});

describe('CargoActionSheetBridge public scope guard', () => {
  it('retorna antes de openSheetForCargo quando alvo está no escopo público mobile', () => {
    const source = readFileSync(bridgeSourcePath, 'utf8');

    expect(source).toContain("target.closest('[data-public-cargo-action-sheet=\"true\"]')");
    expect(source).toContain("anchor.closest('[data-public-cargas-mobile=\"true\"]')");
    expect(source).toContain('anchor.hasAttribute(\'data-public-cargo-action\')');
    expect(source).toContain("card.closest('[data-public-cargas-mobile=\"true\"]')");
    expect(source).toContain("card.closest('[data-public-cargo-action-sheet=\"true\"]')");

    const handleClickCapture = source.slice(
      source.indexOf('const handleClickCapture'),
      source.indexOf('return (', source.indexOf('const handleClickCapture')),
    );

    expect(handleClickCapture.indexOf('openSheetForCargo')).toBeGreaterThan(
      handleClickCapture.indexOf('data-public-cargas-mobile'),
    );
  });
});
