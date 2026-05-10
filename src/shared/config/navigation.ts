import { intlAppPaths } from '@/shared/routing/app-routes';

function normalizeCurrentPath(pathname: string) {
  const withoutLocale = pathname.replace(/^\/(pt-BR|en-US|es)(?=\/|$)/, '') || '/';
  return withoutLocale.replace(/\/$/, '') || '/';
}

export function resolveActiveNavigationHref(pathname: string, navigation = appNavigationItems) {
  const current = normalizeCurrentPath(pathname);
  const candidates = navigation
    .filter((item) => item.href !== '/')
    .filter((item) => current === item.href || current.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length);

  return candidates[0]?.href ?? (current === '/' ? '/' : '');
}

export const appNavigationItems = [
  { href: intlAppPaths.home, labelKey: 'home' },
  { href: intlAppPaths.dashboard.home, labelKey: 'dashboard' },
  { href: intlAppPaths.cargos.marketplace, labelKey: 'cargoes' },
  { href: intlAppPaths.cargos.myCargos, labelKey: 'myCargoes' },
  { href: intlAppPaths.vessels.marketplace, labelKey: 'vessels' },
  { href: intlAppPaths.negotiations.home, labelKey: 'negotiations' },
  { href: intlAppPaths.tracking.home, labelKey: 'tracking' },
  { href: intlAppPaths.impact.home, labelKey: 'impact' },
  { href: intlAppPaths.government.home, labelKey: 'government' },
  { href: intlAppPaths.admin.home, labelKey: 'admin' }
] as const;

export const mainNavigation = appNavigationItems;
