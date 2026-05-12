import type { HydroUser, UserRole } from './auth.types';
import type { Cargo, Negotiation, Vessel } from '@/features/marketplace/domain/marketplace.types';
import { intlAppPaths } from '@/shared/routing/app-routes';

export type FeatureCapability =
  | 'view-dashboard'
  | 'view-cargo-marketplace'
  | 'view-my-cargoes'
  | 'create-cargo'
  | 'view-negotiations'
  | 'view-tracking'
  | 'view-vessels'
  | 'view-impact'
  | 'view-government'
  | 'view-admin'
  | 'view-profile'
  | 'use-mock-mode';

export type RouteKey =
  | 'home'
  | 'dashboard'
  | 'cargo-marketplace'
  | 'cargo-create'
  | 'cargo-my'
  | 'negotiations'
  | 'tracking'
  | 'vessels'
  | 'impact'
  | 'government'
  | 'admin'
  | 'profile'
  | 'login'
  | 'register';

export type RouteAccessRule = {
  route: RouteKey;
  requiresAuth: boolean;
  capability?: FeatureCapability;
};

const roleCapabilities: Record<UserRole, readonly FeatureCapability[]> = {
  shipper: [
    'view-dashboard',
    'view-cargo-marketplace',
    'view-my-cargoes',
    'create-cargo',
    'view-negotiations',
    'view-tracking',
    'view-impact',
    'view-profile'
  ],
  carrier: [
    'view-dashboard',
    'view-cargo-marketplace',
    'view-my-cargoes',
    'view-negotiations',
    'view-tracking',
    'view-vessels',
    'view-impact',
    'view-profile'
  ],
  admin: [
    'view-dashboard',
    'view-cargo-marketplace',
    'view-my-cargoes',
    'create-cargo',
    'view-negotiations',
    'view-tracking',
    'view-vessels',
    'view-impact',
    'view-government',
    'view-admin',
    'view-profile',
    'use-mock-mode'
  ]
};

const routeAccessRules: Record<RouteKey, RouteAccessRule> = {
  home: { route: 'home', requiresAuth: false },
  dashboard: { route: 'dashboard', requiresAuth: true, capability: 'view-dashboard' },
  'cargo-marketplace': { route: 'cargo-marketplace', requiresAuth: false, capability: 'view-cargo-marketplace' },
  'cargo-create': { route: 'cargo-create', requiresAuth: true, capability: 'create-cargo' },
  'cargo-my': { route: 'cargo-my', requiresAuth: true, capability: 'view-my-cargoes' },
  negotiations: { route: 'negotiations', requiresAuth: true, capability: 'view-negotiations' },
  tracking: { route: 'tracking', requiresAuth: true, capability: 'view-tracking' },
  vessels: { route: 'vessels', requiresAuth: true, capability: 'view-vessels' },
  impact: { route: 'impact', requiresAuth: true, capability: 'view-impact' },
  government: { route: 'government', requiresAuth: true, capability: 'view-government' },
  admin: { route: 'admin', requiresAuth: true, capability: 'view-admin' },
  profile: { route: 'profile', requiresAuth: true, capability: 'view-profile' },
  login: { route: 'login', requiresAuth: false },
  register: { route: 'register', requiresAuth: false }
};

function normalizedRoleCapabilities(role: UserRole | undefined) {
  if (!role) return [] as const;
  return roleCapabilities[role] ?? [];
}

export function isShipperRole(role?: string | null): role is Extract<UserRole, 'shipper'> {
  return role === 'shipper';
}

export function isCarrierRole(role?: string | null): role is Extract<UserRole, 'carrier'> {
  return role === 'carrier';
}

export function isAdminRole(role?: string | null): role is Extract<UserRole, 'admin'> {
  return role === 'admin';
}

export function hasPermission(user: HydroUser | null | undefined, capability: FeatureCapability) {
  if (!user) return false;
  return normalizedRoleCapabilities(user.role).includes(capability);
}

export function canAccessRoute(user: HydroUser | null | undefined, route: RouteKey) {
  const rule = routeAccessRules[route];
  if (!rule.requiresAuth) return true;
  if (!user) return false;
  if (route === 'cargo-create') return canCreateCargo(user);
  if (!rule.capability) return true;
  return hasPermission(user, rule.capability);
}

export function canUseMockMode(user: HydroUser | null | undefined) {
  return hasPermission(user, 'use-mock-mode');
}

export function canCreateCargo(user: HydroUser | null | undefined) {
  return Boolean(user?.approved) && hasPermission(user, 'create-cargo');
}

export function canViewCargo(user: HydroUser | null | undefined, cargo: Cargo, negotiations: Negotiation[] = []) {
  if (cargo.visibility === 'public') return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'shipper') {
    return cargo.ownerId === user.id || cargo.shipperId === user.id || negotiations.some((negotiation) => negotiation.cargoId === cargo.id && negotiation.shipperId === user.id);
  }
  if (user.role === 'carrier') {
    return cargo.carrierId === user.id || negotiations.some((negotiation) => negotiation.cargoId === cargo.id && negotiation.carrierId === user.id);
  }
  return false;
}

export function canManageCargo(user: HydroUser | null | undefined, cargo: Cargo, negotiations: Negotiation[] = []) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'shipper') return cargo.ownerId === user.id || cargo.shipperId === user.id;
  if (user.role === 'carrier') return cargo.carrierId === user.id || negotiations.some((negotiation) => negotiation.cargoId === cargo.id && negotiation.carrierId === user.id);
  return false;
}

export function canNegotiateCargo(user: HydroUser | null | undefined, cargo: Cargo, negotiations: Negotiation[] = []) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'shipper') {
    return cargo.ownerId === user.id || cargo.shipperId === user.id || negotiations.some((negotiation) => negotiation.cargoId === cargo.id && negotiation.shipperId === user.id);
  }
  if (user.role === 'carrier') {
    return cargo.visibility === 'public' || cargo.carrierId === user.id || negotiations.some((negotiation) => negotiation.cargoId === cargo.id && negotiation.carrierId === user.id);
  }
  return false;
}

export function canViewVessel(user: HydroUser | null | undefined, vessel: Vessel) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'carrier') return true;
  if (user.role === 'shipper') return vessel.ownerId === user.id;
  return false;
}

export function routeKeyForHref(href: string): RouteKey | null {
  if (href === intlAppPaths.home) return 'home';
  if (href === intlAppPaths.dashboard.home) return 'dashboard';
  if (href === intlAppPaths.cargos.marketplace) return 'cargo-marketplace';
  if (href === intlAppPaths.cargos.publishCargo) return 'cargo-create';
  if (href === intlAppPaths.cargos.myCargos) return 'cargo-my';
  if (href === intlAppPaths.negotiations.home) return 'negotiations';
  if (href === intlAppPaths.tracking.home) return 'tracking';
  if (href === intlAppPaths.vessels.marketplace) return 'vessels';
  if (href === intlAppPaths.impact.home) return 'impact';
  if (href === intlAppPaths.government.home) return 'government';
  if (href === intlAppPaths.admin.home) return 'admin';
  if (href === intlAppPaths.auth.profile) return 'profile';
  if (href === intlAppPaths.auth.login) return 'login';
  if (href === intlAppPaths.auth.register) return 'register';
  return null;
}

export function canSeeNavigationItem(user: HydroUser | null | undefined, href: string) {
  const routeKey = routeKeyForHref(href);
  if (!routeKey) return true;
  return canAccessRoute(user, routeKey);
}

export const routeAccess = routeAccessRules;
