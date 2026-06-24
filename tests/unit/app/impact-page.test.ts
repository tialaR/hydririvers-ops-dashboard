import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/shipper-mobile-flow/application/get-impact-summary', () => ({
  getImpactSummary: vi.fn().mockResolvedValue({
    metrics: [],
    co2BarSeries: []
  })
}));

vi.mock('@/features/shipper-mobile-flow/screens/impact-screen', () => ({
  ImpactScreen: () => React.createElement('div', { 'data-testid': 'shipper-impact-screen' })
}));

import ImpactPage from '@/app/[locale]/(shipper-mobile-flow)/impacto/page';

describe('impact page (shipper mobile flow)', () => {
  it('renderiza a tela de impacto da embarcadora', async () => {
    const tree = await ImpactPage();
    const html = renderToStaticMarkup(tree as React.ReactElement);
    expect(html).toContain('shipper-impact-screen');
  });
});
