import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CargoCard } from '@/features/cargo-market/components/cargo-card/cargo-card';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

vi.mock('next-intl', () => ({
  useLocale: () => 'pt-BR',
  useTranslations: () => ((key: string, values?: Record<string, unknown>) => {
    if (values?.title) return `${key}:${values.title}`;
    return key;
  })
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  )
}));

const cargo = (over: Partial<Cargo> = {}): Cargo => ({
  id: 'MY-CARGO-001',
  title: 'Açaí congelado para entrega regional',
  origin: 'Belém, PA',
  destination: 'Santarém, PA',
  volume: '18 m³',
  window: 'Hoje e amanhã',
  cargoType: 'Refrigerada',
  status: 'boarded',
  co2Saving: '-46% CO₂',
  targetPrice: 'R$ 6.450',
  ownerId: 'u-shipper-1',
  shipperId: 'u-shipper-1',
  visibility: 'private',
  ...over
});

describe('CargoCard', () => {
  it('usa a rota privada em Minhas cargas', () => {
    const html = renderToStaticMarkup(<CargoCard cargo={cargo()} variant="myCargos" />);
    expect(html).toContain('href="/minhas-cargas/MY-CARGO-001"');
  });

  it('usa a rota pública no marketplace', () => {
    const html = renderToStaticMarkup(<CargoCard cargo={cargo()} />);
    expect(html).toContain('href="/cargas/MY-CARGO-001"');
  });
});
