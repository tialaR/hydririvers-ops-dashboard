import { expect, test } from '@playwright/test';

test.describe('auth/profile DS v2 smoke', () => {
  test('login page renderiza formulário', async ({ page }) => {
    await page.goto('/pt-BR/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /otp|continuar|verificar/i })).toBeVisible();
  });

  test('cadastro page renderiza formulário', async ({ page }) => {
    await page.goto('/pt-BR/cadastro');
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
  });

  test('perfil requer sessão ou mostra estado', async ({ page }) => {
    await page.goto('/pt-BR/perfil');
    await expect(page.locator('main')).toBeVisible();
  });
});
