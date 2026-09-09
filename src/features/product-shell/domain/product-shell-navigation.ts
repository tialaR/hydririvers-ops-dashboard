export type ProductShellNavId = 'cockpit' | 'publicCargoes' | 'myCargoes' | 'notifications' | 'profile';

export type ProductShellConfig = {
  showHeader: boolean;
  showBottomNav: boolean;
  headerMode: 'public' | 'authenticated' | 'minimal';
};

const BOTTOM_NAV_ROUTES: ProductShellNavId[] = [
  'cockpit',
  'publicCargoes',
  'myCargoes',
  'notifications',
  'profile'
];

export function resolveBottomNavId(pathname: string): ProductShellNavId | null {
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

export function resolveShellConfig(pathname: string): ProductShellConfig {
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

export function bottomNavHref(navId: ProductShellNavId): string {
  const map: Record<ProductShellNavId, string> = {
    cockpit: '/cockpit',
    publicCargoes: '/cargas-publicas',
    myCargoes: '/minhas-cargas',
    notifications: '/notificacoes',
    profile: '/perfil'
  };
  return map[navId];
}
