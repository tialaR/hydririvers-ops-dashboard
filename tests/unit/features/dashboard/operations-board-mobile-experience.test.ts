import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const operationsBoardPath = resolve(
  process.cwd(),
  'src/features/dashboard/components/operations-board/operations-board.tsx',
);
const cargasPagePath = resolve(
  process.cwd(),
  'src/app/[locale]/(product-shell)/cargas/page.tsx',
);
const rastreioPagePath = resolve(
  process.cwd(),
  'src/app/[locale]/(product-shell)/rastreio/page.tsx',
);

describe('OperationsBoard mobileExperience scope', () => {
  it('renderiza PublicCargasMobileList em camada mobile-first sem depender de isMobileViewport', () => {
    const source = readFileSync(operationsBoardPath, 'utf8');
    const stylesSource = readFileSync(
      resolve(
        process.cwd(),
        'src/features/dashboard/components/operations-board/operations-board.module.scss',
      ),
      'utf8',
    );

    expect(source).toContain("export type OperationsBoardMobileExperience = 'public-cargas' | 'default'");
    expect(source).toContain('mobileExperience?: OperationsBoardMobileExperience');
    expect(source).toContain("mobileExperience = 'default'");
    expect(source).toContain("const isPublicCargasExperience = mobileExperience === 'public-cargas'");
    expect(source).toContain('publicCargasMobileLayer');
    expect(source).toContain('publicCargasDesktopLayer');
    expect(source).toContain('data-legacy-cargo-list');
    expect(source).not.toContain('usePublicCargasMobileList');
    expect(stylesSource).toContain('.publicCargasMobileLayer');
    expect(stylesSource).toContain('@media (max-width: 860px)');
  });

  it('passa mobileExperience public-cargas apenas na rota /cargas', () => {
    const cargasPage = readFileSync(cargasPagePath, 'utf8');
    const rastreioPage = readFileSync(rastreioPagePath, 'utf8');

    expect(cargasPage).toContain('mobileExperience="public-cargas"');
    expect(rastreioPage).not.toContain('mobileExperience');
    expect(rastreioPage).toContain('initialTab="timeline"');
  });
});
