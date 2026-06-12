import { describe, expect, it } from 'vitest';
import {
  CARGO_VISIBILITY_POLICY,
  canAccessCargoAtTier,
  resolveCargoVisibilityTier,
  resolveViewerCargoAccessTier,
} from '@/features/cargo/domain/cargo-visibility-policy';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { HydroUser } from '@/features/auth/domain/auth.types';

const publicCargo: Cargo = {
  id: 'PUB-1',
  title: 'Public cargo',
  origin: 'A',
  destination: 'B',
  volume: '1 t',
  window: 'hoje',
  cargoType: 'Seca',
  status: 'open',
  co2Saving: '-10% CO₂',
  targetPrice: 'R$ 1',
  visibility: 'public',
};

const privateCargo: Cargo = {
  id: 'PRIV-1',
  ownerId: 'u-shipper-1',
  shipperId: 'u-shipper-1',
  title: 'Private cargo',
  origin: 'A',
  destination: 'B',
  volume: '1 t',
  window: 'hoje',
  cargoType: 'Seca',
  status: 'open',
  co2Saving: '-10% CO₂',
  targetPrice: 'R$ 1',
  visibility: 'private',
};

function user(role: HydroUser['role'], id: string): HydroUser {
  return { id, role, approved: true, name: 'Test', email: 't@test.dev', company: 'Test Co', phone: '+5511999999999' };
}

describe('cargo-visibility-policy', () => {
  it('expõe tiers public, authenticated e owner', () => {
    expect(Object.keys(CARGO_VISIBILITY_POLICY).sort()).toEqual(['authenticated', 'owner', 'public']);
  });

  it('resolveCargoVisibilityTier distingue público e privado', () => {
    expect(resolveCargoVisibilityTier(publicCargo)).toBe('public');
    expect(resolveCargoVisibilityTier(privateCargo)).toBe('owner');
  });

  it('carga pública é visível sem login no tier public', () => {
    expect(canAccessCargoAtTier(publicCargo, null, 'public')).toBe(true);
    expect(canAccessCargoAtTier(publicCargo, null, 'authenticated')).toBe(false);
  });

  it('carga privada exige owner no tier owner', () => {
    expect(canAccessCargoAtTier(privateCargo, null, 'owner')).toBe(false);
    expect(canAccessCargoAtTier(privateCargo, user('shipper', 'u-shipper-1'), 'owner')).toBe(true);
    expect(canAccessCargoAtTier(privateCargo, user('shipper', 'u-other'), 'owner')).toBe(false);
  });

  it('admin alcança tier owner em carga privada', () => {
    expect(canAccessCargoAtTier(privateCargo, user('admin', 'u-admin-1'), 'owner')).toBe(true);
  });

  it('resolveViewerCargoAccessTier retorna null sem acesso', () => {
    expect(resolveViewerCargoAccessTier(privateCargo, null)).toBe(null);
    expect(resolveViewerCargoAccessTier(privateCargo, user('shipper', 'u-other'))).toBe(null);
    expect(resolveViewerCargoAccessTier(publicCargo, null)).toBe('public');
    expect(resolveViewerCargoAccessTier(privateCargo, user('shipper', 'u-shipper-1'))).toBe('owner');
  });
});
