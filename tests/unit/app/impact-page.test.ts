import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/impact/application/get-impact-summary', () => ({
  getImpactSummary: vi.fn().mockResolvedValue({ metrics: [], co2BarSeries: [] })
}));

vi.mock('@/features/impact/application/get-impact-chart-data', () => ({
  getImpactChartData: vi.fn().mockResolvedValue({
    points: [],
    riskLevel: 'low',
    freshnessMinutes: 0,
    freshnessState: 'fresh'
  })
}));

vi.mock('@/features/impact/screens/impact-screen', () => ({
  ImpactScreen: () => React.createElement('div', { 'data-testid': 'shipper-impact-screen' })
}));

vi.mock('@/features/product-shell/components/mobile-app-shell/mobile-app-shell', () => ({
  MobileAppShell: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children)
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key)
}));

import ImpactPage from '@/app/[locale]/(shipper-mobile-flow)/impacto/page';

describe('impact page (shipper mobile flow)', () => {
  it('renderiza a tela de impacto da embarcadora via ownership canonico', async () => {
    const tree = await ImpactPage();
    const html = renderToStaticMarkup(tree as React.ReactElement);
    expect(html).toContain('shipper-impact-screen');
  });
});
