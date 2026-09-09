import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const evidenceRoot = path.resolve('reports/portfolio-visual-evidence');
const themes = ['light', 'dark'] as const;
const locales = ['pt-BR', 'en-US', 'es'] as const;

async function setTheme(page: Page, theme: (typeof themes)[number]) {
  await page.context().addCookies([{ name: 'hydrorivers.theme', value: theme, domain: '127.0.0.1', path: '/' }]);
}

async function authenticateShipper(page: Page) {
  const adminLogin = await page.request.post('/api/mock-mode/login-as', { data: { userId: 'u-admin-1' } });
  expect(adminLogin.status()).toBe(200);
  const reset = await page.request.post('/api/mock-mode', { data: { scenario: 'in-transit' } });
  expect(reset.status()).toBe(200);
  const shipperLogin = await page.request.post('/api/mock-mode/login-as', { data: { userId: 'u-shipper-1' } });
  expect(shipperLogin.status()).toBe(200);
}

async function openPrivateRoute(page: Page, route: string, theme: (typeof themes)[number]) {
  await setTheme(page, theme);
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(page.locator('body')).toBeVisible();
}

async function assertVisualIntegrity(page: Page, route: string) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    headings: document.querySelectorAll('h1, h2, h3').length,
    unnamedControls: Array.from(document.querySelectorAll('button, a')).filter((node) => {
      const element = node as HTMLElement;
      return !(element.innerText.trim() || element.getAttribute('aria-label') || element.getAttribute('title'));
    }).length,
  }));
  expect(metrics.scrollWidth, `${route} has horizontal overflow`).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.headings, `${route} needs a visible hierarchy`).toBeGreaterThan(0);
  expect(metrics.unnamedControls, `${route} exposes unnamed controls`).toBe(0);
}

async function capture(page: Page, testInfo: TestInfo, name: string, fullPage = false) {
  const directory = path.join(evidenceRoot, testInfo.project.name);
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: path.join(directory, `${name}.png`),
    fullPage,
    animations: 'disabled',
    caret: 'hide',
  });
}

test.describe('Portfolio-ready visual proof — Embarcadora', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await authenticateShipper(page);
  });

  test('first access enters the Embarcadora demo from the canonical root', async ({ page }, testInfo) => {
    await page.context().clearCookies();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/pt-BR$/);
    await expect(page.getByRole('heading', { name: 'HydroRivers' })).toBeVisible();
    await assertVisualIntegrity(page, '/');
    await capture(page, testInfo, 'portfolio-entry-light');

    await page.getByRole('button', { name: /explorar demonstração/i }).click();
    await expect(page).toHaveURL(/\/pt-BR\/minhas-cargas$/);
    await expect(page.getByRole('heading', { name: /minhas cargas/i }).first()).toBeVisible();
  });

  test('entry and unauthenticated redirect remain demonstrable', async ({ page }, testInfo) => {
    await page.context().clearCookies();
    await page.goto('/pt-BR/minhas-cargas', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/pt-BR\/entrar\?next=/);
    await assertVisualIntegrity(page, '/pt-BR/entrar');
    await capture(page, testInfo, 'login-redirect-light');
  });

  test('core journey renders in light and dark without overflow', async ({ page }, testInfo) => {
    const routes = [
      { key: 'cargo-list', path: '/pt-BR/minhas-cargas', fullPage: false },
      { key: 'cargo-detail', path: '/pt-BR/minhas-cargas/cargo-001', fullPage: false },
      { key: 'cargo-map', path: '/pt-BR/minhas-cargas/cargo-001/mapa', fullPage: false },
      { key: 'cargo-documents', path: '/pt-BR/minhas-cargas/cargo-001/documentos', fullPage: false },
      { key: 'cargo-negotiation', path: '/pt-BR/minhas-cargas/cargo-001/negociacao', fullPage: false },
    ];

    for (const theme of themes) {
      for (const route of routes) {
        await openPrivateRoute(page, route.path, theme);
        await assertVisualIntegrity(page, route.path);
        await capture(page, testInfo, `${route.key}-${theme}`, route.fullPage);
      }
    }
  });

  test('localized cargo screens remain readable in pt-BR, en-US and es', async ({ page }, testInfo) => {
    for (const locale of locales) {
      for (const theme of themes) {
        const listRoute = `/${locale}/minhas-cargas`;
        await openPrivateRoute(page, listRoute, theme);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await assertVisualIntegrity(page, listRoute);
        await capture(page, testInfo, `cargo-list-${locale}-${theme}`);

        const detailRoute = `/${locale}/minhas-cargas/cargo-001`;
        await openPrivateRoute(page, detailRoute, theme);
        await assertVisualIntegrity(page, detailRoute);
        await capture(page, testInfo, `cargo-detail-${locale}-${theme}`);
      }
    }
  });

  test('stable recruiter-facing screens match reviewed baselines', async ({ page }, testInfo) => {
    test.skip(!['desktop-1440', 'mobile-390'].includes(testInfo.project.name), 'Stable baseline viewports');

    for (const theme of themes) {
      await openPrivateRoute(page, '/pt-BR/minhas-cargas', theme);
      await expect(page).toHaveScreenshot(`cargo-list-${theme}.png`, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.005,
      });

      await openPrivateRoute(page, '/pt-BR/minhas-cargas/cargo-001', theme);
      await expect(page).toHaveScreenshot(`cargo-detail-${theme}.png`, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.005,
      });
    }

    await openPrivateRoute(page, '/es/minhas-cargas/cargo-001', 'light');
    await expect(page).toHaveScreenshot('cargo-detail-es-light.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.005,
    });
  });

  test('filters, risk, timeline, documents and feedback form a real action journey', async ({ page }, testInfo) => {
    test.skip(!['desktop-1440', 'mobile-390'].includes(testInfo.project.name), 'Representative interaction viewports');
    await openPrivateRoute(page, '/pt-BR/minhas-cargas', 'light');

    await page.getByRole('button', { name: /filtros/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await capture(page, testInfo, 'filters-open-light');
    await page.getByRole('button', { name: /em trânsito/i }).last().click();
    await page.getByRole('button', { name: /aplicar/i }).click();
    await assertVisualIntegrity(page, '/pt-BR/minhas-cargas?filter=attention');
    await capture(page, testInfo, 'filters-applied-light');

    await page.goto('/pt-BR/minhas-cargas/cargo-001', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('article h2').first()).toBeVisible();
    const timeline = page.getByRole('region', { name: /timeline/i });
    await expect(timeline).toBeVisible();
    await timeline.scrollIntoViewIfNeeded();
    await capture(page, testInfo, 'risk-timeline-light');

    await page.getByRole('link', { name: /document/i }).click();
    await expect(page.getByRole('button', { name: /resolver/i })).toBeVisible();
    await capture(page, testInfo, 'documents-blocked-light');
    await page.getByRole('button', { name: /resolver/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await capture(page, testInfo, 'documents-confirmation-light');
    await page.getByRole('button', { name: /confirmar|resolver/i }).last().click();
    await expect(page.getByRole('button', { name: /resolver/i })).toHaveCount(0);
    await capture(page, testInfo, 'documents-resolved-light');
  });
});
