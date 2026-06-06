import { expect, test, type ConsoleMessage, type Page, type Response } from '@playwright/test';

import { resetMockScenarioThenLogin } from './support/cargo-context';
import { expectMobileHeaderCompact, scrollMobileProductShell } from './support/mobile-header-scroll';

/** iPhone 14 Pro Max logical viewport */
const MOBILE_VIEWPORT = { width: 430, height: 932 } as const;

const shipper = { email: 'tiala@hydrorivers.com', password: 'hydro123' } as const;

const FATAL_CONSOLE_PATTERNS = [/MISSING_MESSAGE/i, /hydration/i, /React/i] as const;

const TOLERANCE_PX = 2;

type BoxMetrics = {
  width: number;
  height: number;
  x: number;
  y: number;
};

type SurfaceMetrics = {
  boxShadow: string;
  backgroundImage: string;
  border: string;
  backdropFilter: string;
  dropShadowCount: number;
  hasInsetHighlight: boolean;
};

type BottomNavVisualMetrics = {
  box: BoxMetrics;
  position: string;
  borderRadius: number;
  surface: SurfaceMetrics;
  activeBubbleBox: BoxMetrics;
  activeBubbleShadow: string;
  activeIconSize: number;
  activeLabelFontSize: number;
};

type DevV2ReferenceContract = {
  backgroundHasGradient: boolean;
  backgroundPaddingInline: number;
  iconButtonFilter: BoxMetrics;
  iconButtonBorderRadius: number;
  iconButtonSurface: SurfaceMetrics;
  searchField: BoxMetrics;
  searchFieldBorderRadius: number;
  searchFieldSurface: SurfaceMetrics;
  searchToFilterGap: number;
  cargoCard: BoxMetrics;
  cargoCardBorderRadius: number;
  cargoCardHasShadow: boolean;
  statusBadgeBorderRadius: number;
  statusBadgeHasDot: boolean;
  bottomNav: BoxMetrics;
  bottomNavPosition: string;
  bottomNavItemCount: number;
  bottomNavActiveHasBubble: boolean;
  bottomNavVisual: BottomNavVisualMetrics;
  bottomSheetTitleFontSize: number;
  bottomSheetClose: BoxMetrics;
  bottomSheetHasHeader: boolean;
  bottomSheetHasBody: boolean;
  bottomSheetHasFooter: boolean;
};

function expectNear(actual: number, expected: number, tolerance = TOLERANCE_PX) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

function attachDsV2Guards(page: Page) {
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  const onConsole = (message: ConsoleMessage) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();
    if (FATAL_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) {
      consoleErrors.push(text);
    }
  };

  const onResponse = (response: Response) => {
    const url = response.url();
    const status = response.status();

    if (url.includes('/pt-BR/pt-BR')) {
      networkErrors.push(`double locale URL: ${url}`);
    }

    if (status === 404 && /\/pt-BR\/(cargas|dev-v2|negociacoes|rastreio)/.test(url)) {
      networkErrors.push(`404 on tested route: ${url}`);
    }
  };

  page.on('console', onConsole);
  page.on('response', onResponse);

  return {
    assertClean: () => {
      expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
      expect(networkErrors, networkErrors.join('\n')).toEqual([]);
    },
    detach: () => {
      page.off('console', onConsole);
      page.off('response', onResponse);
    },
  };
}

async function readBox(page: Page, selector: string): Promise<BoxMetrics> {
  const locator = page.locator(selector).first();
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

async function readSurfaceMetrics(page: Page, selector: string): Promise<SurfaceMetrics> {
  return page.locator(selector).first().evaluate((element) => {
    const style = window.getComputedStyle(element);
    const boxShadow = style.boxShadow;
    const layers = boxShadow === 'none' ? [] : boxShadow.split(/,(?![^(]*\))/);

    return {
      boxShadow,
      backgroundImage: style.backgroundImage,
      border: style.border,
      backdropFilter: style.backdropFilter,
      dropShadowCount: layers.filter((layer) => !layer.includes('inset')).length,
      hasInsetHighlight: layers.some((layer) => layer.includes('inset')),
    };
  });
}

function expectSurfaceParity(actual: SurfaceMetrics, reference: SurfaceMetrics) {
  expect(actual.dropShadowCount).toBeGreaterThanOrEqual(reference.dropShadowCount);
  expect(actual.hasInsetHighlight).toBe(reference.hasInsetHighlight);
  expect(actual.backgroundImage.includes('gradient')).toBe(true);
  expect(reference.backgroundImage.includes('gradient')).toBe(true);
  expect(actual.boxShadow).not.toBe('none');
  expect(reference.boxShadow).not.toBe('none');

  const referenceHasBlur = reference.backdropFilter !== 'none';
  const actualHasBlur = actual.backdropFilter !== 'none';
  expect(actualHasBlur).toBe(referenceHasBlur);
}

async function readBottomNavVisualMetrics(
  page: Page,
  navSelector: string,
  activeItemSelector: string,
): Promise<BottomNavVisualMetrics> {
  const nav = page.locator(navSelector).first();
  await expect(nav).toBeVisible();

  const box = await nav.boundingBox();
  expect(box).not.toBeNull();

  const position = await nav.evaluate((element) => window.getComputedStyle(element).position);
  const borderRadius = await readBorderRadius(page, nav);
  const surface = await readSurfaceMetrics(page, navSelector);

  const activeBubble = nav.locator(activeItemSelector).locator('[data-bottom-nav-active-bubble="true"]').first();
  await expect(activeBubble).toBeVisible();

  const activeBubbleBox = await activeBubble.boundingBox();
  expect(activeBubbleBox).not.toBeNull();

  const activeBubbleShadow = await activeBubble.evaluate(
    (element) => window.getComputedStyle(element).boxShadow,
  );

  const activeIconSize = await activeBubble
    .locator('[data-bottom-nav-icon-variant="outlined"]')
    .first()
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return Math.max(rect.width, rect.height);
    });

  const activeLabelFontSize = await activeBubble
    .locator('[data-bottom-nav-label-active="true"]')
    .first()
    .evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));

  return {
    box: box!,
    position,
    borderRadius,
    surface,
    activeBubbleBox: activeBubbleBox!,
    activeBubbleShadow,
    activeIconSize,
    activeLabelFontSize,
  };
}

async function readBorderRadius(page: Page, target: string | ReturnType<Page['locator']>): Promise<number> {
  const locator = typeof target === 'string' ? page.locator(target) : target;
  return locator.first().evaluate((element) => {
    const radius = window.getComputedStyle(element).borderRadius;
    const firstToken = radius.split(' ')[0] ?? '0';
    return Number.parseFloat(firstToken);
  });
}

type CardElevationMetrics = {
  boxShadow: string;
  borderRadius: number;
  backgroundColor: string;
  backgroundImage: string;
  dropShadowLayerCount: number;
  hasInsetHighlight: boolean;
  cardShadowVar: string;
  v2ShadowElevatedVar: string;
};

async function readCardElevationMetrics(page: Page, selector: string): Promise<CardElevationMetrics> {
  const locator = page.locator(selector).first();
  await expect(locator).toBeVisible();

  return locator.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const boxShadow = style.boxShadow;
    const layers = boxShadow === 'none' ? [] : boxShadow.split(/,(?![^(]*\))/);
    const dropShadowLayerCount = layers.filter((layer) => !layer.includes('inset')).length;

    return {
      boxShadow,
      borderRadius: Number.parseFloat(style.borderRadius.split(' ')[0] ?? '0'),
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      dropShadowLayerCount,
      hasInsetHighlight: boxShadow.includes('inset'),
      cardShadowVar: style.getPropertyValue('--card-shadow').trim(),
      v2ShadowElevatedVar: style.getPropertyValue('--v2-shadow-card-elevated').trim(),
    };
  });
}

function expectCardElevationParity(
  cargas: CardElevationMetrics,
  referenceHasShadow: boolean,
  referenceRadius: number,
) {
  expect(cargas.boxShadow).not.toBe('none');
  expect(cargas.dropShadowLayerCount).toBeGreaterThanOrEqual(2);
  expect(cargas.hasInsetHighlight).toBe(true);
  expect(cargas.cardShadowVar).not.toBe('');
  expect(cargas.v2ShadowElevatedVar).not.toBe('');
  expect(cargas.backgroundImage.includes('gradient')).toBe(true);
  expect(Math.abs(cargas.borderRadius - referenceRadius)).toBeLessThanOrEqual(TOLERANCE_PX + 1);
  expect(referenceHasShadow).toBe(true);
}

async function expectNoParentClipsCardShadow(page: Page, cardSelector: string) {
  const clipsShadow = await page.locator(cardSelector).first().evaluate((element) => {
    let parent = element.parentElement;

    while (parent) {
      const style = window.getComputedStyle(parent);
      const clipsY = style.overflowY === 'hidden' || style.overflow === 'hidden';

      if (clipsY) {
        return {
          clipped: true,
          tag: parent.tagName.toLowerCase(),
          className: String(parent.className).slice(0, 120),
          overflow: style.overflow,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
        };
      }

      parent = parent.parentElement;
    }

    return { clipped: false };
  });

  expect(clipsShadow.clipped).toBe(false);
}

async function collectDevV2Reference(page: Page): Promise<DevV2ReferenceContract> {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto('/pt-BR/dev-v2', { waitUntil: 'domcontentloaded' });

  const root = page.locator('main[data-theme="light"]');
  await expect(root).toBeVisible();

  const searchFieldLocator = page.locator('main[data-theme="light"] label:has(input[type="search"])');
  const filterButtonLocator = page.locator('main[data-theme="light"] label:has(input[type="search"]) ~ button');
  const cardLocator = page.locator('main[data-theme="light"] article[data-cargo-id]').first();
  const badgeLocator = page.locator('main[data-theme="light"] [data-status-tone]').first();
  const bottomNavSelector = 'nav[data-bottom-nav-global="true"]';

  await expect(searchFieldLocator).toBeVisible();
  await expect(filterButtonLocator).toBeVisible();
  await expect(cardLocator).toBeVisible();
  await expect(badgeLocator).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(bottomNavSelector)).toBeVisible();

  const searchFieldBox = await searchFieldLocator.boundingBox();
  const filterButtonBox = await filterButtonLocator.boundingBox();
  const cargoCardBox = await cardLocator.boundingBox();
  const bottomNavBox = await page.locator(bottomNavSelector).boundingBox();

  expect(searchFieldBox).not.toBeNull();
  expect(filterButtonBox).not.toBeNull();
  expect(cargoCardBox).not.toBeNull();
  expect(bottomNavBox).not.toBeNull();

  const searchField = searchFieldBox!;
  const filterButton = filterButtonBox!;
  const cargoCard = cargoCardBox!;
  const bottomNav = bottomNavBox!;

  const searchToFilterGap = filterButton.x - (searchField.x + searchField.width);

  const backgroundHasGradient = await root.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return style.backgroundImage.includes('gradient');
  });

  const mainBox = await root.boundingBox();
  expect(mainBox).not.toBeNull();
  const backgroundPaddingInline = searchField.x - mainBox!.x;

  const cargoCardHasShadow = await cardLocator.evaluate((element) => {
    const shadow = window.getComputedStyle(element).boxShadow;
    return shadow !== 'none' && shadow.length > 0;
  });

  const statusBadgeHasDot = await badgeLocator.evaluate((element) =>
    Array.from(element.classList).some((className) => className.includes('withDot')),
  );

  const bottomNavPosition = await page.locator(bottomNavSelector).evaluate(
    (element) => window.getComputedStyle(element).position,
  );

  const bottomNavItemCount = await page.locator('[data-bottom-nav-item]').count();

  const bottomNavActiveHasBubble = await page
    .locator('[data-bottom-nav-active="true"] [data-bottom-nav-active-bubble="true"]')
    .count()
    .then((count) => count > 0);

  const bottomNavVisual = await readBottomNavVisualMetrics(
    page,
    bottomNavSelector,
    '[data-bottom-nav-item="cargo"]',
  );

  await filterButtonLocator.click();
  const devSheet = page.locator('[data-testid="bottom-sheet-panel"]').last();
  await expect(devSheet).toBeVisible();

  const bottomSheetTitleFontSize = await devSheet
    .locator('[data-bottom-sheet-title="true"]')
    .evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));

  const bottomSheetClose = await readBox(page, '[data-testid="bottom-sheet-panel"] [data-bottom-sheet-close="true"]');

  const bottomSheetHasHeader = (await devSheet.locator('[data-bottom-sheet-header="true"]').count()) > 0;
  const bottomSheetHasBody = (await devSheet.locator('[data-bottom-sheet-body="true"]').count()) > 0;
  const bottomSheetHasFooter = (await devSheet.locator('[data-bottom-sheet-footer="true"]').count()) > 0;

  await page.locator('[data-bottom-sheet-close="true"]').last().click();
  await expect(devSheet).toBeHidden({ timeout: 5_000 });

  const [
    searchFieldBorderRadius,
    iconButtonBorderRadius,
    cargoCardBorderRadius,
    statusBadgeBorderRadius,
    iconButtonSurface,
    searchFieldSurface,
  ] = await Promise.all([
    readBorderRadius(page, searchFieldLocator),
    readBorderRadius(page, filterButtonLocator),
    readBorderRadius(page, cardLocator),
    readBorderRadius(page, badgeLocator),
    readSurfaceMetrics(page, 'main[data-theme="light"] label:has(input[type="search"]) ~ button'),
    readSurfaceMetrics(page, 'main[data-theme="light"] label:has(input[type="search"])'),
  ]);

  return {
    backgroundHasGradient,
    backgroundPaddingInline,
    iconButtonFilter: filterButton,
    iconButtonBorderRadius,
    iconButtonSurface,
    searchField,
    searchFieldBorderRadius,
    searchFieldSurface,
    searchToFilterGap,
    cargoCard,
    cargoCardBorderRadius,
    cargoCardHasShadow,
    statusBadgeBorderRadius,
    statusBadgeHasDot,
    bottomNav,
    bottomNavPosition,
    bottomNavItemCount,
    bottomNavActiveHasBubble,
    bottomNavVisual,
    bottomSheetTitleFontSize,
    bottomSheetClose,
    bottomSheetHasHeader,
    bottomSheetHasBody,
    bottomSheetHasFooter,
  };
}

async function gotoPublicCargasMobile(page: Page) {
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.goto('/pt-BR/cargas', { waitUntil: 'domcontentloaded' });
}

test.describe('Phase 5O — contrato DS v2 mobile (/dev-v2 → /cargas)', () => {
  test.describe.configure({ timeout: 120_000 });

  let reference: DevV2ReferenceContract;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(90_000);
    const page = await browser.newPage();
    reference = await collectDevV2Reference(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await resetMockScenarioThenLogin(page, 'market-active', shipper);
  });

  test('IconButton: dimensões, marker global, aria-label e filtro sliders', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await gotoPublicCargasMobile(page);

      const header = page.locator('[data-mobile-product-shell="true"]');
      const mobileList = page.locator('[data-public-cargas-mobile="true"]');

      const languageButton = header.locator('[data-mobile-header-action="language"]');
      const notificationsButton = header.locator('[data-mobile-header-action="notifications"]');
      const profileButton = header.locator('[data-mobile-header-action="profile"]');
      const filterButton = mobileList.locator('[data-mobile-cargas-filter-button="true"]');

      for (const button of [languageButton, notificationsButton, profileButton, filterButton]) {
        await expect(button).toHaveAttribute('data-icon-button-global', 'true');
        await expect(button).toHaveAttribute('aria-label', /.+/);
      }

      await expect(languageButton).toHaveText('PT');
      await expect(filterButton.locator('.lucide-sliders-horizontal')).toBeVisible();
      await expect(filterButton.locator('.lucide-filter')).toHaveCount(0);

      const headerBox = await readBox(page, '[data-mobile-header-actions="true"] [data-icon-button-global="true"]');
      const filterBox = await filterButton.boundingBox();
      expect(filterBox).not.toBeNull();

      expectNear(filterBox!.width, reference.iconButtonFilter.width);
      expectNear(filterBox!.height, reference.iconButtonFilter.height);
      expectNear(filterBox!.width, headerBox.width);
      expectNear(filterBox!.height, headerBox.height);

      const filterRadius = await readBorderRadius(page, '[data-mobile-cargas-filter-button="true"]');
      expectNear(filterRadius, reference.iconButtonBorderRadius);

      const cargasIconSurface = await readSurfaceMetrics(page, '[data-mobile-cargas-filter-button="true"]');
      expectSurfaceParity(cargasIconSurface, reference.iconButtonSurface);

      const notificationsBox = await notificationsButton.boundingBox();
      expect(notificationsBox).not.toBeNull();
      if (notificationsBox) {
        expectNear(notificationsBox.width, headerBox.width);
        expectNear(notificationsBox.height, headerBox.height);
      }

      await filterButton.click();
      const closeButton = page.locator('[data-bottom-sheet-close="true"]').last();
      await expect(closeButton).toHaveAttribute('data-icon-button-global', 'true');
      await expect(closeButton).toHaveAttribute('data-icon-button-role', 'sheet');

      const closeBox = await closeButton.boundingBox();
      expect(closeBox).not.toBeNull();
      expectNear(closeBox!.width, headerBox.width);
      expectNear(closeBox!.height, headerBox.height);

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });

  test('SearchField: height, radius, gap e placeholder alinhados ao /dev-v2', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await gotoPublicCargasMobile(page);

      const mobileList = page.locator('[data-public-cargas-mobile="true"]');
      const searchFieldSelector = '[data-public-cargas-mobile="true"] label:has(input[type="search"])';
      const filterSelector = '[data-mobile-cargas-filter-button="true"]';

      await expect(page.getByPlaceholder('Buscar cargas...')).toBeVisible();
      await expect(mobileList.locator('input[type="search"]')).toHaveCount(1);

      const [searchBox, filterBox] = await Promise.all([
        readBox(page, searchFieldSelector),
        readBox(page, filterSelector),
      ]);

      expectNear(searchBox.height, reference.searchField.height);
      expectNear(searchBox.width, reference.searchField.width, 40);

      const searchRadius = await readBorderRadius(page, searchFieldSelector);
      expectNear(searchRadius, reference.searchFieldBorderRadius);

      const cargasSearchSurface = await readSurfaceMetrics(page, searchFieldSelector);
      expectSurfaceParity(cargasSearchSurface, reference.searchFieldSurface);

      const gap = filterBox.x - (searchBox.x + searchBox.width);
      expectNear(gap, reference.searchToFilterGap);

      expect(Math.abs(searchBox.y - filterBox.y)).toBeLessThanOrEqual(6);

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });

  test('BottomNav: fixed, altura, itens, bolha ativa e navegação pending', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await gotoPublicCargasMobile(page);

      const bottomNav = page.locator('[data-mobile-product-bottom-nav="true"] nav');
      await expect(bottomNav).toBeVisible();

      const cargasBottomNavVisual = await readBottomNavVisualMetrics(
        page,
        '[data-mobile-product-bottom-nav="true"] nav',
        '[data-bottom-nav-item="cargos"]',
      );

      expectNear(cargasBottomNavVisual.box.width, reference.bottomNavVisual.box.width, 4);
      expectNear(cargasBottomNavVisual.box.height, reference.bottomNavVisual.box.height, 4);
      expect(cargasBottomNavVisual.position).toBe(reference.bottomNavVisual.position);
      expectNear(cargasBottomNavVisual.borderRadius, reference.bottomNavVisual.borderRadius, 4);
      expectSurfaceParity(cargasBottomNavVisual.surface, reference.bottomNavVisual.surface);

      expectNear(
        cargasBottomNavVisual.activeBubbleBox.width,
        reference.bottomNavVisual.activeBubbleBox.width,
        4,
      );
      expectNear(
        cargasBottomNavVisual.activeBubbleBox.height,
        reference.bottomNavVisual.activeBubbleBox.height,
        4,
      );
      expect(cargasBottomNavVisual.activeBubbleShadow).not.toBe('none');
      expect(reference.bottomNavVisual.activeBubbleShadow).not.toBe('none');
      expectNear(cargasBottomNavVisual.activeIconSize, reference.bottomNavVisual.activeIconSize, 4);
      expectNear(
        cargasBottomNavVisual.activeLabelFontSize,
        reference.bottomNavVisual.activeLabelFontSize,
        2,
      );

      const itemCount = await bottomNav.locator('[data-bottom-nav-item]').count();
      expect(itemCount).toBeGreaterThanOrEqual(3);

      const cargasItem = bottomNav.locator('[data-bottom-nav-item="cargos"]');
      await expect(cargasItem).toHaveAttribute('data-bottom-nav-active', 'true');
      await expect(cargasItem.locator('[data-bottom-nav-active-bubble="true"]')).toBeVisible();
      await expect(cargasItem.locator('[data-bottom-nav-icon-variant="outlined"]')).toBeVisible();
      await expect(cargasItem.locator('[data-bottom-nav-icon-variant="filled"]')).toHaveCount(0);
      await expect(cargasItem.locator('[data-bottom-nav-label-active="true"]')).toBeVisible();
      await expect(bottomNav).toHaveAttribute('data-bottom-nav-glass', 'true');

      const hasGlassBlur = await bottomNav.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const webkitBackdrop = (style as CSSStyleDeclaration & { webkitBackdropFilter?: string })
          .webkitBackdropFilter;
        return style.backdropFilter !== 'none' || (webkitBackdrop != null && webkitBackdrop !== 'none');
      });
      expect(hasGlassBlur).toBe(true);

      await expect(page.locator('.hx-mobile-bottom-nav')).toHaveCount(0);

      await page.route('**/negociacoes**', async (route) => {
        if (route.request().resourceType() === 'document') {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        await route.continue();
      });

      const negotiationsItem = bottomNav.locator('[data-bottom-nav-item="negotiations"]');
      await negotiationsItem.click({ noWaitAfter: true });

      await expect
        .poll(async () => {
          const state = await negotiationsItem.evaluate((element) => ({
            active: element.getAttribute('data-bottom-nav-active') === 'true',
            pending: element.getAttribute('data-bottom-nav-pending') === 'true',
            bubble: element.querySelector('[data-bottom-nav-active-bubble="true"]') != null,
            pressing: element.getAttribute('data-pressing') === 'true',
          }));
          return (state.active || state.pending) && state.bubble;
        })
        .toBe(true);

      await expect(page).toHaveURL(/\/pt-BR\/negociacoes$/, { timeout: 8_000 });
      await expect(page.locator('[data-mobile-product-shell="true"]')).toHaveAttribute('data-theme', 'light');
      await expect(page.locator('.hx-mobile-bottom-nav')).toHaveCount(0);

      await page.unroute('**/negociacoes**');

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const boxAfterScroll = await bottomNav.boundingBox();
      expect(boxAfterScroll).not.toBeNull();
      const viewport = page.viewportSize()!;
      expect(boxAfterScroll!.y + boxAfterScroll!.height).toBeGreaterThan(viewport.height - 120);

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });

  test('CargoCard: anatomia compatível com /dev-v2', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await gotoPublicCargasMobile(page);

      const card = page.locator('[data-public-cargas-mobile="true"] article[data-cargo-id]').first();
      await expect(card).toBeVisible();

      const cardBox = await card.boundingBox();
      expect(cardBox).not.toBeNull();
      expectNear(cardBox!.height, reference.cargoCard.height, 24);

      const cardRadius = await readBorderRadius(page, '[data-public-cargas-mobile="true"] article[data-cargo-id]');
      expectNear(cardRadius, reference.cargoCardBorderRadius);

      await expect(card).toHaveAttribute('data-ds-v2-cargo-card', 'true');

      const cargasElevation = await readCardElevationMetrics(
        page,
        '[data-public-cargas-mobile="true"] article[data-cargo-id]',
      );
      expectCardElevationParity(cargasElevation, reference.cargoCardHasShadow, reference.cargoCardBorderRadius);
      await expectNoParentClipsCardShadow(
        page,
        '[data-public-cargas-mobile="true"] article[data-cargo-id]',
      );

      const cargoId = await card.locator('[class*="cargoId"], span').first().textContent();
      const idOccurrences = await card.evaluate((element, id) => {
        if (!id?.trim()) return 0;
        return (element.textContent ?? '').split(id.trim()).length - 1;
      }, cargoId);
      expect(idOccurrences).toBeLessThanOrEqual(2);

      await expect(card.locator('h2').first()).toBeVisible();
      await expect(card.getByText(/→|—|-/).first()).toBeVisible();

      const routeCta = card.locator('[data-cargo-primary-action="true"]');
      await expect(routeCta).toBeVisible();
      await expect(routeCta).toContainText('Ver detalhes');
      await expect(card.getByText('Ver rota')).toHaveCount(0);

      const badges = page.locator('[data-public-cargas-mobile="true"] [data-status-tone]');
      await expect(badges.first()).toBeVisible();

      const badgesWithDot = await badges.evaluateAll((elements) =>
        elements.map((element) => Array.from(element.classList).some((className) => className.includes('withDot'))),
      );
      expect(badgesWithDot.every(Boolean)).toBe(true);

      const tones = await badges.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-status-tone') ?? ''),
      );
      expect(new Set(tones).size).toBeGreaterThan(1);
      expect(tones).toContain('open');
      expect(tones).toContain('quotation');

      await expect(page.locator('[data-public-cargas-mobile="true"]').getByText('ETA ETA')).toHaveCount(0);

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });

  test('BottomSheet: estrutura de filtro e ações alinhada ao /dev-v2', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await gotoPublicCargasMobile(page);

      await page.locator('[data-mobile-cargas-filter-button="true"]').click();
      const filterSheet = page.locator('[data-testid="bottom-sheet-panel"]').last();
      await expect(filterSheet).toBeVisible();

      await expect(filterSheet.locator('[data-bottom-sheet-header="true"]')).toBeVisible();
      await expect(filterSheet.locator('[data-bottom-sheet-body="true"]')).toBeVisible();
      await expect(filterSheet.locator('[data-bottom-sheet-footer="true"]')).toBeVisible();

      expect(reference.bottomSheetHasHeader).toBe(true);
      expect(reference.bottomSheetHasBody).toBe(true);
      expect(reference.bottomSheetHasFooter).toBe(true);

      const filterTitle = filterSheet.locator('[data-bottom-sheet-title="true"]');
      await expect(filterTitle).toHaveText('Filtros');
      await expect(filterSheet.locator('[data-bottom-sheet-description="true"]')).toBeVisible();

      const filterTitleSize = await filterTitle.evaluate((element) =>
        Number.parseFloat(window.getComputedStyle(element).fontSize),
      );
      expect(filterTitleSize).toBeLessThan(24);
      expect(filterTitleSize).toBeLessThan(reference.bottomSheetTitleFontSize);

      const filterHeaderBox = await filterSheet.locator('[data-bottom-sheet-header="true"]').boundingBox();
      const filterBodyBox = await filterSheet.locator('[data-bottom-sheet-body="true"]').boundingBox();
      const bodyTopPadding = await filterSheet.locator('[data-bottom-sheet-body="true"]').evaluate((element) =>
        Number.parseFloat(window.getComputedStyle(element).paddingTop),
      );
      expect(filterHeaderBox).not.toBeNull();
      expect(filterBodyBox).not.toBeNull();
      expect(bodyTopPadding).toBeGreaterThanOrEqual(12);
      if (filterHeaderBox && filterBodyBox) {
        expect(filterBodyBox.y).toBeGreaterThanOrEqual(filterHeaderBox.y + filterHeaderBox.height - 12);
      }

      await expect(filterSheet.getByRole('button', { name: 'Limpar filtros' })).toBeVisible();
      await expect(filterSheet.getByRole('button', { name: 'Ver cargas' })).toBeVisible();
      await expect(filterSheet.locator('[data-bottom-sheet-close="true"]')).toHaveAttribute(
        'data-icon-button-global',
        'true',
      );

      await filterSheet.locator('[data-bottom-sheet-close="true"]').click();
      await expect(filterSheet).toBeHidden({ timeout: 5_000 });

      const firstCard = page.locator('[data-public-cargas-mobile="true"] article[data-cargo-id]').first();
      const cargoTitle = await firstCard.locator('h2').first().textContent();
      await firstCard.click();

      const actionSheet = page.locator('[data-public-cargo-action-sheet="true"]');
      await expect(actionSheet).toBeVisible();
      await expect(actionSheet.locator('[data-bottom-sheet-title="true"]')).toHaveText('Ações da carga');
      await expect(actionSheet.locator('[data-bottom-sheet-description="true"]')).toBeVisible();
      await expect(actionSheet.locator('[data-bottom-sheet-body="true"]')).toBeVisible();

      if (cargoTitle?.trim()) {
        await expect(actionSheet.locator('[data-bottom-sheet-body="true"]')).toContainText(cargoTitle.trim());
      }

      await expect(actionSheet.getByText('ETA ETA')).toHaveCount(0);

      const hrefs = await actionSheet.locator('[data-public-cargo-action="true"]').evaluateAll((elements) =>
        elements.map((element) => (element as HTMLAnchorElement).getAttribute('href') ?? ''),
      );
      expect(hrefs.length).toBeGreaterThan(0);
      expect(hrefs.every((href) => href.length > 0 && !href.includes('/pt-BR/pt-BR'))).toBe(true);

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });

  test('Background: canvas DS v2 no shell mobile sem folha concorrente', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await gotoPublicCargasMobile(page);

      const shellRoot = page.locator('[data-mobile-product-v2-shell="true"][data-mobile-shell-background="root"]');
      const scrollStage = page.locator('.hr-dashboard-scroll[data-mobile-shell-background="true"][data-ds-v2-mobile-canvas="true"]');
      await expect(shellRoot).toBeVisible();
      await expect(scrollStage).toBeVisible();

      const listRoot = page.locator('[data-public-cargas-mobile="true"]');
      await expect(listRoot).toHaveAttribute('data-public-cargas-mobile-page-background', 'none');

      const shellBackground = await shellRoot.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const beforeStyle = window.getComputedStyle(element, '::before');
        const rect = element.getBoundingClientRect();
        return {
          hasGradient: style.backgroundImage.includes('gradient'),
          attachment: style.backgroundAttachment,
          beforeHasGradient: beforeStyle.backgroundImage.includes('gradient'),
          height: rect.height,
        };
      });
      const stageBackground = await scrollStage.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const beforeStyle = window.getComputedStyle(element, '::before');
        return {
          hasGradient: style.backgroundImage.includes('gradient'),
          beforeHasGradient: beforeStyle.backgroundImage.includes('gradient'),
          color: style.backgroundColor,
          paddingInline: Number.parseFloat(style.paddingLeft),
        };
      });
      const viewportHeight = page.viewportSize()?.height ?? 0;
      expect(shellBackground.hasGradient).toBe(true);
      expect(shellBackground.attachment).toContain('fixed');
      expect(shellBackground.beforeHasGradient).toBe(true);
      expect(shellBackground.height).toBeGreaterThanOrEqual(viewportHeight - 8);
      expect(stageBackground.hasGradient).toBe(false);
      expect(stageBackground.beforeHasGradient).toBe(false);
      expect(reference.backgroundHasGradient).toBe(true);
      expectNear(stageBackground.paddingInline, reference.backgroundPaddingInline, 4);

      const listBackground = await listRoot.evaluate((element) => window.getComputedStyle(element).backgroundColor);
      expect(listBackground).toMatch(/rgba?\(0,\s*0,\s*0,\s*0\)|transparent/i);

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });

  test('Light-first: html light, shell DS v2 no primeiro paint, sem legado', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/pt-BR/cargas', { waitUntil: 'domcontentloaded' });

      const theme = await page.evaluate(() => ({
        dataTheme: document.documentElement.dataset.theme ?? null,
        hasDarkClass: document.documentElement.classList.contains('dark'),
      }));
      expect(theme.dataTheme).toBe('light');
      expect(theme.hasDarkClass).toBe(false);

      await expect(page.locator('[data-public-cargas-mobile="true"]')).toBeVisible();
      await expect(page.locator('[data-mobile-product-shell="true"]')).toHaveAttribute('data-theme', 'light');
      await expect(page.locator('[data-legacy-cargo-list="true"]')).toBeHidden();
      await expect(page.locator('.hx-mobile-bottom-nav')).toBeHidden();
      await expect(page.locator('.statusScroller')).toHaveCount(0);
      await expect(page.locator('[data-public-cargas-mobile="true"]').getByText('Lista de cargas', { exact: true })).toHaveCount(0);

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });

  test('Skeleton por módulo: markers condicionais sem header/nav próprios', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await gotoPublicCargasMobile(page);

      const cargasSkeletonCount = await page.locator('[data-public-cargas-mobile-skeleton="true"]').count();
      if (cargasSkeletonCount > 0) {
        const skeleton = page.locator('[data-public-cargas-mobile-skeleton="true"]');
        await expect(skeleton).toBeVisible();
        await expect(skeleton.locator('[data-mobile-product-shell="true"]')).toHaveCount(0);
        await expect(skeleton.locator('[data-mobile-product-bottom-nav="true"]')).toHaveCount(0);
      }

      await page.route('**/negociacoes**', async (route) => {
        if (route.request().resourceType() === 'document') {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
        await route.continue();
      });

      await page.locator('[data-bottom-nav-item="negotiations"]').click({ noWaitAfter: true });
      await expect(page).toHaveURL(/\/pt-BR\/negociacoes/, { timeout: 8_000 });

      const negSkeletonCount = await page.locator('[data-negotiations-mobile-skeleton="true"]').count();
      if (negSkeletonCount > 0) {
        const skeleton = page.locator('[data-negotiations-mobile-skeleton="true"]');
        await expect(skeleton).toBeVisible();
        await expect(skeleton.locator('[data-mobile-product-shell="true"]')).toHaveCount(0);
      }

      await page.unroute('**/negociacoes**');

      await page.route('**/rastreio**', async (route) => {
        if (route.request().resourceType() === 'document') {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
        await route.continue();
      });

      const trackingSkeletonDuringNav = page
        .waitForSelector('[data-tracking-mobile-skeleton="true"]', { timeout: 1_200 })
        .catch(() => null);

      await page.locator('[data-bottom-nav-item="tracking"]').click({ noWaitAfter: true });
      await expect(page).toHaveURL(/\/pt-BR\/rastreio/, { timeout: 8_000 });

      const trackingSkeleton = await trackingSkeletonDuringNav;
      if (trackingSkeleton) {
        await expect(page.locator('[data-tracking-mobile-skeleton="true"] [data-mobile-product-shell="true"]')).toHaveCount(
          0,
        );
      }

      await expect(page.locator('[data-mobile-product-bottom-nav="true"] nav')).toBeVisible();

      await page.unroute('**/rastreio**');

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });

  test('header fixo global reduz título ao scroll da lista', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await gotoPublicCargasMobile(page);

      const header = page.locator('[data-mobile-product-shell="true"][data-mobile-header-glass="true"]');
      const title = page.locator('[data-mobile-page-title="true"]');

      await expect(page.locator('[data-public-cargas-mobile="true"] article[data-cargo-id]').first()).toBeVisible();
      await expectMobileHeaderCompact(page, false);
      await expect(title).toHaveText('Cargas');

      const beforeMetrics = await title.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const headerEl = element.closest('header')!;
        const headerBefore = window.getComputedStyle(headerEl, '::before');
        const box = element.getBoundingClientRect();
        const headerRect = headerEl.getBoundingClientRect();
        return {
          fontSize: Number.parseFloat(style.fontSize),
          height: box.height,
          headerY: headerRect.y,
          frostOpacity: Number.parseFloat(headerBefore.opacity),
          backgroundImage: headerBefore.backgroundImage,
          headerPosition: window.getComputedStyle(headerEl).position,
        };
      });

      expect(beforeMetrics.fontSize).toBeGreaterThan(28);
      expect(beforeMetrics.frostOpacity).toBeGreaterThan(0.45);
      expect(beforeMetrics.frostOpacity).toBeLessThan(0.72);
      expect(beforeMetrics.backgroundImage).not.toBe('none');
      expect(beforeMetrics.headerPosition).toBe('fixed');
      await expect(header).toHaveAttribute('data-mobile-header-glass', 'true');

      await scrollMobileProductShell(page, 120);
      await expectMobileHeaderCompact(page, true);

      const afterMetrics = await title.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const headerEl = element.closest('header')!;
        const headerBefore = window.getComputedStyle(headerEl, '::before');
        const box = element.getBoundingClientRect();
        const headerRect = headerEl.getBoundingClientRect();
        return {
          fontSize: Number.parseFloat(style.fontSize),
          height: box.height,
          headerTop: headerRect.top,
          headerY: headerRect.y,
          frostOpacity: Number.parseFloat(headerBefore.opacity),
          frostBackdrop: headerBefore.backdropFilter,
          backgroundImage: headerBefore.backgroundImage,
        };
      });

      expect(afterMetrics.fontSize).toBeLessThan(beforeMetrics.fontSize);
      expect(afterMetrics.height).toBeLessThanOrEqual(beforeMetrics.height + 1);
      expect(afterMetrics.fontSize).toBeLessThan(24);
      expect(afterMetrics.headerY).toBeGreaterThanOrEqual(beforeMetrics.headerY - 4);
      expect(afterMetrics.headerTop).toBeLessThanOrEqual(4);
      expect(afterMetrics.frostOpacity).toBeGreaterThan(beforeMetrics.frostOpacity);
      expect(afterMetrics.frostOpacity).toBeLessThan(0.9);
      expect(afterMetrics.frostBackdrop).not.toBe('none');
      expect(afterMetrics.backgroundImage).not.toBe('none');
      await expect(title).toHaveAttribute('data-mobile-page-title-compact-offset', 'true');
      await expect(header.locator('[data-mobile-brand="true"]')).toBeVisible();
      await expect(header.locator('[data-mobile-header-actions="true"]')).toBeVisible();
      await expect(page.locator('[data-mobile-product-bottom-nav="true"] nav')).toBeVisible();

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });

  test('header fixo global em rastreio usa mesmo marker compact', async ({ page }) => {
    const guards = attachDsV2Guards(page);

    try {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/pt-BR/rastreio', { waitUntil: 'domcontentloaded' });

      const header = page.locator('[data-mobile-product-shell="true"]');
      await expect(header).toBeVisible();
      await expectMobileHeaderCompact(page, false);

      await scrollMobileProductShell(page, 120);
      await expectMobileHeaderCompact(page, true);

      const headerTop = await header.evaluate((element) => element.getBoundingClientRect().top);
      expect(headerTop).toBeLessThanOrEqual(4);

      guards.assertClean();
    } finally {
      guards.detach();
    }
  });
});
