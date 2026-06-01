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

  it('renderiza título, children e acessibilidade básica quando aberto', () => {
    const html = renderToStaticMarkup(
      <BottomSheet open title="Filtros" closeAriaLabel="Fechar filtros">
        <p>Conteúdo do sheet</p>
      </BottomSheet>,
    );

    expect(html).toContain('Filtros');
    expect(html).toContain('Conteúdo do sheet');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-testid="bottom-sheet-panel"');
    expect(html).toContain('aria-labelledby="bottom-sheet-title-id"');
    expect(html).toContain('aria-label="Fechar filtros"');
  });

  it('não renderiza markup quando fechado', () => {
    const html = renderToStaticMarkup(
      <BottomSheet open={false} title="Filtros">
        Conteúdo
      </BottomSheet>,
    );

    expect(html).toBe('');
  });

  it('liga botão X ao fluxo de fechamento com feedback de press', () => {
    const source = readFileSync(bottomSheetSourcePath, 'utf8');

    expect(source).toContain('onClick={resetAndClose}');
    expect(source).toContain('queueCloseWithPressFeedback');
    expect(source).toContain('requestClose()');
    expect(source).toContain('onOpenChange(false)');
    expect(source).toContain('onClose?.()');
  });
});
