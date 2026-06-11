import { expect, test, type Page } from '@playwright/test';

async function readHtmlTheme(page: Page) {
  return page.evaluate(() => ({
    dataTheme: document.documentElement.dataset.theme ?? null,
    hasDarkClass: document.documentElement.classList.contains('dark'),
    colorScheme: document.documentElement.style.colorScheme || null
  }));
}

test('theme persists in cookie/localStorage and survives reload', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'hydrorivers.theme',
      value: 'dark',
      domain: '127.0.0.1',
      path: '/'
    }
  ]);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/en-US/dashboard', { waitUntil: 'domcontentloaded' });

  await expect
    .poll(async () => (await readHtmlTheme(page)).dataTheme)
    .toBe('dark');

  const darkInitial = await readHtmlTheme(page);
  expect(darkInitial.hasDarkClass).toBe(true);
  expect(darkInitial.colorScheme).toBe('dark');

  const themeToggle = page.getByRole('button', { name: /switch between light and dark theme/i });
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();

  await expect
    .poll(async () => (await readHtmlTheme(page)).dataTheme)
    .toBe('light');

  await page.reload();

  const lightAfterReload = await readHtmlTheme(page);
  expect(lightAfterReload.dataTheme).toBe('light');
  expect(lightAfterReload.hasDarkClass).toBe(false);
  expect(lightAfterReload.colorScheme).toBe('light');

  const cookie = (await context.cookies()).find((item) => item.name === 'hydrorivers.theme');
  expect(cookie?.value).toBe('light');

  const storedTheme = await page.evaluate(() => window.localStorage.getItem('hydrorivers.theme'));
  expect(storedTheme).toBe('light');
});
