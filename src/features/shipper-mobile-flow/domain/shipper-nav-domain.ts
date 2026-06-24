import type { ShipperBottomNavId } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export type ShipperShellConfig = {
  showHeader: boolean;
  showBottomNav: boolean;
  headerMode: 'public' | 'authenticated' | 'minimal';
};

const BOTTOM_NAV_ROUTES: ShipperBottomNavId[] = [
  'cockpit',
  'publicCargoes',
  'myCargoes',
  'notifications',
  'profile'
];

export function resolveBottomNavId(pathname: string): ShipperBottomNavId | null {
  if (pathname.includes('/cockpit')) return 'cockpit';
  if (pathname.includes('/cargas-publicas')) return 'publicCargoes';
  if (pathname.match(/\/minhas-cargas\/?$/)) return 'myCargoes';
  if (pathname.includes('/notificacoes')) return 'notifications';
  if (pathname.includes('/perfil')) return 'profile';
  return null;
}

export function shouldShowBottomNav(pathname: string): boolean {
  const navId = resolveBottomNavId(pathname);
  if (!navId) return false;
  return BOTTOM_NAV_ROUTES.includes(navId);
}

export function resolveShellConfig(pathname: string): ShipperShellConfig {
  const authPaths = ['/entrar', '/registrar', '/verificar-otp'];
  const noNavPaths = ['/offline', '/erro/', '/sucesso/', '/mapa', '/minhas-cargas/nova'];
  const isAuth = authPaths.some((segment) => pathname.includes(segment));
  const isLanding = pathname.match(/\/(pt-BR|en-US|es)\/?$/) !== null;
  const isMap = pathname.includes('/mapa');
  const isState = noNavPaths.some((segment) => pathname.includes(segment));

  if (isAuth || isLanding) {
    return { showHeader: false, showBottomNav: false, headerMode: 'public' };
  }

  if (isMap || isState || pathname.includes('/minhas-cargas/nova')) {
    return { showHeader: true, showBottomNav: false, headerMode: isMap ? 'minimal' : 'authenticated' };
  }

  return {
    showHeader: true,
    showBottomNav: shouldShowBottomNav(pathname),
    headerMode: 'authenticated'
  };
}

export function bottomNavHref(navId: ShipperBottomNavId): string {
  const map: Record<ShipperBottomNavId, string> = {
    cockpit: '/cockpit',
    publicCargoes: '/cargas-publicas',
    myCargoes: '/minhas-cargas',
    notifications: '/notificacoes',
    profile: '/perfil'
  };
  return map[navId];
}
