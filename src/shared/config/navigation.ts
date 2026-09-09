import type { HydroUser } from '@/features/auth/domain/auth.types';
import { canSeeNavigationItem } from '@/features/auth/domain/access-control';
import { intlAppPaths } from '@/shared/routing/app-routes';

function normalizeCurrentPath(pathname: string) {
  const withoutLocale = pathname.replace(/^\/(pt-BR|en-US|es)(?=\/|$)/, '') || '/';
  return withoutLocale.replace(/\/$/, '') || '/';
}

/**
 * Resolve qual item da navegação está ativo.
 * Usa prefixo com `/${href}/` (nunca substring solta) e prioriza hrefs mais longos
 * para `/minhas-cargas/...` não colidir com `/cargas/...`.
 */
export function resolveActiveNavigationHref(pathname: string, navigation = appNavigationItems) {
  const current = normalizeCurrentPath(pathname);
  const candidates = navigation
    .filter((item) => current === item.href || (item.href !== '/' && current.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length);

  return candidates[0]?.href ?? (current === '/' ? '/' : '');
}

/**
 * Filtra itens da sidebar/header para um usuário autenticado.
 * Para SSR e primeiro render do cliente alinhados, passe `null` até `authReady === true`.
 */
export function filterMainNavigationForUser(user: HydroUser | null) {
  return mainNavigation.filter((item) => {
    if (item.href === intlAppPaths.home) return true;
    return canSeeNavigationItem(user, item.href);
  });
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
