import { describe, expect, it } from 'vitest';

import { resolveOwnedCargoMapScene } from '@/features/cargo/domain/resolve-owned-cargo-map-scene';
import { resolveOwnedCargoListMicro } from '@/features/cargo/domain/resolve-owned-cargo-list-micro';
import { userCargosMock } from '@/features/cargo/mocks/owned-cargos.mock';

describe('resolveOwnedCargoMapScene', () => {
  it('resolve cena schematica para origem e destino conhecidos', () => {
    const cargo = userCargosMock[0]!;
    const scene = resolveOwnedCargoMapScene(cargo, 18);

    expect(scene).not.toBeNull();
    expect(scene?.route.routePathD).toContain('M');
    expect(scene?.route.traveledPathD.length).toBeGreaterThan(0);
    expect(scene?.viewBox.width).toBeGreaterThan(0);
  });

  it('retorna null quando cidades não estão no mapa schematico', () => {
    const scene = resolveOwnedCargoMapScene(
      {
        ...userCargosMock[0]!,
        origin: 'Cidade Inexistente, XX',
        destination: 'Outro Lugar, YY',
      },
      10,
    );

    expect(scene).toBeNull();
  });
});

describe('resolveOwnedCargoListMicro', () => {
  it('prioriza propostas quando há ofertas', () => {
    const cargo = { ...userCargosMock[0]!, proposalsCount: 3, status: 'bidding' as const };
    const micro = resolveOwnedCargoListMicro(cargo);
    expect(micro.kind).toBe('proposals');
    expect(micro.count).toBe(3);
  });

  it('marca em trânsito para cargas embarcadas', () => {
    const boarded = userCargosMock.find((c) => c.status === 'boarded');
    expect(boarded).toBeDefined();
    const micro = resolveOwnedCargoListMicro(boarded!);
    expect(micro.kind).toBe('track');
  });
});
