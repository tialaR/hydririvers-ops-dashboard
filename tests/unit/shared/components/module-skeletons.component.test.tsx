import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PublicCargasMobileSkeleton } from '@/features/cargo/components/public-cargas-mobile/public-cargas-mobile-skeleton';
import { NegotiationBoardSkeleton } from '@/features/negotiations/components/negotiation-board/negotiation-board-skeleton';
import { TrackingMobileSkeleton } from '@/features/dashboard/components/operations-board/tracking-mobile-skeleton';

const loadingFiles = {
  cargas: resolve(process.cwd(), 'src/app/[locale]/(product-shell)/cargas/loading.tsx'),
  negociacoes: resolve(process.cwd(), 'src/app/[locale]/(product-shell)/negociacoes/loading.tsx'),
  rastreio: resolve(process.cwd(), 'src/app/[locale]/(product-shell)/rastreio/loading.tsx'),
} as const;

describe('module skeletons', () => {
  it('cargas skeleton reflete lista mobile', () => {
    const html = renderToStaticMarkup(<PublicCargasMobileSkeleton />);

    expect(html).toContain('data-public-cargas-mobile-skeleton="true"');
    expect(html).toContain('aria-busy="true"');
  });

  it('negociacoes skeleton reflete painel de cards', () => {
    const html = renderToStaticMarkup(<NegotiationBoardSkeleton />);

    expect(html).toContain('data-negotiations-mobile-skeleton="true"');
    expect(html).toContain('aria-busy="true"');
  });

  it('rastreio skeleton reflete tabs e timeline', () => {
    const html = renderToStaticMarkup(<TrackingMobileSkeleton />);

    expect(html).toContain('data-tracking-mobile-skeleton="true"');
    expect(html).toContain('aria-busy="true"');
  });

  it('loading.tsx de cada rota usa skeleton do módulo', () => {
    const cargasLoading = readFileSync(loadingFiles.cargas, 'utf8');
    const negociacoesLoading = readFileSync(loadingFiles.negociacoes, 'utf8');
    const rastreioLoading = readFileSync(loadingFiles.rastreio, 'utf8');

    expect(cargasLoading).toContain('PublicCargasMobileSkeleton');
    expect(negociacoesLoading).toContain('NegotiationBoardSkeleton');
    expect(rastreioLoading).toContain('TrackingMobileSkeleton');
  });
});
