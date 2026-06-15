#!/usr/bin/env node
/**
 * QA — lista premium mobile /minhas-cargas (busca, filtros, card, regressão /cargas).
 * BASE_URL=http://localhost:3000 node scripts/minhas-cargas-list-premium-qa.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'output');
const baseUrl = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const DEVICE_TIERS = [
  { tier: 'compact', preset: 'iPhone SE', screenshot: 'minhas-cargas-list-premium-360x740.png' },
  { tier: 'standard', preset: 'iPhone 14', screenshot: 'minhas-cargas-list-premium-390x844.png' },
  { tier: 'large', preset: 'iPhone 14 Pro Max', screenshot: 'minhas-cargas-list-premium-430x932.png' },
];

const report = { baseUrl, devices: [], checks: {}, failures: [], warnings: [] };

function fail(key, message) {
  report.failures.push({ key, message });
  console.error(`FAIL [${key}] ${message}`);
}

function pass(key) {
  report.checks[key] = 'pass';
  console.log(`PASS [${key}]`);
}

async function loginAsShipper(page) {
  const res = await page.request.post(`${baseUrl}/api/mock-mode/login-as`, {
    data: { userId: 'u-shipper-1' },
  });
  if (!res.ok()) throw new Error(`login-as failed: ${res.status()}`);
}

async function run() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const deviceConfig of DEVICE_TIERS) {
    const preset = devices[deviceConfig.preset];
    const context = await browser.newContext({ ...preset });
    const page = await context.newPage();

    try {
      await loginAsShipper(page);

      await page.goto(`${baseUrl}/pt-BR/minhas-cargas`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForSelector('[data-testid="minhas-cargas-grid"]', { timeout: 30_000 });

      await page.waitForSelector('[data-testid="owned-cargo-card"]', { timeout: 20_000 });
      const firstCardId = await page.getByTestId('owned-cargo-card').first().getAttribute('data-owned-cargo-id');
      if (!firstCardId) fail(`${deviceConfig.tier}-card-id`, 'Card sem data-owned-cargo-id');
      else pass(`${deviceConfig.tier}-card-id`);

      const search = page.getByTestId('minhas-cargas-search').locator('input[type="search"]');
      if ((await search.count()) === 0) fail(`${deviceConfig.tier}-search`, 'Search bar ausente');
      else pass(`${deviceConfig.tier}-search`);

      await search.fill('');
      await search.pressSequentially(firstCardId.slice(-3), { delay: 20 });
      try {
        await page.waitForFunction(
          (expectedId) => document.querySelectorAll(`[data-owned-cargo-id="${expectedId}"]`).length === 1,
          firstCardId,
          { timeout: 5000 },
        );
        pass(`${deviceConfig.tier}-search-filter`);
      } catch {
        fail(`${deviceConfig.tier}-search-filter`, `Busca não isolou ${firstCardId}`);
      }

      const clearBtn = page.getByTestId('minhas-cargas-clear-filters');
      if ((await clearBtn.count()) === 0) fail(`${deviceConfig.tier}-clear-visible`, 'Limpar filtros não aparece com busca ativa');
      else pass(`${deviceConfig.tier}-clear-visible`);

      await clearBtn.click();
      await page.waitForTimeout(250);
      if ((await page.getByTestId('minhas-cargas-clear-filters').count()) > 0) {
        fail(`${deviceConfig.tier}-clear-reset`, 'Limpar filtros permanece após reset');
      } else pass(`${deviceConfig.tier}-clear-reset`);

      await page.getByTestId('minhas-cargas-filter-risk').click();
      await page.waitForTimeout(250);
      const riskCount = await page.getByTestId('owned-cargo-card').count();
      if (riskCount < 1) fail(`${deviceConfig.tier}-risk-filter`, 'Filtro Risco sem resultados');
      else pass(`${deviceConfig.tier}-risk-filter`);

      await page.getByTestId('minhas-cargas-clear-filters').click();
      await page.getByTestId('minhas-cargas-filter-all').click();

      const firstCard = page.getByTestId('owned-cargo-card').first();
      await firstCard.click();
      await page.waitForURL(/\/pt-BR\/minhas-cargas\//, { timeout: 15_000 });
      pass(`${deviceConfig.tier}-detail-nav`);

      await page.goto(`${baseUrl}/pt-BR/cargas`, { waitUntil: 'domcontentloaded' });
      const ownedOnPublic = await page.getByTestId('owned-cargo-card').count();
      const minhasGridOnPublic = await page.getByTestId('minhas-cargas-grid').count();
      if (ownedOnPublic > 0 || minhasGridOnPublic > 0) {
        fail(`${deviceConfig.tier}-cargas-regression`, 'Marketplace /cargas expõe lista privada');
      } else pass(`${deviceConfig.tier}-cargas-regression`);

      await page.goto(`${baseUrl}/pt-BR/dashboard`, { waitUntil: 'domcontentloaded' });
      const shellRoot = await page.locator('.root, [data-product-shell="true"], main').count();
      if (shellRoot === 0) fail(`${deviceConfig.tier}-dashboard-shell`, 'Shell do dashboard ausente');
      else pass(`${deviceConfig.tier}-dashboard-shell`);

      await page.goto(`${baseUrl}/pt-BR/minhas-cargas`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-testid="owned-cargo-card"]', { timeout: 20_000 });
      const screenshotPath = join(outDir, deviceConfig.screenshot);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      report.devices.push({ tier: deviceConfig.tier, screenshot: deviceConfig.screenshot, status: 'pass' });
      console.log(`Screenshot: ${screenshotPath}`);
    } catch (error) {
      fail(`${deviceConfig.tier}-runtime`, error instanceof Error ? error.message : String(error));
    } finally {
      await context.close();
    }
  }

  await browser.close();
  await writeFile(join(outDir, 'minhas-cargas-list-premium-report.json'), `${JSON.stringify(report, null, 2)}\n`);

  if (report.failures.length > 0) {
    console.error(`\n${report.failures.length} failure(s)`);
    process.exit(1);
  }

  console.log('\nAll list premium QA checks passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
