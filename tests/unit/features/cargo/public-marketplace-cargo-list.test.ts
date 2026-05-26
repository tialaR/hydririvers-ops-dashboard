import { describe, expect, it } from 'vitest';

import { PUBLIC_MARKETPLACE_CARGO_IDS } from '@/features/cargo/constants/public-marketplace-cargos';
import { resolvePublicMarketplaceCargoList } from '@/features/cargo/data/resolve-public-marketplace-cargo-list';

describe('resolvePublicMarketplaceCargoList', () => {
  it('inclui cargos públicos extras do seed além de CARGO-001…004', () => {
    const list = resolvePublicMarketplaceCargoList();
    const ids = list.map((cargo) => cargo.id);

    expect(ids).toContain('CARGO-001');
    expect(ids).toContain('CARGO-006');
    expect(ids).toContain('CARGO-007');
    expect(ids).toContain('CARGO-009');
    expect(ids.length).toBeGreaterThan(4);
    expect(PUBLIC_MARKETPLACE_CARGO_IDS).toEqual(ids);
  });

  it('mantém CARGO-003 canônico mesmo com seed privado', () => {
    const list = resolvePublicMarketplaceCargoList();
    const cargo003 = list.find((cargo) => cargo.id === 'CARGO-003');

    expect(cargo003).toBeDefined();
    expect(cargo003?.visibility).toBe('public');
    expect(cargo003?.destination).toContain('Macapá');
  });
});
