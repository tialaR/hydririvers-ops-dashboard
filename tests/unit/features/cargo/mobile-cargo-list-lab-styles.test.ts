import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const labStylesPath = resolve(
  process.cwd(),
  'src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss',
);

const labSourcePath = resolve(
  process.cwd(),
  'src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.tsx',
);

describe('mobile cargo list lab styles and scroll contract', () => {
  it('não usa prefixos CSS proibidos no módulo da lab', () => {
    const source = readFileSync(labStylesPath, 'utf8');

    expect(source).not.toMatch(/--ios-/);
    expect(source).not.toMatch(/--ds-/);
    expect(source).not.toMatch(/--hx-/);
    expect(source).not.toMatch(/--lab-/);
  });

  it('usa layout 100dvh e lista com overflow-y auto', () => {
    const source = readFileSync(labStylesPath, 'utf8');

    expect(source).toContain('height: 100dvh');
    expect(source).toContain('.listScroller');
    expect(source).toContain('overflow-y: auto');
    expect(source).toContain('overscroll-behavior: contain');
    expect(source).toContain('-webkit-overflow-scrolling: touch');
  });

  it('usa aliases locais --mobile-cargo-list-* ligados ao canvas Hydro', () => {
    const labSource = readFileSync(labStylesPath, 'utf8');
    const canvasSource = readFileSync(
      resolve(
        process.cwd(),
        'src/shared/design-system/lab/mobile-cargo-list-lab-canvas/mobile-cargo-list-lab-canvas.module.scss',
      ),
      'utf8',
    );

    expect(labSource).toContain('--mobile-cargo-list-label-primary');
    expect(labSource).toContain('composes: canvas');
    expect(canvasSource).toContain('--hydro-color-canvas');
    expect(canvasSource).toContain('--mobile-cargo-list-canvas-top');
    expect(canvasSource).not.toMatch(/--mcl-/);
  });

  it('compõe search glass, chips scrolláveis, botão de filtros e cards nativos', () => {
    const source = readFileSync(labStylesPath, 'utf8');

    expect(source).toContain('.searchField');
    expect(source).toContain('height: 46px');
    expect(source).toContain('caret-color');
    expect(source).toContain('.filterChip');
    expect(source).toContain('scroll-padding-inline');
    expect(source).toContain('.filterButtonBadge');
    expect(source).toContain('.headerFilterButton');
    expect(source).toContain('.cardRouteBlock');
    expect(source).toContain('.filterSheetBody');
    expect(source).toContain('translateY(-1px)');
    expect(source).toContain('.statusPill');
    expect(source).toContain('.compactHeader');
    expect(source).toContain('data-scrolled');
    expect(source).toContain('.dockHost');
    expect(source).not.toContain('.heroSurface');
    expect(source).toContain('padding-block-end: calc(env(safe-area-inset-bottom, 0px) + 120px)');
    expect(source).not.toMatch(/\.controls\s*\{[\s\S]*?position:\s*sticky/);
    expect(source).not.toMatch(/\.header\s*\{[\s\S]*?position:\s*sticky/);
  });

  it('não expõe texto mock nem ETA duplicado no componente', () => {
    const source = readFileSync(labSourcePath, 'utf8');

    expect(source).not.toMatch(/\(mock\)/i);
    expect(source).not.toContain('ETA ETA');
  });

  it('usa sheets de ações/filtros e dock flutuante', () => {
    const source = readFileSync(labSourcePath, 'utf8');

    expect(source).toContain('draggable');
    expect(source).toContain('className={styles.sheetHeader}');
    expect(source).toContain('cargo-lab-filter-sheet');
    expect(source).toContain('data-scrolled={isScrolled');
    expect(source).toContain('LiquidGlassBottomDock');
    expect(source).toContain('cargo-lab-bottom-dock');
    expect(source).not.toContain("id: 'filters'");
  });
});
