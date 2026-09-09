import { describe, expect, it } from 'vitest';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import {
  canAccessRoute,
  canCreateCargo,
  canNegotiateCargo,
  canUseMockMode,
  canViewCargo,
  canViewVessel
} from '@/features/auth/domain/access-control';
import type { Cargo, Negotiation, Vessel } from '@/features/marketplace/domain/marketplace.types';
import { intlAppPaths } from '@/shared/routing/app-routes';

const user = (role: HydroUser['role'], id: string, approved = true): HydroUser => ({
  id,
  name: 'Test User',
  email: `${id}@test.com`,
  company: 'HydroRivers',
  role,
  approved
});

const cargo = (over: Partial<Cargo> = {}): Cargo => ({
  id: 'cargo-1',
  title: 'Carga teste',
  origin: 'A',
  destination: 'B',
  volume: '1',
  window: 'janela',
  cargoType: 'Seca',
  status: 'open',
  co2Saving: '-1%',
  targetPrice: 'R$ 1',
  ...over
});

const negotiation = (over: Partial<Negotiation> = {}): Negotiation => ({
  id: 'neg-1',
  cargoTitle: 'Carga teste',
  vesselName: 'Vessel',
  stage: 'quote',
  amount: 'R$ 1',
  lastUpdate: 'Hoje',
  parties: [],
  ...over
});

const vessel = (over: Partial<Vessel> = {}): Vessel => ({
  id: 'vessel-1',
  name: 'Vessel 1',
  route: 'Route',
  capacity: '100',
  eta: 'Hoje',
  status: 'available',
  owner: 'HydroRivers',
  ...over
});

describe('auth/access-control', () => {
  it('aplica acesso por rota de forma centralizada', () => {
    expect(canAccessRoute(null, 'home')).toBe(true);
    expect(canAccessRoute(null, 'cargo-marketplace')).toBe(true);
    expect(canAccessRoute(null, 'dashboard')).toBe(false);
    expect(canAccessRoute(user('shipper', 'u1'), 'cargo-create')).toBe(true);
    expect(canAccessRoute(user('shipper', 'u1', false), 'cargo-create')).toBe(false);
    expect(canAccessRoute(user('carrier', 'u2'), 'cargo-create')).toBe(false);
    expect(canAccessRoute(user('carrier', 'u2'), 'vessels')).toBe(true);
    expect(canAccessRoute(user('shipper', 'u1'), 'vessels')).toBe(false);
    expect(canAccessRoute(user('admin', 'u3'), 'government')).toBe(true);
  });

  it('deriva permissões por papel sem espalhar regra na UI', () => {
    expect(canCreateCargo(user('shipper', 'u1'))).toBe(true);
    expect(canCreateCargo(user('shipper', 'u1', false))).toBe(false);
    expect(canCreateCargo(user('carrier', 'u2'))).toBe(false);
    expect(canUseMockMode(user('admin', 'u3'))).toBe(true);
    expect(canUseMockMode(user('shipper', 'u1'))).toBe(false);
  });

  it('controla visibilidade de carga por ownership e papel', () => {
    const publicCargo = cargo({ visibility: 'public' });
    const privateCargo = cargo({ visibility: 'private', ownerId: 'u-shipper-1', shipperId: 'u-shipper-1' });
    const carrierCargo = cargo({ visibility: 'private', carrierId: 'u-carrier-1' });
    const carrierNegotiation = negotiation({ cargoId: privateCargo.id, carrierId: 'u-carrier-1' });

    expect(canViewCargo(null, publicCargo)).toBe(true);
    expect(canViewCargo(null, privateCargo)).toBe(false);
    expect(canViewCargo(user('shipper', 'u-shipper-1'), privateCargo)).toBe(true);
    expect(canViewCargo(user('carrier', 'u-carrier-1'), carrierCargo)).toBe(true);
    expect(canViewCargo(user('admin', 'u-admin-1'), privateCargo)).toBe(true);
    expect(canNegotiateCargo(user('carrier', 'u-carrier-1'), privateCargo, [carrierNegotiation])).toBe(true);
  });

  it('controla acesso a embarcações por papel', () => {
    expect(canViewVessel(user('carrier', 'u-carrier-1'), vessel())).toBe(true);
    expect(canViewVessel(user('admin', 'u-admin-1'), vessel())).toBe(true);
    expect(canViewVessel(user('shipper', 'u-shipper-1'), vessel({ ownerId: 'u-shipper-1' }))).toBe(true);
    expect(canViewVessel(user('shipper', 'u-shipper-1'), vessel({ ownerId: 'u-carrier-1' }))).toBe(false);
  });

  it('mantém os caminhos públicos e privados esperados', () => {
    expect(canAccessRoute(null, 'login')).toBe(true);
    expect(canAccessRoute(null, 'register')).toBe(true);
    expect(canAccessRoute(user('shipper', 'u1'), 'profile')).toBe(true);
    expect(canAccessRoute(user('carrier', 'u2'), 'profile')).toBe(true);
    expect(canAccessRoute(user('admin', 'u3'), 'admin')).toBe(true);
    expect(canAccessRoute(user('shipper', 'u1'), 'admin')).toBe(false);
    expect(intlAppPaths.cargos.marketplace).toBe('/cargas');
  });
});
