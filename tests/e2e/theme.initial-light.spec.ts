import { expect, test, type Browser, type Page } from '@playwright/test';

/** iPhone 14 Pro Max logical viewport */
const MOBILE_VIEWPORT = { width: 430, height: 932 } as const;

async function readHtmlTheme(page: Page) {
  return page.evaluate(() => ({
    dataTheme: document.documentElement.dataset.theme ?? null,
    hasDarkClass: document.documentElement.classList.contains('dark'),
    colorScheme: document.documentElement.style.colorScheme || null,
    hydroTheme: document.querySelector('[data-hydro-theme]')?.getAttribute('data-hydro-theme') ?? null
  }));
}

async function openFreshContext(browser: Browser) {
  const context = await browser.newContext();
  await context.clearCookies();
  const page = await context.newPage();
  return { context, page };
}

test.describe('tema inicial global light-first', () => {
  test('html nasce light sem cookie nem localStorage de tema', async ({ browser }) => {
    const { context, page } = await openFreshContext(browser);

    await page.addInitScript(() => {
      window.localStorage.removeItem('hydrorivers.theme');
      window.localStorage.removeItem('hydrorivers:theme');
    });

    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/pt-BR/cargas', { waitUntil: 'domcontentloaded' });

    const theme = await readHtmlTheme(page);
    expect(theme.dataTheme).toBe('light');
    expect(theme.hasDarkClass).toBe(false);
    expect(theme.colorScheme).toBe('light');
    expect(theme.hydroTheme).toBe('light');

    await context.close();
  });

  test('login nasce light no primeiro paint sem preferência salva', async ({ browser }) => {
    const { context, page } = await openFreshContext(browser);

    await page.goto('/pt-BR/login', { waitUntil: 'domcontentloaded' });

    const theme = await readHtmlTheme(page);
    expect(theme.dataTheme).toBe('light');
    expect(theme.hasDarkClass).toBe(false);
    expect(theme.colorScheme).toBe('light');

    await context.close();
  });

  test('cookie dark continua respeitado no SSR', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: 'hydrorivers.theme',
        value: 'dark',
        domain: '127.0.0.1',
        path: '/'
      }
    ]);
    const page = await context.newPage();

    await page.goto('/pt-BR/login', { waitUntil: 'domcontentloaded' });

    const theme = await readHtmlTheme(page);
    expect(theme.dataTheme).toBe('dark');
    expect(theme.hasDarkClass).toBe(true);
    expect(theme.colorScheme).toBe('dark');
    expect(theme.hydroTheme).toBe('dark');

    await context.close();
  });
});
