import { expect, type Page } from '@playwright/test';

export async function scrollMobileProductShell(page: Page, delta = 120) {
  const scrollStage = page.locator('.hr-dashboard-scroll').first();

  await scrollStage.evaluate((element, amount) => {
    const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
    element.scrollTop = Math.min(amount, maxScroll);
  }, delta);

  const appliedScrollTop = await scrollStage.evaluate((element) => element.scrollTop);

  if (appliedScrollTop <= 24) {
    await page.mouse.move(215, 500);
    await page.mouse.wheel(0, delta);
  }
}

export async function expectMobileHeaderCompact(page: Page, compact: boolean) {
  const header = page.locator('[data-mobile-product-shell="true"]');
  await expect
    .poll(async () => header.getAttribute('data-mobile-header-compact'), { timeout: 8_000 })
    .toBe(compact ? 'true' : 'false');
  await expect(header).toHaveAttribute('data-scroll-compact', compact ? 'true' : 'false');
}
