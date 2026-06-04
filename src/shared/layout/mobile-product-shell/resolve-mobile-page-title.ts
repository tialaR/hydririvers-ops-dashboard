import { intlAppPaths } from '@/shared/routing/app-routes';

/** Chaves i18n (`adminChrome.mobile.pageTitles.*` ou `nav.*`). */
export type MobilePageTitleMessageKey =
  | 'nav.home'
  | 'nav.dashboard'
  | 'nav.cargoes'
  | 'nav.myCargoes'
  | 'nav.negotiations'
  | 'nav.tracking'
  | 'nav.vessels'
  | 'nav.profile'
  | 'nav.impact'
  | 'nav.government'
  | 'nav.admin'
  | 'adminChrome.mobile.pageTitles.cargoDetail'
  | 'adminChrome.mobile.pageTitles.cargoMap'
  | 'adminChrome.mobile.pageTitles.cargoPublish'
  | 'adminChrome.mobile.pageTitles.negotiationDetail'
  | 'adminChrome.mobile.pageTitles.vesselDetail'
  | 'adminChrome.mobile.pageTitles.impactDetail';

/**
 * Resolve título do header mobile a partir do pathname sem locale.
 * Não usa `header.title` genérico para workspace de cargas.
 */
export function resolveMobilePageTitleKey(normalizedPathname: string): MobilePageTitleMessageKey {
  if (normalizedPathname === intlAppPaths.home || normalizedPathname === '/') {
    return 'nav.home';
  }

  if (normalizedPathname === intlAppPaths.dashboard.home) {
    return 'nav.dashboard';
  }

  if (normalizedPathname === intlAppPaths.cargos.marketplace) {
    return 'nav.cargoes';
  }

  if (normalizedPathname === intlAppPaths.cargos.myCargos) {
    return 'nav.myCargoes';
  }

  if (normalizedPathname === intlAppPaths.cargos.publishCargo) {
    return 'adminChrome.mobile.pageTitles.cargoPublish';
  }

  const cargoMapMatch = normalizedPathname.match(
    new RegExp(`^${escapeRegExp(intlAppPaths.cargos.marketplace)}/([^/]+)/mapa$`),
  );
  if (cargoMapMatch) {
    return 'adminChrome.mobile.pageTitles.cargoMap';
  }

  const cargoDetailMatch = normalizedPathname.match(
    new RegExp(`^${escapeRegExp(intlAppPaths.cargos.marketplace)}/([^/]+)$`),
  );
  if (cargoDetailMatch) {
    return 'adminChrome.mobile.pageTitles.cargoDetail';
  }

  if (normalizedPathname === intlAppPaths.negotiations.home) {
    return 'nav.negotiations';
  }

  const negotiationDetailMatch = normalizedPathname.match(
    new RegExp(`^${escapeRegExp(intlAppPaths.negotiations.home)}/([^/]+)$`),
  );
  if (negotiationDetailMatch) {
    return 'adminChrome.mobile.pageTitles.negotiationDetail';
  }

  if (normalizedPathname === intlAppPaths.tracking.home) {
    return 'nav.tracking';
  }

  if (normalizedPathname === intlAppPaths.vessels.marketplace) {
    return 'nav.vessels';
  }

  const vesselDetailMatch = normalizedPathname.match(
    new RegExp(`^${escapeRegExp(intlAppPaths.vessels.marketplace)}/([^/]+)$`),
  );
  if (vesselDetailMatch) {
    return 'adminChrome.mobile.pageTitles.vesselDetail';
  }

  if (normalizedPathname === intlAppPaths.auth.profile) {
    return 'nav.profile';
  }

  if (normalizedPathname === intlAppPaths.impact.home) {
    return 'nav.impact';
  }

  if (normalizedPathname === intlAppPaths.government.home) {
    return 'nav.government';
  }

  if (normalizedPathname === intlAppPaths.admin.home) {
    return 'nav.admin';
  }

  const impactDetailMatch = normalizedPathname.match(
    new RegExp(`^${escapeRegExp(intlAppPaths.impact.home)}/([^/]+)$`),
  );
  if (impactDetailMatch) {
    return 'adminChrome.mobile.pageTitles.impactDetail';
  }

  return 'nav.dashboard';
}

export function resolveMobileBottomNavActiveId(normalizedPathname: string): string {
  if (normalizedPathname === intlAppPaths.home || normalizedPathname === '/') {
    return 'overview';
  }

  if (
    normalizedPathname === intlAppPaths.dashboard.home
    || normalizedPathname.startsWith(`${intlAppPaths.dashboard.home}/`)
  ) {
    return 'dashboard';
  }

  if (
    normalizedPathname === intlAppPaths.cargos.marketplace
    || normalizedPathname.startsWith(`${intlAppPaths.cargos.marketplace}/`)
  ) {
    return 'cargos';
  }

  if (
    normalizedPathname === intlAppPaths.negotiations.home
    || normalizedPathname.startsWith(`${intlAppPaths.negotiations.home}/`)
  ) {
    return 'negotiations';
  }

  if (
    normalizedPathname === intlAppPaths.tracking.home
    || normalizedPathname.startsWith(`${intlAppPaths.tracking.home}/`)
  ) {
    return 'tracking';
  }

  return 'overview';
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
