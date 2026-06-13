#!/usr/bin/env node
/**
 * Fase F — QA visual oficial minhas-cargas (3 devices, panels, screenshots).
 *
 * Pré-requisito: dev server com mock QA (ex. HYDRORIVERS_FORCE_MOCK_QA_UI=true).
 *   BASE_URL=http://127.0.0.1:3000 node scripts/minhas-cargas-phase-f-qa.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'output');
const baseUrl = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** Presets nomeados Playwright (validação oficial). */
const DEVICE_TIERS = [
  {
    tier: 'compact',
    preset: 'iPhone SE',
    screenshot: 'minhas-cargas-phase-f-360x740.png',
    fallbackViewport: { width: 360, height: 740 },
  },
  {
    tier: 'standard',
    preset: 'iPhone 14',
    screenshot: 'minhas-cargas-phase-f-390x844.png',
    fallbackViewport: { width: 390, height: 844 },
  },
  {
    tier: 'large',
    preset: 'iPhone 14 Pro Max',
    screenshot: 'minhas-cargas-phase-f-430x932.png',
    fallbackViewport: { width: 430, height: 932 },
  },
];

const PANELS = ['map', 'timeline', 'documents', 'risks'];

const results = {
  baseUrl,
  devices: [],
  cargoId: null,
  checks: {},
  failures: [],
  warnings: [],
};

function fail(key, message) {
  results.failures.push({ key, message });
  console.error(`FAIL [${key}] ${message}`);
}

function warn(key, message) {
  results.warnings.push({ key, message });
  console.warn(`WARN [${key}] ${message}`);
}

function pass(key) {
  results.checks[key] = 'pass';
  console.log(`PASS [${key}]`);
}

async function loginAsShipper(page) {
  const res = await page.request.post(`${baseUrl}/api/mock-mode/login-as`, {
    data: { userId: 'u-shipper-1' },
  });
  if (!res.ok()) {
    throw new Error(`login-as failed: ${res.status()} ${await res.text()}`);
  }
}

async function assertBottomNavNotCovering(page, selector, label) {
  const overlap = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const nav =
      document.querySelector('[data-bottom-nav-global="true"]') ??
      document.querySelector('[data-testid="bottom-nav"]');
    if (!el || !nav) return { ok: true, reason: 'missing-element' };
    const elRect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const covered = elRect.bottom > navRect.top + 4;
    return {
      ok: !covered,
      elBottom: elRect.bottom,
      navTop: navRect.top,
      gap: navRect.top - elRect.bottom,
    };
  }, selector);

  if (overlap.reason === 'missing-element') {
    warn(`${label}-overlap`, `Elemento ou BottomNav não encontrado para ${selector}`);
    return;
  }
  if (!overlap.ok) {
    fail(`${label}-overlap`, `Conteúdo coberto pelo BottomNav (gap=${overlap.gap}px, selector=${selector})`);
  } else {
    pass(`${label}-overlap`);
  }
}

async function runTier(deviceConfig) {
  const preset = devices[deviceConfig.preset];
  const usingPreset = Boolean(preset);
  const contextOptions = usingPreset
    ? { ...preset }
    : {
        viewport: deviceConfig.fallbackViewport,
        userAgent: 'PhaseF-manual-viewport',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      };

  const tierResult = {
    tier: deviceConfig.tier,
    preset: deviceConfig.preset,
    mode: usingPreset ? 'device preset nomeado' : 'viewport manual',
    viewport: usingPreset
      ? { width: preset.viewport.width, height: preset.viewport.height }
      : deviceConfig.fallbackViewport,
    screenshot: deviceConfig.screenshot,
  };

  console.log(`\n=== ${deviceConfig.tier.toUpperCase()} (${tierResult.mode}: ${deviceConfig.preset}) ===`);

  const browser = await chromium.launch();
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  try {
    // 1. /cargas — regressão
    await page.goto(`${baseUrl}/pt-BR/cargas`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    const cargasHasPrivate = await page.getByTestId('owned-cargo-card').count();
    const cargasHasMinhasGrid = await page.getByTestId('minhas-cargas-grid').count();
    if (cargasHasPrivate > 0) fail(`${deviceConfig.tier}-cargas-private`, 'Card privado em /cargas');
    else pass(`${deviceConfig.tier}-cargas-no-private`);
    if (cargasHasMinhasGrid > 0) fail(`${deviceConfig.tier}-cargas-grid`, 'Grid minhas-cargas em /cargas');
    else pass(`${deviceConfig.tier}-cargas-clean`);
    const bottomNavCargas = await page
      .locator('[data-bottom-nav-global="true"]')
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (!bottomNavCargas) warn(`${deviceConfig.tier}-cargas-nav`, 'BottomNav não visível em /cargas');
    else pass(`${deviceConfig.tier}-cargas-nav`);

    // 2. Login + lista minhas-cargas
    await loginAsShipper(page);
    await page.goto(`${baseUrl}/pt-BR/minhas-cargas`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForSelector('[data-testid="minhas-cargas-grid"]', { timeout: 30_000 });

    const headerTitle = await page.locator('[data-mobile-page-title="true"]').first().innerText();
    if (/dashboard/i.test(headerTitle) && !/minhas cargas/i.test(headerTitle)) {
      fail(`${deviceConfig.tier}-header`, `Header incorreto: "${headerTitle}"`);
    } else {
      pass(`${deviceConfig.tier}-header`);
    }

    await page.waitForSelector('[data-testid="minhas-cargas-summary"]', { timeout: 10_000 });
    pass(`${deviceConfig.tier}-summary`);

    const cardCount = await page.getByTestId('owned-cargo-card').count();
    if (cardCount === 0) fail(`${deviceConfig.tier}-cards`, 'Nenhum owned-cargo-card na lista');
    else pass(`${deviceConfig.tier}-cards`);

    const lastCard = page.getByTestId('owned-cargo-card').last();
    await lastCard.scrollIntoViewIfNeeded();
    await assertBottomNavNotCovering(page, '[data-testid="owned-cargo-card"]:last-of-type', `${deviceConfig.tier}-list-last-card`);

    // Detalhe: checar ações no fim do scroll (root inteiro é mais alto que o viewport)
    const checkDetailBottomClear = async () => {
      await page.evaluate(() => {
        const scroller = document.querySelector('.hr-dashboard-scroll') ?? document.documentElement;
        scroller.scrollTop = scroller.scrollHeight;
      });
      await page.waitForTimeout(200);
      await assertBottomNavNotCovering(
        page,
        '[data-testid="owned-cargo-detail"] [data-action], [data-testid="owned-cargo-detail"] [data-testid="owned-cargo-support-cards"]',
        `${deviceConfig.tier}-detail-bottom`,
      );
    };

    // Screenshot lista (standard tier only for official output name — all tiers save)
    await page.screenshot({ path: join(outDir, deviceConfig.screenshot), fullPage: true });
    console.log(`Screenshot: output/${deviceConfig.screenshot}`);

    // 3. Detalhe via clique no card
    const firstCard = page.getByTestId('owned-cargo-card').first();
    const cargoId = await firstCard.getAttribute('data-owned-cargo-id');
    if (!cargoId) {
      const href = await firstCard.locator('a').first().getAttribute('href');
      const match = href?.match(/minhas-cargas\/([^/?#]+)/);
      results.cargoId = match?.[1] ?? null;
    } else {
      results.cargoId = cargoId;
    }

    await firstCard.click();
    await page.waitForURL(/\/pt-BR\/minhas-cargas\//, { timeout: 15_000 });
    const detailUrl = page.url();
    const idFromUrl = detailUrl.match(/minhas-cargas\/([^/?#]+)/)?.[1];
    if (idFromUrl) results.cargoId = idFromUrl;

    if (page.url().includes('/404') || (await page.locator('h1').filter({ hasText: /404|não encontr/i }).count()) > 0) {
      fail(`${deviceConfig.tier}-detail-404`, 'Detalhe retornou 404');
    } else {
      pass(`${deviceConfig.tier}-detail-no-404`);
    }

    await page.waitForSelector('[data-testid="owned-cargo-detail"]', { timeout: 20_000 });
    pass(`${deviceConfig.tier}-cockpit`);

    for (const testId of ['owned-cargo-status-card', 'owned-cargo-support-cards']) {
      if ((await page.getByTestId(testId).count()) === 0) fail(`${deviceConfig.tier}-${testId}`, 'Ausente no cockpit');
      else pass(`${deviceConfig.tier}-${testId}`);
    }

    for (const panel of PANELS) {
      if ((await page.getByTestId(`owned-cargo-preview-${panel}`).count()) === 0) {
        fail(`${deviceConfig.tier}-preview-${panel}`, 'Preview card ausente');
      } else {
        pass(`${deviceConfig.tier}-preview-${panel}`);
      }
    }

    await checkDetailBottomClear();

    // 4. Panels por click
    for (const panel of PANELS) {
      const preview = page.getByTestId(`owned-cargo-preview-${panel}`);
      await preview.scrollIntoViewIfNeeded();
      await preview.click();
      await page.waitForURL(new RegExp(`panel=${panel}`), { timeout: 10_000 });
      pass(`${deviceConfig.tier}-click-panel-${panel}-url`);

      const sheet = page.getByTestId('bottom-sheet-panel');
      await sheet.waitFor({ state: 'visible', timeout: 10_000 });
      pass(`${deviceConfig.tier}-click-panel-${panel}-sheet`);

      const closeBtn = page.locator('[data-bottom-sheet-close="true"]').first();
      await closeBtn.click();
      await page.waitForFunction(() => !window.location.search.includes('panel='), null, { timeout: 10_000 });
      pass(`${deviceConfig.tier}-click-panel-${panel}-close`);
    }

    // 5. Back button (open map, goBack closes panel)
    await page.getByTestId('owned-cargo-preview-map').click();
    await page.waitForURL(/panel=map/, { timeout: 10_000 });
    await page.goBack();
    await page.waitForFunction(() => !window.location.search.includes('panel='), null, { timeout: 10_000 });
    if (!page.url().includes('/minhas-cargas/')) {
      fail(`${deviceConfig.tier}-back-button`, 'Back saiu do detalhe em vez de fechar panel');
    } else {
      pass(`${deviceConfig.tier}-back-button`);
    }

    // 6. Panels por URL direta (todos os 4 panels em cada device)
    const directPanels = PANELS;
    for (const panel of directPanels) {
      const id = results.cargoId ?? idFromUrl;
      await page.goto(`${baseUrl}/pt-BR/minhas-cargas/${id}?panel=${panel}`, {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });
      await page.waitForSelector('[data-testid="owned-cargo-detail"]', { timeout: 20_000 });
      await page.getByTestId('bottom-sheet-panel').waitFor({ state: 'visible', timeout: 10_000 });
      pass(`${deviceConfig.tier}-direct-panel-${panel}`);

      await page.locator('[data-bottom-sheet-close="true"]').first().click();
      await page.waitForFunction(() => !window.location.search.includes('panel='), null, { timeout: 10_000 });
      await page.waitForSelector('[data-testid="owned-cargo-detail"]', { timeout: 10_000 });
      pass(`${deviceConfig.tier}-direct-panel-${panel}-close`);
    }

    // 7. Panel inválido
    const id = results.cargoId ?? idFromUrl;
    await page.goto(`${baseUrl}/pt-BR/minhas-cargas/${id}?panel=banana&scope=active`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.waitForSelector('[data-testid="owned-cargo-detail"]', { timeout: 20_000 });
    await page.waitForTimeout(800);
    const finalUrl = page.url();
    if (finalUrl.includes('panel=banana')) {
      fail(`${deviceConfig.tier}-invalid-panel`, 'panel=banana não foi removido');
    } else {
      pass(`${deviceConfig.tier}-invalid-panel-removed`);
    }
    if (!finalUrl.includes('scope=active')) {
      fail(`${deviceConfig.tier}-invalid-panel-scope`, 'scope=active não preservado');
    } else {
      pass(`${deviceConfig.tier}-invalid-panel-scope`);
    }
    if ((await page.getByTestId('bottom-sheet-panel').isVisible().catch(() => false))) {
      fail(`${deviceConfig.tier}-invalid-panel-sheet`, 'Sheet aberto com panel inválido');
    } else {
      pass(`${deviceConfig.tier}-invalid-panel-no-sheet`);
    }

    tierResult.status = results.failures.filter((f) => f.key.startsWith(deviceConfig.tier)).length === 0 ? 'pass' : 'fail';
  } catch (error) {
    tierResult.status = 'error';
    tierResult.error = error instanceof Error ? error.message : String(error);
    fail(`${deviceConfig.tier}-runtime`, tierResult.error);
  } finally {
    await browser.close();
    results.devices.push(tierResult);
  }
}

await mkdir(outDir, { recursive: true });

console.log(`Base URL: ${baseUrl}\nFase F QA — minhas-cargas\n`);

for (const device of DEVICE_TIERS) {
  await runTier(device);
}

const reportPath = join(outDir, 'minhas-cargas-phase-f-report.json');
await writeFile(reportPath, JSON.stringify(results, null, 2));
console.log(`\nRelatório: ${reportPath}`);
console.log(`Falhas: ${results.failures.length}, Avisos: ${results.warnings.length}`);
console.log(`Cargo ID testado: ${results.cargoId ?? 'unknown'}`);

process.exit(results.failures.length > 0 ? 1 : 0);
