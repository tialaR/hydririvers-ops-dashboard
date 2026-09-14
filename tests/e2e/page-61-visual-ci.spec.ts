import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const runtimeArtifact = path.resolve(
  'reports/sharklock-evidence/page-61/runtime-219-254-1440x1024.png',
);

test('captures canonical Page 61 / node 219:254', async ({ page }) => {
  await page.context().addCookies([
    { name: 'hydrorivers.theme', value: 'dark', domain: '127.0.0.1', path: '/' },
  ]);

  const login = await page.request.post('/api/mock-mode/login-as', {
    data: { userId: 'u-shipper-1' },
  });
  expect(login.status()).toBe(200);

  await page.goto('/pt-BR/minhas-cargas?visualFixture=page61-219-254', {
    waitUntil: 'networkidle',
  });
  await expect(page.getByTestId('m01-desktop-foundation')).toBeVisible();
  await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0);

  await mkdir(path.dirname(runtimeArtifact), { recursive: true });
  await page.screenshot({
    path: runtimeArtifact,
    animations: 'disabled',
    caret: 'hide',
  });
});
