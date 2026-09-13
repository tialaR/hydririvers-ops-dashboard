import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const evidencePath = path.resolve('reports/sharklock-evidence/page-61/runtime-219-254-1440x1024.png');

test.use({ viewport: { width: 1440, height: 1024 } });

test('M01 desktop foundation preserves the real cargo journey', async ({ page }) => {
  await page.context().addCookies([{ name: 'hydrorivers.theme', value: 'dark', domain: '127.0.0.1', path: '/' }]);
  const login = await page.request.post('/api/mock-mode/login-as', { data: { userId: 'u-shipper-1' } });
  expect(login.status()).toBe(200);

  await page.goto('/pt-BR/minhas-cargas?visualFixture=page61-219-254', { waitUntil: 'networkidle' });
  const foundation = page.getByTestId('m01-desktop-foundation');
  await expect(foundation).toBeVisible();
  const cargoCards = page.locator('[data-cargo-id]');
  await expect(cargoCards.first()).toHaveAttribute('aria-pressed', 'true');
  const firstCargoCode = await cargoCards.first().getAttribute('data-cargo-code');
  expect(firstCargoCode).toBeTruthy();
  await expect(foundation).toContainText(firstCargoCode!);

  const secondCargo = cargoCards.nth(1);
  const secondCargoCode = await secondCargo.getAttribute('data-cargo-code');
  expect(secondCargoCode).toBeTruthy();
  await secondCargo.click();
  await expect(secondCargo).toHaveAttribute('aria-pressed', 'true');
  await expect(foundation.getByRole('heading', { name: secondCargoCode! })).toBeVisible();

  await page.getByRole('textbox', { name: 'Buscar' }).fill(firstCargoCode!);
  await expect(cargoCards).toHaveCount(1);
  await expect(cargoCards.first()).toHaveAttribute('data-cargo-code', firstCargoCode!);
  await page.getByRole('textbox', { name: 'Buscar' }).fill('');
  await page.getByRole('button', { name: 'Atenção', exact: true }).click();
  await expect(cargoCards.first()).toBeVisible();
  expect(await cargoCards.count()).toBeGreaterThan(0);
  for (const status of await cargoCards.evaluateAll((cards) => cards.map((card) => card.getAttribute('data-status')))) {
    expect(status).toBe('attention');
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(await page.locator('[data-nextjs-dialog]').count()).toBe(0);

  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await cargoCards.first().click();
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await page.screenshot({ path: evidencePath, animations: 'disabled', caret: 'hide' });
});
