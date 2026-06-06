import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BottomSheet } from '@/shared/components/bottom-sheet/BottomSheet';

const bottomSheetSourcePath = resolve(
  process.cwd(),
  'src/shared/components/bottom-sheet/BottomSheet.tsx',
);

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>();
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useId: () => 'bottom-sheet-title-id',
  };
});

vi.mock('@/shared/hooks/use-lock-body-scroll', () => ({
  useLockBodyScroll: () => undefined,
}));

function setupBrowserGlobals() {
  vi.stubGlobal('document', {
    body: { style: {} },
    documentElement: { clientWidth: 800, style: {} },
    activeElement: null,
  });

  vi.stubGlobal('window', {
    innerHeight: 800,
    innerWidth: 800,
    scrollY: 0,
    scrollTo: vi.fn(),
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    },
    cancelAnimationFrame: vi.fn(),
    setTimeout,
    clearTimeout,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    visualViewport: {
      height: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    performance: {
      now: () => 0,
    },
  });
}

describe('BottomSheet component', () => {
  beforeEach(() => {
    setupBrowserGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('expõe marker data-bottom-sheet-root no overlay portaled', () => {
    const source = readFileSync(bottomSheetSourcePath, 'utf8');
    expect(source).toContain('data-bottom-sheet-root="true"');
  });

  it('renderiza título, children e acessibilidade básica quando aberto', () => {
    const html = renderToStaticMarkup(
      <BottomSheet open title="Filtros" closeAriaLabel="Fechar filtros">
        <p>Conteúdo do sheet</p>
      </BottomSheet>,
    );

    expect(html).toContain('data-bottom-sheet-root="true"');

    expect(html).toContain('Filtros');
    expect(html).toContain('Conteúdo do sheet');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-testid="bottom-sheet-panel"');
    expect(html).toContain('aria-labelledby="bottom-sheet-title-id"');
    expect(html).toContain('aria-label="Fechar filtros"');
    expect(html).toContain('data-bottom-sheet-title="true"');
    expect(html).toContain('data-bottom-sheet-header="true"');
    expect(html).toContain('data-bottom-sheet-body="true"');
  });

  it('renderiza description opcional com aria-describedby', () => {
    const html = renderToStaticMarkup(
      <BottomSheet open title="Filtros" description="Refine os resultados da lista.">
        Conteúdo
      </BottomSheet>,
    );

    expect(html).toContain('Refine os resultados da lista.');
    expect(html).toContain('data-bottom-sheet-description="true"');
    expect(html).toContain('aria-describedby=');
  });

  it('não renderiza description quando ausente', () => {
    const html = renderToStaticMarkup(
      <BottomSheet open title="Filtros">
        Conteúdo
      </BottomSheet>,
    );

    expect(html).not.toContain('data-bottom-sheet-description="true"');
    expect(html).not.toContain('aria-describedby=');
  });

  it('renderiza footer com marker quando footer é passado', () => {
    const html = renderToStaticMarkup(
      <BottomSheet
        open
        title="Filtros"
        footer={<button type="button">Aplicar</button>}
      >
        Conteúdo
      </BottomSheet>,
    );

    expect(html).toContain('data-bottom-sheet-footer="true"');
    expect(html).toContain('Aplicar');
  });

  it('não renderiza markup quando fechado', () => {
    const html = renderToStaticMarkup(
      <BottomSheet open={false} title="Filtros">
        Conteúdo
      </BottomSheet>,
    );

    expect(html).toBe('');
  });

  it('título usa classe padrão e body com respiro após header', () => {
    const scssPath = resolve(
      process.cwd(),
      'src/shared/components/bottom-sheet/BottomSheet.module.scss',
    );
    const scss = readFileSync(scssPath, 'utf8');

    expect(scss).toContain('.title');
    expect(scss).toContain('--hy-font-size-sheet-header-title');
    expect(scss).toContain('--hy-space-sheet-body-padding-block');
    expect(scss).toContain('.body');
    expect(scss).toMatch(/\.body\s*\{[^}]*padding:/s);
  });

  it('usa IconButton global v2 com marker data-bottom-sheet-close', () => {
    const source = readFileSync(bottomSheetSourcePath, 'utf8');

    expect(source).toContain('iconButtonRole="sheet"');
    expect(source).toContain('iconName="close"');
    expect(source).not.toContain('variant="sheetClose"');
    expect(source).toContain('data-bottom-sheet-close="true"');
    expect(source).toContain('onClick={resetAndClose}');
    expect(source).toContain('queueCloseWithPressFeedback');
    expect(source).toContain('requestClose()');
    expect(source).toContain('onOpenChange(false)');
    expect(source).toContain('onClose?.()');
  });
});
