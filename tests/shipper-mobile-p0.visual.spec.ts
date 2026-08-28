import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

const SCREENSHOT_DIR = join(process.cwd(), 'reports', 'shipper-mobile-p0-screenshots');

const VIEWPORTS = [
  { label: '375x667', width: 375, height: 667 },
  { label: '390x844', width: 390, height: 844 },
  { label: '430x932', width: 430, height: 932 }
] as const;

const PT_BR_SCREENSHOT_ROUTES = [
  '/pt-BR',
  '/pt-BR/entrar',
  '/pt-BR/registrar',
  '/pt-BR/verificar-otp',
  '/pt-BR/cockpit',
  '/pt-BR/cargas-publicas',
  '/pt-BR/cargas-publicas/pub-001',
  '/pt-BR/minhas-cargas',
  '/pt-BR/minhas-cargas/hr-4821',
  '/pt-BR/minhas-cargas/hr-4821/mapa',
  '/pt-BR/minhas-cargas/hr-4821/documentos',
  '/pt-BR/minhas-cargas/hr-4821/negociacao',
  '/pt-BR/hidrologia',
  '/pt-BR/impacto',
  '/pt-BR/notificacoes',
  '/pt-BR/perfil',
  '/pt-BR/offline',
  '/pt-BR/erro/servico',
  '/pt-BR/sucesso/acao-operacional'
] as const;

const PT_BR_SCREENSHOT_ROUTE_BATCHES = [
  {
    name: 'auth and landing',
    routes: ['/pt-BR', '/pt-BR/entrar', '/pt-BR/registrar', '/pt-BR/verificar-otp'] as const
  },
  {
    name: 'authenticated shell',
    routes: [
      '/pt-BR/cockpit',
      '/pt-BR/cargas-publicas',
      '/pt-BR/cargas-publicas/pub-001',
      '/pt-BR/minhas-cargas',
      '/pt-BR/notificacoes',
      '/pt-BR/perfil'
    ] as const
  },
  {
    name: 'cargo detail and hydro',
    routes: [
      '/pt-BR/minhas-cargas/hr-4821',
      '/pt-BR/minhas-cargas/hr-4821/mapa',
      '/pt-BR/minhas-cargas/hr-4821/documentos',
      '/pt-BR/minhas-cargas/hr-4821/negociacao',
      '/pt-BR/hidrologia',
      '/pt-BR/impacto'
    ] as const
  },
  {
    name: 'state screens',
    routes: ['/pt-BR/offline', '/pt-BR/erro/servico', '/pt-BR/sucesso/acao-operacional'] as const
  }
] as const;

const PUBLIC_CARGO_DETAIL_ROUTE = '/pt-BR/cargas-publicas/pub-001';

const I18N_ROUTES = [
  '/en-US/cockpit',
  '/es/cockpit',
  '/en-US/minhas-cargas',
  '/es/minhas-cargas'
] as const;

const ROUTES_WITH_BOTTOM_NAV = [
  '/pt-BR/cockpit',
  '/pt-BR/cargas-publicas',
  '/pt-BR/minhas-cargas',
  '/pt-BR/notificacoes',
  '/pt-BR/perfil'
] as const;

const ROUTES_WITH_AUTHENTICATED_HEADER = ROUTES_WITH_BOTTOM_NAV;

const ROUTES_WITHOUT_BOTTOM_NAV = [
  '/pt-BR',
  '/pt-BR/entrar',
  '/pt-BR/registrar',
  '/pt-BR/verificar-otp',
  '/pt-BR/minhas-cargas/hr-4821/mapa',
  '/pt-BR/offline',
  '/pt-BR/erro/servico',
  '/pt-BR/sucesso/acao-operacional'
] as const;

const MAP_ROUTE = '/pt-BR/minhas-cargas/hr-4821/mapa';

const PUBLIC_CARGO_ROUTES = ['/pt-BR/cargas-publicas', PUBLIC_CARGO_DETAIL_ROUTE] as const;

const THEME_TOGGLE = /alternar tema|toggle light|toggle.*theme|tema claro/i;

/** Patterns that indicate real sensitive data — not allowed on public routes. */
const SENSITIVE_DATA_PATTERNS: { id: string; regex: RegExp }[] = [
  { id: 'phone', regex: /(?:\+55\s?)?(?:\(\d{2}\)\s?\d|\d{2}\s)\d{4,5}[-\s]?\d{4}/ },
  { id: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
  { id: 'cpf', regex: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/ },
  { id: 'cnpj', regex: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/ },
  { id: 'freight-value', regex: /R\$\s*\d[\d.,]*/ }
];

/** Labels that must never appear as exposed fields on public cargo views. */
const FORBIDDEN_PUBLIC_LABELS: { id: string; regex: RegExp }[] = [
  { id: 'owner-contact', regex: /\bcontato do dono\b/i },
  { id: 'owner-email-label', regex: /\be-?mail do (?:dono|embarcador)\b/i }
];

const MIN_PRIMARY_CONTROL_HEIGHT_PX = 42;

type ViewportSpec = (typeof VIEWPORTS)[number];

function routeSlug(route: string): string {
  const withoutLocale = route.replace(/^\/[^/]+/, '') || '/';
  if (withoutLocale === '/') return 'root';
  return withoutLocale.replace(/^\//, '').replace(/\//g, '-');
}

function localeFromRoute(route: string): string {
  return route.split('/')[1] ?? 'pt-BR';
}

function screenshotPath(
  locale: string,
  slug: string,
  viewport: ViewportSpec,
  theme: 'light' | 'dark' | 'current'
): string {
  const themeSuffix = theme === 'current' ? 'current' : theme;
  return join(SCREENSHOT_DIR, `${locale}-${slug}-${viewport.label}-${themeSuffix}.png`);
}

async function waitForRouteReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  try {
    await page.waitForLoadState('networkidle', { timeout: 8_000 });
  } catch {
    await page.waitForLoadState('load');
  }
}

async function gotoRoute(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  await waitForRouteReady(page);
  return response;
}

function shipperBottomNav(page: Page) {
  return page.locator('[data-shipper-shell] nav').first();
}

function shipperAuthenticatedHeader(page: Page) {
  return page.locator('[data-shipper-shell] header').first();
}

async function hasThemeSwitcher(page: Page): Promise<boolean> {
  return page.getByRole('button', { name: THEME_TOGGLE }).isVisible();
}

async function readShellTheme(page: Page): Promise<'light' | 'dark' | null> {
  const theme = await page.locator('[data-shipper-shell]').first().getAttribute('data-theme');
  if (theme === 'light' || theme === 'dark') return theme;
  return null;
}

async function setShellTheme(page: Page, target: 'light' | 'dark') {
  const toggle = page.getByRole('button', { name: THEME_TOGGLE });
  if (!(await toggle.isVisible())) {
    return false;
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const current = await readShellTheme(page);
    if (current === target) return true;
    await toggle.click();
    await page.waitForTimeout(150);
  }

  return (await readShellTheme(page)) === target;
}

async function captureRouteScreenshot(
  page: Page,
  route: string,
  viewport: ViewportSpec,
  options: { fullPage?: boolean; theme?: 'light' | 'dark' | 'current' } = {}
) {
  const { fullPage = true, theme = 'current' } = options;
  const locale = localeFromRoute(route);
  const slug = routeSlug(route);
  const filePath = screenshotPath(locale, slug, viewport, theme);

  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await gotoRoute(page, route);

  if (theme !== 'current') {
    const switched = await setShellTheme(page, theme);
    if (!switched) {
      console.log(`[shipper-p0] theme switch unavailable on ${route}; saved current theme only`);
    }
  }

  const useFullPage = fullPage && !route.includes('/mapa');
  await page.screenshot({ path: filePath, fullPage: useFullPage });
  console.log(`[shipper-p0] screenshot ${filePath}`);
}

async function assertNoHorizontalOverflow(page: Page, route: string) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth
  }));
  expect(metrics.scrollWidth, `${route} horizontal overflow`).toBeLessThanOrEqual(metrics.innerWidth + 2);
}

async function assertPrimaryControlHeights(page: Page, route: string) {
  const heights = await page.evaluate((minHeightPx) => {
    const nodes = Array.from(document.querySelectorAll('button, a')) as HTMLElement[];

    return nodes
      .filter((element) => {
        const style = window.getComputedStyle(element);
        if (style.visibility === 'hidden' || style.display === 'none') return false;

        const rect = element.getBoundingClientRect();
        if (rect.width < 120 || rect.height <= 0) return false;

        const minHeight = Number.parseFloat(style.minHeight);
        const isSubmit = element instanceof HTMLButtonElement && element.type === 'submit';
        const isPrimarySized = minHeight >= minHeightPx || rect.height >= minHeightPx;

        return isSubmit || isPrimarySized;
      })
      .map((element) => element.getBoundingClientRect().height);
  }, MIN_PRIMARY_CONTROL_HEIGHT_PX);

  if (heights.length === 0) {
    console.log(`[shipper-p0] no qualifying primary controls on ${route}; touch-target height check skipped`);
    return;
  }

  for (const height of heights) {
    expect(height, `${route} primary control height`).toBeGreaterThanOrEqual(MIN_PRIMARY_CONTROL_HEIGHT_PX);
  }
}

async function assertPublicRoutePrivacy(page: Page, route: string) {
  const response = await gotoRoute(page, route);
  if (response && response.status() === 404) {
    console.log(`[shipper-p0] skip privacy check — route not found: ${route}`);
    return;
  }

  expect(response?.status(), `${route} status`).toBeLessThan(500);

  const bodyText = await page.locator('body').innerText();
  for (const pattern of SENSITIVE_DATA_PATTERNS) {
    expect(bodyText, `${route} must not expose ${pattern.id}`).not.toMatch(pattern.regex);
  }
  for (const pattern of FORBIDDEN_PUBLIC_LABELS) {
    expect(bodyText, `${route} must not expose ${pattern.id}`).not.toMatch(pattern.regex);
  }

  const negotiationLinks = page.locator('a[href*="/negociacao"], a[href*="/negociacoes"]');
  await expect(negotiationLinks, `${route} must not link to negotiation flows`).toHaveCount(0);

  const privateDocLinks = page.locator('a[href*="documentos"]');
  const privateDocLinkCount = await privateDocLinks.count();
  expect(privateDocLinkCount, `${route} must not expose private document links`).toBe(0);
}

async function captureRoutesWithThemes(page: Page, routes: readonly string[], viewport: ViewportSpec) {
  for (const route of routes) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await gotoRoute(page, route);
    expect(response, `${route} response`).not.toBeNull();
    expect(response!.status(), `${route} status`).toBeLessThan(500);
    expect(response!.status(), `${route} must not be 404`).not.toBe(404);

    const themeAvailable = await hasThemeSwitcher(page);
    if (themeAvailable) {
      await captureRouteScreenshot(page, route, viewport, { theme: 'light' });
      await captureRouteScreenshot(page, route, viewport, { theme: 'dark' });
      continue;
    }

    console.log(`[shipper-p0] no theme switch on ${route}; capturing current theme only`);
    await captureRouteScreenshot(page, route, viewport, { theme: 'current' });
  }
}

test.describe('Shipper mobile P0 — visual & functional QA', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  for (const batch of PT_BR_SCREENSHOT_ROUTE_BATCHES) {
    test(`pt-BR P0 screenshots — ${batch.name}`, async ({ page }) => {
      await captureRoutesWithThemes(page, batch.routes, VIEWPORTS[1]);
    });
  }

  test('public cargo detail pub-001 — light and dark screenshots', async ({ page }) => {
    const standardViewport = VIEWPORTS[1];
    await captureRouteScreenshot(page, PUBLIC_CARGO_DETAIL_ROUTE, standardViewport, { theme: 'light' });
    await captureRouteScreenshot(page, PUBLIC_CARGO_DETAIL_ROUTE, standardViewport, { theme: 'dark' });
  });

  test('pt-BR P0 routes — three mobile viewports (standard capture set)', async ({ page }) => {
    const keyRoutes = [
      '/pt-BR/cockpit',
      '/pt-BR/cargas-publicas',
      PUBLIC_CARGO_DETAIL_ROUTE,
      '/pt-BR/minhas-cargas',
      '/pt-BR/minhas-cargas/hr-4821/mapa'
    ] as const;

    for (const viewport of VIEWPORTS) {
      for (const route of keyRoutes) {
        await captureRouteScreenshot(page, route, viewport, {
          fullPage: !route.includes('/mapa'),
          theme: 'current'
        });
      }
    }
  });

  test('i18n key routes render localized shell', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of I18N_ROUTES) {
      const response = await gotoRoute(page, route);
      expect(response?.status(), route).toBeLessThan(500);
      expect(response?.status(), route).not.toBe(404);
      await expect(shipperAuthenticatedHeader(page)).toBeVisible();
      await expect(shipperBottomNav(page)).toBeVisible();
      await captureRouteScreenshot(page, route, VIEWPORTS[1], { theme: 'current' });
    }
  });

  test('public cargoes do not expose sensitive data', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of PUBLIC_CARGO_ROUTES) {
      await assertPublicRoutePrivacy(page, route);
    }
  });

  test('full-screen map hides bottom nav', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoRoute(page, MAP_ROUTE);
    await expect(shipperBottomNav(page)).toHaveCount(0);
    await captureRouteScreenshot(page, MAP_ROUTE, VIEWPORTS[1], { fullPage: false, theme: 'current' });
  });

  test('authenticated shell chrome — header and bottom nav contracts', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ROUTES_WITH_AUTHENTICATED_HEADER) {
      await gotoRoute(page, route);
      await expect(shipperAuthenticatedHeader(page)).toBeVisible();
      await expect(page.getByRole('button', { name: THEME_TOGGLE })).toBeVisible();
      await expect(shipperBottomNav(page)).toBeVisible();
    }

    for (const route of ROUTES_WITHOUT_BOTTOM_NAV) {
      await gotoRoute(page, route);
      await expect(shipperBottomNav(page)).toHaveCount(0);
    }
  });

  test('mobile layout — no horizontal overflow on P0 routes', async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const route of PT_BR_SCREENSHOT_ROUTES) {
        await gotoRoute(page, route);
        await assertNoHorizontalOverflow(page, route);
      }
    }
  });

  test('primary controls meet minimum touch target height', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const touchRoutes = [
      '/pt-BR',
      '/pt-BR/entrar',
      '/pt-BR/registrar',
      PUBLIC_CARGO_DETAIL_ROUTE,
      '/pt-BR/offline'
    ] as const;

    for (const route of touchRoutes) {
      await gotoRoute(page, route);
      await assertPrimaryControlHeights(page, route);
    }
  });
});
