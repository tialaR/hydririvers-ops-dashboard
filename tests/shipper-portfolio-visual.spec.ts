import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loginWithOtp } from './e2e/support/auth';

const evidenceRoot = path.resolve('reports/portfolio-visual-evidence');
const themes = ['light', 'dark'] as const;
const locales = ['pt-BR', 'en-US', 'es'] as const;

async function setTheme(page: Page, theme: (typeof themes)[number]) {
  await page.context().addCookies([{ name: 'hydrorivers.theme', value: theme, domain: '127.0.0.1', path: '/' }]);
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

async function capture(page: Page, testInfo: TestInfo, name: string, fullPage = true) {
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
    await loginWithOtp(page);
  });

  test('core journey renders in light and dark without overflow', async ({ page }, testInfo) => {
    const routes = [
      { key: 'cargo-list', path: '/pt-BR/minhas-cargas', fullPage: true },
      { key: 'cargo-detail', path: '/pt-BR/minhas-cargas/cargo-001', fullPage: true },
      { key: 'cargo-map', path: '/pt-BR/minhas-cargas/cargo-001/mapa', fullPage: false },
      { key: 'cargo-documents', path: '/pt-BR/minhas-cargas/cargo-001/documentos', fullPage: true },
      { key: 'cargo-negotiation', path: '/pt-BR/minhas-cargas/cargo-001/negociacao', fullPage: true },
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

  test('filters, risk, timeline, documents and feedback form a real action journey', async ({ page }, testInfo) => {
    test.skip(!['desktop-1440', 'mobile-390'].includes(testInfo.project.name), 'Representative interaction viewports');
    await openPrivateRoute(page, '/pt-BR/minhas-cargas', 'light');

    await page.getByRole('button', { name: /filtros/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await capture(page, testInfo, 'filters-open-light');
    await page.getByRole('button', { name: /atenção/i }).last().click();
    await page.getByRole('button', { name: /aplicar/i }).click();
    await assertVisualIntegrity(page, '/pt-BR/minhas-cargas?filter=attention');
    await capture(page, testInfo, 'filters-applied-light');

    await page.goto('/pt-BR/minhas-cargas/cargo-001', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /atenção/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /linha do tempo/i })).toBeVisible();
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
