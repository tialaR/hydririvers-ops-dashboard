import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

export const publicCargosMock: Cargo[] = [
  {
    id: 'CARGO-001',
    ownerId: 'coop-acai-norte',
    shipperId: 'coop-acai-norte',
    title: 'Polpa de açaí congelada — cooperativa ribeirinha',
    origin: 'Belém, PA',
    destination: 'Santarém, PA',
    volume: '60 m³',
    window: '06-10 maio',
    cargoType: 'Refrigerada',
    status: 'open',
    co2Saving: '-45% CO₂',
    targetPrice: 'R$ 6.200',
    visibility: 'public',
    publishedAt: '2026-05-05T08:30:00.000Z'
  },
  {
    id: 'CARGO-002',
    ownerId: 'casa-farinha-manaus',
    shipperId: 'casa-farinha-manaus',
    title: 'Farinha de mandioca ensacada — casa de farinha',
    origin: 'Manaus, AM',
    destination: 'Belém, PA',
    volume: '15 t',
    window: '07-11 maio',
    cargoType: 'Seca',
    status: 'bidding',
    co2Saving: '-48% CO₂',
    targetPrice: 'R$ 7.570',
    visibility: 'public',
    publishedAt: '2026-05-04T13:10:00.000Z'
  },
  {
    id: 'CARGO-003',
    ownerId: 'rede-castanha-viva',
    shipperId: 'rede-castanha-viva',
    title: 'Castanha beneficiada com rastreabilidade socioambiental',
    origin: 'Santarém, PA',
    destination: 'Macapá, AP',
    volume: '22 t',
    window: '08-12 maio',
    cargoType: 'Fracionada',
    status: 'contracting',
    co2Saving: '-51% CO₂',
    targetPrice: 'R$ 8.940',
    visibility: 'public',
    publishedAt: '2026-05-03T09:20:00.000Z'
  }
];

