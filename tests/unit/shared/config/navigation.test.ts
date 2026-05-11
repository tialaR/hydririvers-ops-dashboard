import { describe, expect, it } from 'vitest';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { filterMainNavigationForUser, mainNavigation, resolveActiveNavigationHref } from '@/shared/config/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';

const baseUser: Pick<HydroUser, 'id' | 'name' | 'email' | 'company' | 'approved'> = {
  id: 'u-test',
  name: 'Test',
  email: 'test@example.com',
  company: 'Co',
  approved: true
};

const shipper: HydroUser = { ...baseUser, role: 'shipper' };
const carrier: HydroUser = { ...baseUser, id: 'u-carrier', role: 'carrier' };
const admin: HydroUser = { ...baseUser, id: 'u-admin', role: 'admin' };

describe('shared/config/navigation', () => {
  it('mantém a navegação canônica estável para sidebar e mobile', () => {
    expect(mainNavigation.map((item) => item.href)).toEqual([
      intlAppPaths.home,
      intlAppPaths.dashboard.home,
      intlAppPaths.cargos.marketplace,
      intlAppPaths.cargos.myCargos,
      intlAppPaths.vessels.marketplace,
      intlAppPaths.negotiations.home,
      intlAppPaths.tracking.home,
      intlAppPaths.impact.home,
      intlAppPaths.government.home,
      intlAppPaths.admin.home
    ]);
  });

  it('mantém myCargos como rota canônica sem alias quebrado', () => {
    expect(intlAppPaths.cargos.myCargos).toBe('/minhas-cargas');
    expect(mainNavigation.find((item) => item.labelKey === 'myCargoes')?.href).toBe('/minhas-cargas');
  });

  it('respeita rotas filhas ao resolver item ativo da sidebar', () => {
    expect(resolveActiveNavigationHref('/pt-BR/dashboard')).toBe('/dashboard');
    expect(resolveActiveNavigationHref('/pt-BR/cargas')).toBe('/cargas');
    expect(resolveActiveNavigationHref('/pt-BR/minhas-cargas')).toBe('/minhas-cargas');
    expect(resolveActiveNavigationHref('/pt-BR/minhas-cargas/MY-CARGO-001')).toBe('/minhas-cargas');
    expect(resolveActiveNavigationHref('/pt-BR/cargas/CARGO-001')).toBe('/cargas');
  });

  it('marca embarcações ativas sem confundir com cargas', () => {
    expect(resolveActiveNavigationHref('/pt-BR/embarcacoes')).toBe('/embarcacoes');
    expect(resolveActiveNavigationHref('/en-US/embarcacoes/vessel-01')).toBe('/embarcacoes');
  });

  it('visitante (user null / sessão ainda não pronta) vê Embarcações e não vê Minhas cargas', () => {
    const guest = filterMainNavigationForUser(null).map((item) => item.href);
    expect(guest).toContain(intlAppPaths.vessels.marketplace);
    expect(guest).not.toContain(intlAppPaths.cargos.myCargos);
  });

  it('para shipper autenticado, inclui Minhas cargas e omite Embarcações', () => {
    const nav = filterMainNavigationForUser(shipper).map((item) => item.href);
    expect(nav).toContain(intlAppPaths.cargos.myCargos);
    expect(nav).not.toContain(intlAppPaths.vessels.marketplace);
  });

  it('para carrier autenticado, inclui Minhas cargas e Embarcações', () => {
    const nav = filterMainNavigationForUser(carrier).map((item) => item.href);
    expect(nav).toContain(intlAppPaths.cargos.myCargos);
    expect(nav).toContain(intlAppPaths.vessels.marketplace);
  });

  it('para admin autenticado, inclui rotas administrativas', () => {
    const nav = filterMainNavigationForUser(admin).map((item) => item.href);
    expect(nav).toContain(intlAppPaths.admin.home);
    expect(nav).toContain(intlAppPaths.government.home);
  });
});
