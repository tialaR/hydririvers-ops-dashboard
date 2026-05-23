import type { AppLocale } from './route-types';
import { routeSearchParams } from './route-search-params';
import { normalizeCargoId } from './normalize-cargo-id';

/** Segmentos sem prefixo de locale (uso com next-intl Link / router + proxy). */
const intlSegments = {
  login: '/login',
  /** Cadastro — rota `[locale]/cadastro`. */
  cadastro: '/cadastro',
  perfil: '/perfil',
  logout: '/logout',
  dashboard: '/dashboard',
  cargasRoot: '/cargas',
  minhasCargas: '/minhas-cargas',
  cargasNova: '/cargas/nova',
  admin: '/admin',
  negociacoes: '/negociacoes',
  rastreio: '/rastreio',
  embarcacoes: '/embarcacoes',
  impacto: '/impacto',
  governo: '/governo'
} as const;

function splitPathSearchAndHash(value: string) {
  const hashIndex = value.indexOf('#');
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : '';
  const pathAndSearch = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const searchIndex = pathAndSearch.indexOf('?');
  const pathname = searchIndex >= 0 ? pathAndSearch.slice(0, searchIndex) : pathAndSearch;
  const search = searchIndex >= 0 ? pathAndSearch.slice(searchIndex) : '';

  return {
    pathname,
    search,
    hash
  };
}

/**
 * Monta caminho absoluto com locale (`/{locale}/...`) para `redirect()` do Next,
 * `revalidatePath`, `window.location`, URLs completas em E2E, etc.
 */
export function localizedAppPath(locale: AppLocale, pathname: string): string {
  if (pathname === '/') return `/${locale}`;
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const { pathname: cleanPathname, search, hash } = splitPathSearchAndHash(normalized);

  if (localePathPrefix.test(cleanPathname)) {
    return `${cleanPathname}${search}${hash}`;
  }

  return `/${locale}${cleanPathname}${search}${hash}`;
}

/**
 * Rotas relativas ao segmento `[locale]` (sem repetir `/${locale}`).
 * Use em `Link`, `router.push` e na lista de rotas privadas do `proxy.ts`.
 */
export const intlAppPaths = {
  home: '/',
  auth: {
    login: intlSegments.login,
    register: intlSegments.cadastro,
    profile: intlSegments.perfil,
    logout: intlSegments.logout
  },
  dashboard: {
    home: intlSegments.dashboard
  },
  cargos: {
    marketplace: intlSegments.cargasRoot,
    myCargos: intlSegments.minhasCargas,
    publishCargo: intlSegments.cargasNova,
    cargoDetail: (cargoId: string) =>
      `${intlSegments.cargasRoot}/${encodeURIComponent(normalizeCargoId(cargoId))}`,
    myCargoDetail: (cargoId: string) =>
      `${intlSegments.minhasCargas}/${encodeURIComponent(normalizeCargoId(cargoId))}`,
    cargoView: (cargoId: string, view: string) =>
      `${intlSegments.cargasRoot}/${encodeURIComponent(normalizeCargoId(cargoId))}?view=${encodeURIComponent(view)}`,
    cargoMap: (cargoId: string) =>
      `${intlSegments.cargasRoot}/${encodeURIComponent(normalizeCargoId(cargoId))}/mapa`
  },
  admin: {
    home: intlSegments.admin
  },
  negotiations: {
    home: intlSegments.negociacoes,
    negotiationDetail: (negotiationId: string) => `${intlSegments.negociacoes}/${negotiationId}`
  },
  tracking: {
    home: intlSegments.rastreio
  },
  vessels: {
    marketplace: intlSegments.embarcacoes,
    vesselDetail: (vesselId: string) => `${intlSegments.embarcacoes}/${vesselId}`
  },
  impact: {
    home: intlSegments.impacto,
    impactDetail: (impactId: string) => `${intlSegments.impacto}/${impactId}`
  },
  government: {
    home: intlSegments.governo
  }
} as const;

const localePathPrefix = /^\/(pt-BR|en-US|es)(?=\/|$)/;

/**
 * Caminho após o segmento de locale (ex.: `/login`, `/cadastro`).
 * Usado para detectar páginas públicas de auth sem depender do locale.
 */
export function stripLocaleSegmentPath(pathname: string): string {
  const normalized = pathname.replace(localePathPrefix, '') || '/';
  return normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

/** Login e cadastro: fluxo público sem chrome logado (sidebar, nav mobile, FAB do shell). */
export function isAuthPublicShellPathname(pathname: string): boolean {
  const stripped = stripLocaleSegmentPath(pathname);
  return stripped === intlAppPaths.auth.login || stripped === intlAppPaths.auth.register;
}

/** Mapa hidroviário de carga (`/[locale]/cargas/[id]/mapa`) — experiência imersiva no mobile. */
export function isCargoHydrowayMapPathname(pathname: string): boolean {
  return /^\/cargas\/[^/]+\/mapa$/.test(stripLocaleSegmentPath(pathname));
}

/** Rotas que exigem cookie `hydrorivers_session` (mesma ordem semântica que `proxy.ts`). */
export const middlewarePrivateIntlPaths: readonly string[] = [
  intlAppPaths.dashboard.home,
  intlAppPaths.cargos.myCargos,
  intlAppPaths.cargos.publishCargo,
  intlAppPaths.auth.profile,
  intlAppPaths.negotiations.home,
  intlAppPaths.tracking.home,
  intlAppPaths.vessels.marketplace,
  intlAppPaths.impact.home,
  intlAppPaths.government.home,
  intlAppPaths.admin.home
];

export const appRoutes = {
  home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.home),
  auth: {
    login: (locale: AppLocale, nextAbsolutePath?: string) => {
      const base = localizedAppPath(locale, intlAppPaths.auth.login);
      if (!nextAbsolutePath) return base;
      return `${base}?${routeSearchParams.next}=${encodeURIComponent(nextAbsolutePath)}`;
    },
    register: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.auth.register),
    profile: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.auth.profile),
    logout: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.auth.logout)
  },
  dashboard: {
    home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.dashboard.home)
  },
  cargos: {
    marketplace: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.cargos.marketplace),
    myCargos: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.cargos.myCargos),
    publishCargo: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.cargos.publishCargo),
    cargoDetail: (locale: AppLocale, cargoId: string) =>
      localizedAppPath(locale, intlAppPaths.cargos.cargoDetail(cargoId)),
    cargoView: (locale: AppLocale, cargoId: string, view: string) =>
      localizedAppPath(locale, intlAppPaths.cargos.cargoView(cargoId, view)),
    myCargoDetail: (locale: AppLocale, cargoId: string) =>
      localizedAppPath(locale, intlAppPaths.cargos.myCargoDetail(cargoId)),
    cargoMap: (locale: AppLocale, cargoId: string) =>
      localizedAppPath(locale, intlAppPaths.cargos.cargoMap(cargoId))
  },
  admin: {
    home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.admin.home)
  },
  negotiations: {
    home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.negotiations.home),
    negotiationDetail: (locale: AppLocale, negotiationId: string) =>
      localizedAppPath(locale, intlAppPaths.negotiations.negotiationDetail(negotiationId))
  },
  tracking: {
    home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.tracking.home)
  }
} as const;
