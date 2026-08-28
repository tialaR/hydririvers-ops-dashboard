import { expect, test } from '@playwright/test';

/** Abre o Dev Assist em rota de produto. */
async function openQaHubFromCargas(page: import('@playwright/test').Page) {
  await page.goto('/pt-BR/cargas');
  await page.getByTestId('mock-mode-toggle').click();
  await expect(page.getByText('Modo mock · QA Assistant')).toBeVisible();
}

test.describe('Mock QA Hub', () => {
  test('Dev Assist aparece em /login para acesso rapido a personas seed', async ({ page }) => {
    await page.goto('/pt-BR/login');
    await expect(page.getByTestId('mock-mode-toggle')).toBeVisible();
  });

  test('Dev Assist aparece em /cadastro para consultar credenciais e fluxo mock', async ({ page }) => {
    await page.goto('/pt-BR/cadastro');
    await expect(page.getByTestId('mock-mode-toggle')).toBeVisible();
  });

  test('botão M fica no canto inferior direito acima da bottom nav no mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/pt-BR/cargas');
    const toggle = page.getByTestId('mock-mode-toggle');
    await expect(toggle).toBeVisible();

    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    const centerX = box.x + box.width / 2;
    expect(centerX).toBeGreaterThan(390 * 0.55);

    const bottomEdge = box.y + box.height;
    expect(bottomEdge).toBeLessThan(844 - 72);
  });

  test('painel abre em /cargas sem MISSING_MESSAGE e lista personas BR, US e ES', async ({
    page
  }) => {
    const missingMessages: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('MISSING_MESSAGE')) {
        missingMessages.push(text);
      }
    });

    await openQaHubFromCargas(page);

    expect(missingMessages).toEqual([]);

    await page.getByTestId('qa-hub-direct-mariana').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('qa-hub-direct-mariana')).toBeVisible();
    await expect(page.getByText('Mariana Tapajós')).toBeVisible();

    await page.getByTestId('qa-hub-direct-emily-hartwell').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('qa-hub-direct-emily-hartwell')).toBeVisible();
    await expect(page.getByText('Emily Hartwell')).toBeVisible();

    await page.getByTestId('qa-hub-direct-lucia-morales').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('qa-hub-direct-lucia-morales')).toBeVisible();
    await expect(page.getByText('Lucía Morales')).toBeVisible();
  });

  test('login direto pelo hub navega para cargas (Tiala)', async ({ page }) => {
    await openQaHubFromCargas(page);
    await expect(page.getByTestId('qa-hub-direct-tiala')).toBeVisible();
    await expect(page.getByTestId('qa-hub-fill-login-tiala')).toBeVisible();

    await page.getByTestId('qa-hub-direct-tiala').click();

    await expect(page.getByTestId('qa-hub-feedback-success')).toContainText(/Tiala/i);

    await page.waitForURL(/\/pt-BR\/cargas/, { timeout: 10_000 });
  });

  test('Entrar como Mariana autentica e permite acessar /minhas-cargas', async ({ page }) => {
    await openQaHubFromCargas(page);

    await page.getByTestId('qa-hub-direct-mariana').scrollIntoViewIfNeeded();
    await page.getByTestId('qa-hub-direct-mariana').click();

    await expect(page.getByTestId('qa-hub-feedback-success')).toContainText(/Mariana/i);
    await page.waitForURL(/\/pt-BR\/cargas/, { timeout: 10_000 });

    await page.goto('/pt-BR/minhas-cargas');
    await expect(page).toHaveURL(/\/pt-BR\/minhas-cargas/);
    await expect(page.getByTestId('minhas-cargas-grid')).toBeVisible();
  });

  test('Usar no login preenche credenciais sem POST automático', async ({ page }) => {
    await openQaHubFromCargas(page);
    await page.getByTestId('qa-hub-fill-login-admin').click();

    await page.waitForURL(/\/pt-BR\/login/);

    const email = page.locator('input[type="email"]');
    await expect(email).toHaveValue('admin@hydrorivers.com');

    const password = page.locator('input[type="password"]');
    await expect(password).toHaveValue('hydro123');
  });
});
