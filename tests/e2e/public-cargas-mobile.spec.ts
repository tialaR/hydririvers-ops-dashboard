import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

import { resetMockScenarioThenLogin } from './support/cargo-context';
import { expectMobileHeaderCompact, scrollMobileProductShell } from './support/mobile-header-scroll';

const shipper = { email: 'tiala@hydrorivers.com', password: 'hydro123' } as const;

/** iPhone 14 Pro Max logical viewport */
const MOBILE_VIEWPORT = { width: 430, height: 932 } as const;

const FATAL_CONSOLE_PATTERNS = [/MISSING_MESSAGE/i, /hydration/i, /React/i] as const;

const LEGACY_DESKTOP_LAYER = '[data-legacy-cargo-list="true"]';

function attachPublicMobileConsoleGuard(page: Page) {
  const consoleErrors: string[] = [];

  const onConsole = (message: ConsoleMessage) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();

    if (FATAL_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) {
      consoleErrors.push(text);
    }
  };

  page.on('console', onConsole);

  return {
    assertClean: () => {
      expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
    },
    detach: () => {
      page.off('console', onConsole);
    },
  };
}

async function gotoPublicCargasMobile(page: Page) {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto('/pt-BR/cargas', { waitUntil: 'domcontentloaded' });
}

async function readBottomNavViewportBox(page: Page) {
  const bottomNav = page.locator('[data-mobile-product-bottom-nav="true"] nav');
  await expect(bottomNav).toBeVisible();
  const box = await bottomNav.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

test.describe('Cargas público mobile — bottom sheet unificado', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }) => {
    /** Mock panel exige viewport desktop; mobile entra após login/cenário. */
    await page.setViewportSize({ width: 1000, height: 800 });
    await resetMockScenarioThenLogin(page, 'market-active', shipper);
  });

  test('mobile shell DS v2: header Cargas, filtro único, brand limpa e actions uniformes', async ({ page }) => {
    await gotoPublicCargasMobile(page);

    const scrollStage = page.locator('.hr-dashboard-scroll[data-mobile-shell-background="true"]');
    const header = page.locator('[data-mobile-product-shell="true"][data-mobile-header-glass="true"]');
    const mobileList = page.locator('[data-public-cargas-mobile="true"]');
    await expect(scrollStage).toBeVisible();
    await expect(header).toBeVisible();
    await expect(header).toHaveAttribute('data-theme', 'light');
    await expect(header.getByText('HydroRivers')).toBeVisible();
    await expect(page.locator('[data-mobile-page-title="true"]')).toHaveText('Cargas');
    await expect(header.locator('.hx-mobile-title')).toHaveCount(0);
    await expect(mobileList).toHaveAttribute('data-public-cargas-mobile-page-background', 'none');
    await expect(mobileList.getByText('Lista de cargas', { exact: true })).toHaveCount(0);
    await expect(mobileList.locator('[data-mobile-cargas-filter-button="true"]')).toHaveCount(1);

    const actionButtons = header.locator('[data-mobile-header-actions="true"] [data-icon-button-global="true"]');
    await expect(actionButtons).toHaveCount(3);

    const sizes = await actionButtons.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
    );
    const widths = sizes.map((size) => size.width);
    const heights = sizes.map((size) => size.height);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(4);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(4);
  });

  test('search, lista e sheet público light fixo na viewport', async ({ page }) => {
    await gotoPublicCargasMobile(page);
    const consoleGuard = attachPublicMobileConsoleGuard(page);

    try {
      await expect(page.locator('[data-public-cargas-mobile="true"]')).toBeVisible();

      const search = page.getByPlaceholder('Buscar cargas...');
      await expect(search).toBeVisible();

      await expect(page.locator('.statusScroller')).toHaveCount(0);

      const bottomNav = page.locator('[data-mobile-product-bottom-nav="true"] nav');
      await expect(bottomNav).toBeVisible();
      const navZIndex = await bottomNav.evaluate((element) =>
        Number.parseInt(window.getComputedStyle(element).zIndex, 10),
      );

      const firstCard = page
        .locator('[data-public-cargas-mobile="true"] article[data-cargo-id]')
        .first();
      await expect(firstCard).toBeVisible();
      await firstCard.click();

      const overlay = page.locator('[data-bottom-sheet-root="true"][data-variant="light"]');
      const sheet = page.locator('[data-testid="bottom-sheet-panel"][data-variant="light"]');
      await expect(overlay).toBeVisible();
      await expect(sheet).toBeVisible();
      await expect(sheet).toHaveAttribute('data-public-cargo-action-sheet', 'true');
      await expect(sheet).toHaveAttribute('data-theme', 'light');

      const overlayPosition = await overlay.evaluate(
        (element) => window.getComputedStyle(element).position,
      );
      expect(overlayPosition).toBe('fixed');

      const sheetZIndex = await overlay.evaluate((element) =>
        Number.parseInt(window.getComputedStyle(element).zIndex, 10),
      );
      expect(sheetZIndex).toBeGreaterThan(navZIndex);

      const viewport = page.viewportSize();
      expect(viewport).not.toBeNull();
      const box = await sheet.boundingBox();
      expect(box).not.toBeNull();
      if (box && viewport) {
        expect(box.y + box.height).toBeGreaterThan(viewport.height * 0.55);
        expect(box.y).toBeLessThan(viewport.height * 0.85);
      }

      const actionLinks = sheet.locator('[data-public-cargo-action="true"]');
      const hrefs = await actionLinks.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('href') ?? ''),
      );
      expect(hrefs.every((href) => !href.includes('/pt-BR/pt-BR'))).toBe(true);

      await expect(page.getByRole('link', { name: /Detalhes da carga:/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Ver rota:/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Documentos da carga:/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Custos e valores:/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Prioridade e riscos:/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Abrir negociações:/i })).toBeVisible();

      await expect(page.getByText('Escolher visão da carga')).toHaveCount(0);
      await expect(page.locator('[data-variant="strong"][data-testid="bottom-sheet-panel"]')).toHaveCount(
        0,
      );

      consoleGuard.assertClean();
    } finally {
      consoleGuard.detach();
    }
  });

  test('bottom nav permanece fixo no rodapé da viewport ao rolar a lista', async ({ page }) => {
    await gotoPublicCargasMobile(page);

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    const bottomNav = page.locator('[data-mobile-product-bottom-nav="true"] nav');
    const boxBefore = await readBottomNavViewportBox(page);
    const navInListFlow = await page
      .locator('[data-public-cargas-mobile="true"]')
      .locator('[data-mobile-product-bottom-nav="true"]')
      .count();
    expect(navInListFlow).toBe(0);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(150);

    const boxAfter = await readBottomNavViewportBox(page);
    expect(Math.abs(boxBefore.y - boxAfter.y)).toBeLessThan(4);
    expect(boxAfter.y + boxAfter.height).toBeGreaterThan(viewport!.height - 120);
    expect(boxAfter.y + boxAfter.height).toBeLessThanOrEqual(viewport!.height + 4);

    const navPosition = await bottomNav.evaluate(
      (element) => window.getComputedStyle(element).position,
    );
    expect(navPosition).toBe('fixed');
  });

  test('desktop /pt-BR/cargas preserva lista legada e oculta camada pública mobile', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/pt-BR/cargas', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-legacy-cargo-list="true"]')).toBeVisible();
    await expect(page.locator('[data-public-cargas-mobile="true"]')).toBeHidden();
    await expect(page.locator('[data-mobile-product-shell="true"]')).toBeHidden();
  });

  test('/pt-BR/rastreio mantém shell mobile e rota acessível', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/pt-BR/rastreio', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-mobile-product-shell="true"]')).toBeVisible();
    await expect(page.locator('[data-mobile-page-title="true"]')).toHaveText('Rastreio');
  });

  test('shell mobile DS v2 persiste ao navegar Cargas → Negociações → Rastreio', async ({ page }) => {
    await gotoPublicCargasMobile(page);

    const header = page.locator('[data-mobile-product-shell="true"]');
    const pageTitle = page.locator('[data-mobile-page-title="true"]');
    const bottomNav = page.locator('[data-mobile-product-bottom-nav="true"] nav');

    await expect(header).toHaveAttribute('data-theme', 'light');
    await expect(pageTitle).toHaveText('Cargas');
    await expect(bottomNav).toBeVisible();
    await expect(page.locator('.hx-mobile-bottom-nav')).toHaveCount(0);
    await expect(page.getByText('Painel', { exact: true })).toHaveCount(0);

    await bottomNav.getByRole('button', { name: 'Negociações' }).click();
    await expect(page).toHaveURL(/\/pt-BR\/negociacoes$/);
    await expect(pageTitle).toHaveText('Negociações');
    await expect(header).toHaveAttribute('data-theme', 'light');
    await expect(bottomNav).toBeVisible();
    await expect(page.locator('.hx-mobile-bottom-nav')).toHaveCount(0);
    await expect(page.getByText('Painel', { exact: true })).toHaveCount(0);

    await bottomNav.getByRole('button', { name: 'Rastreio' }).click();
    await expect(page).toHaveURL(/\/pt-BR\/rastreio/);
    await expect(pageTitle).toHaveText('Rastreio');
    await expect(bottomNav).toBeVisible();
    await expect(page.locator('.hx-mobile-bottom-nav')).toHaveCount(0);
  });

  test('sem flash da lista legada no primeiro paint mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/pt-BR/cargas', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-public-cargas-mobile="true"]')).toBeVisible();

    const legacyLayer = page.locator(LEGACY_DESKTOP_LAYER);
    await expect(legacyLayer).toBeHidden();
    await expect(legacyLayer.locator('.hr-cargo-status-filters')).toBeHidden();
    await expect(legacyLayer.locator('.hx-cargo-list.hr-cargo-list-body')).toBeHidden();
    await expect(page.locator('.statusScroller')).toHaveCount(0);

    await expect(page.locator('.hx-mobile-bottom-nav')).toBeHidden();
  });

  test('filter sheet e action sheet compartilham casca BottomSheet light', async ({ page }) => {
    await gotoPublicCargasMobile(page);

    await page
      .locator('[data-public-cargas-mobile="true"]')
      .getByRole('button', { name: 'Filtrar cargas' })
      .first()
      .click();
    const filterOverlay = page.locator('[data-bottom-sheet-root="true"]').last();
    await expect(filterOverlay).toBeVisible();
    await expect(filterOverlay).toHaveAttribute('data-variant', 'light');
    await expect(filterOverlay).toHaveAttribute('data-viewport-anchor', 'flush');

    const filterSheet = page.locator('[data-testid="bottom-sheet-panel"]').last();
    await expect(filterSheet).toHaveAttribute('data-variant', 'light');
    const filterSnap = await filterSheet.getAttribute('data-snap');
    expect(filterSnap).toBeTruthy();

    await filterOverlay.click({ position: { x: 12, y: 12 } });
    await expect(filterOverlay).toBeHidden({ timeout: 5_000 });

    const firstCard = page
      .locator('[data-public-cargas-mobile="true"] article[data-cargo-id]')
      .first();
    await firstCard.click();

    const actionOverlay = page.locator('[data-bottom-sheet-root="true"]').last();
    await expect(actionOverlay).toBeVisible();
    await expect(actionOverlay).toHaveAttribute('data-variant', 'light');
    await expect(actionOverlay).toHaveAttribute('data-viewport-anchor', 'flush');

    const actionSheet = page.locator('[data-testid="bottom-sheet-panel"]').last();
    await expect(actionSheet).toHaveAttribute('data-variant', 'light');
    await expect(actionSheet).toHaveAttribute('data-public-cargo-action-sheet', 'true');
    expect(await actionSheet.getAttribute('data-snap')).toBe(filterSnap);
  });

  test('sheet abre em snap collapsed com overlay acima do bottom nav', async ({ page }) => {
    await gotoPublicCargasMobile(page);

    await page
      .locator('[data-public-cargas-mobile="true"]')
      .getByRole('button', { name: 'Filtrar cargas' })
      .first()
      .click();

    const overlay = page.locator('[data-bottom-sheet-root="true"]').last();
    const sheet = page.locator('[data-testid="bottom-sheet-panel"]').last();
    await expect(overlay).toBeVisible();
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('data-snap', 'collapsed');

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const sheetBox = await sheet.boundingBox();
    expect(sheetBox).not.toBeNull();
    if (sheetBox && viewport) {
      expect(sheetBox.height).toBeGreaterThan(viewport.height * 0.2);
    }

    const bottomNav = page.locator('[data-mobile-product-bottom-nav="true"] nav');
    await expect(bottomNav).toBeHidden();
  });

  test('CTA Ver rota navega direto; ação do sheet não reabre sheet admin', async ({ page }) => {
    await gotoPublicCargasMobile(page);
    const consoleGuard = attachPublicMobileConsoleGuard(page);

    try {
      const firstCard = page
        .locator('[data-public-cargas-mobile="true"] article[data-cargo-id]')
        .first();
      const cargoId = await firstCard.getAttribute('data-cargo-id');
      expect(cargoId).toBeTruthy();

      const routeCta = firstCard.locator('[data-cargo-primary-action="true"]');
      await expect(routeCta).toContainText('Ver detalhes');
      await routeCta.click();

      await expect(page).toHaveURL(new RegExp(`/pt-BR/cargas/${cargoId}/mapa`));
      await expect(page.locator('[data-testid="bottom-sheet-panel"]')).toHaveCount(0);

      await page.goto('/pt-BR/cargas');
      await expect(page.locator('[data-public-cargas-mobile="true"]')).toBeVisible();

      await firstCard.click();
      await expect(page.locator('[data-public-cargo-action-sheet="true"]')).toBeVisible();

      await page
        .locator(
          `[data-public-cargo-action-sheet="true"] a[href="/pt-BR/cargas/${cargoId}?view=documentos"]`,
        )
        .evaluate((element) => {
          (element as HTMLAnchorElement).click();
        });
      await expect(page).toHaveURL(new RegExp(`/pt-BR/cargas/${cargoId}\\?view=documentos`));
      await expect(page.getByText('Escolher visão da carga')).toHaveCount(0);
      await expect(page.locator('[data-variant="strong"][data-testid="bottom-sheet-panel"]')).toHaveCount(
        0,
      );

      consoleGuard.assertClean();
    } finally {
      consoleGuard.detach();
    }
  });

  test('Phase 5U: background global cobre viewport até o BottomNav com lista curta', async ({ page }) => {
    await gotoPublicCargasMobile(page);

    const shellRoot = page.locator('[data-mobile-product-v2-shell="true"][data-mobile-shell-background="root"]');
    const scrollStage = page.locator('.hr-dashboard-scroll[data-mobile-shell-background="true"][data-ds-v2-mobile-canvas="true"]');
    const mobileList = page.locator('[data-public-cargas-mobile="true"]');

    await expect(shellRoot).toBeVisible();
    await expect(scrollStage).toBeVisible();
    await expect(mobileList).toHaveAttribute('data-public-cargas-mobile-page-background', 'none');

    await mobileList.locator('[type="search"]').fill('zzzznomatchcargo');
    await expect(mobileList.locator('[data-mobile-content-results="true"]')).toContainText('0 resultados');

    const viewport = page.viewportSize();
    const [shellBackground, stageHeight] = await Promise.all([
      shellRoot.evaluate((element) => window.getComputedStyle(element).backgroundImage.includes('gradient')),
      scrollStage.evaluate((element) => element.getBoundingClientRect().height),
    ]);

    expect(shellBackground).toBe(true);
    expect(stageHeight).toBeGreaterThanOrEqual((viewport?.height ?? 0) - 8);
  });

  test('Phase 5U: empty state filtrado centralizado sem botão grande de limpar', async ({ page }) => {
    await gotoPublicCargasMobile(page);

    const mobileList = page.locator('[data-public-cargas-mobile="true"]');
    await mobileList.locator('[type="search"]').fill('zzzznomatchcargo');
    await expect(mobileList.locator('[data-mobile-content-results="true"]')).toContainText('0 resultados');

    const emptyState = mobileList.locator('[data-public-cargas-empty-state="true"][data-public-cargas-empty-variant="filtered"]');
    await expect(emptyState).toBeVisible();
    await expect(mobileList.locator('[data-mobile-clear-filters="true"]')).toHaveText('Limpar filtros');
    await expect(emptyState.getByRole('button', { name: 'Limpar filtros' })).toHaveCount(0);

    const emptyLayout = await emptyState.evaluate((element) => {
      const icon = element.querySelector('[data-public-cargas-empty-icon="true"]') as HTMLElement | null;
      const containerBox = element.getBoundingClientRect();
      const iconBox = icon?.getBoundingClientRect();
      const rootStyle = window.getComputedStyle(element);
      return {
        justifyItems: rootStyle.justifyItems,
        textAlign: rootStyle.textAlign,
        iconWidth: iconBox?.width ?? 0,
        iconCenterDelta:
          iconBox && containerBox.width
            ? Math.abs(iconBox.left + iconBox.width / 2 - (containerBox.left + containerBox.width / 2))
            : 999,
      };
    });

    expect(emptyLayout.justifyItems).toBe('center');
    expect(emptyLayout.textAlign).toBe('center');
    expect(emptyLayout.iconWidth).toBeGreaterThanOrEqual(48);
    expect(emptyLayout.iconCenterDelta).toBeLessThanOrEqual(6);

    await mobileList.locator('[data-mobile-clear-filters="true"]').click();
    await expect(mobileList.locator('[data-public-cargas-empty-state="true"]')).toHaveCount(0);
    await expect(mobileList.locator('article[data-cargo-id]').first()).toBeVisible();
  });

  test('header fixo global compacta título ao scroll da lista mobile', async ({ page }) => {
    await gotoPublicCargasMobile(page);

    const header = page.locator('[data-mobile-product-shell="true"][data-mobile-header-glass="true"]');
    await expect(page.locator('[data-public-cargas-mobile="true"] article[data-cargo-id]').first()).toBeVisible();
    await expectMobileHeaderCompact(page, false);

    const before = await header.evaluate((headerEl) => {
      const titleEl = headerEl.querySelector('[data-mobile-page-title="true"]')!;
      const titleStyle = window.getComputedStyle(titleEl);
      const headerBefore = window.getComputedStyle(headerEl, '::before');
      return {
        titleFontSize: Number.parseFloat(titleStyle.fontSize),
        frostOpacity: Number.parseFloat(headerBefore.opacity),
        backgroundImage: headerBefore.backgroundImage,
        backdropFilter: headerBefore.backdropFilter,
        headerPosition: window.getComputedStyle(headerEl).position,
      };
    });

    expect(before.titleFontSize).toBeGreaterThan(28);
    expect(before.frostOpacity).toBeGreaterThan(0.2);
    expect(before.backgroundImage).not.toBe('none');
    expect(before.backdropFilter).not.toBe('none');
    expect(before.headerPosition).toBe('fixed');

    await scrollMobileProductShell(page, 120);
    await expectMobileHeaderCompact(page, true);

    const after = await header.evaluate((headerEl) => {
      const titleEl = headerEl.querySelector('[data-mobile-page-title="true"]')!;
      const titleStyle = window.getComputedStyle(titleEl);
      const headerBefore = window.getComputedStyle(headerEl, '::before');
      return {
        titleFontSize: Number.parseFloat(titleStyle.fontSize),
        frostOpacity: Number.parseFloat(headerBefore.opacity),
        backgroundImage: headerBefore.backgroundImage,
        backdropFilter: headerBefore.backdropFilter,
      };
    });

    expect(after.titleFontSize).toBeLessThan(before.titleFontSize);
    expect(after.frostOpacity).toBeGreaterThan(before.frostOpacity);
    expect(after.backgroundImage).not.toBe('none');
    expect(after.backdropFilter).not.toBe('none');
    await expect(header.locator('[data-mobile-brand="true"]')).toBeVisible();
    await expect(header.locator('[data-mobile-header-actions="true"]')).toBeVisible();
  });

  test('ação negociações navega para /pt-BR/negociacoes', async ({ page }) => {
    await gotoPublicCargasMobile(page);
    const consoleGuard = attachPublicMobileConsoleGuard(page);

    try {
      const firstCard = page
        .locator('[data-public-cargas-mobile="true"] article[data-cargo-id]')
        .first();
      await expect(firstCard).toBeVisible();
      await firstCard.click();
      await expect(page.locator('[data-public-cargo-action-sheet="true"]')).toBeVisible();

      await page
        .locator('[data-public-cargo-action-sheet="true"] a[href="/pt-BR/negociacoes"]')
        .evaluate((element) => {
          (element as HTMLAnchorElement).click();
        });
      await expect(page).toHaveURL(/\/pt-BR\/negociacoes$/);
      await expect(page.getByText('Escolher visão da carga')).toHaveCount(0);

      consoleGuard.assertClean();
    } finally {
      consoleGuard.detach();
    }
  });
});
