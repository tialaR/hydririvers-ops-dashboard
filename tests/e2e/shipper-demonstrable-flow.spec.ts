import { expect, test } from '@playwright/test';
import { resetMockScenarioThenLogin } from './support/cargo-context';

const shipper = { email: 'tiala@hydrorivers.com', password: 'hydro123' } as const;

test.describe('Fluxo demonstrável da Embarcadora', () => {
  test('visitante é bloqueado antes de renderizar conteúdo privado', async ({ page }) => {
    await page.goto('/pt-BR/minhas-cargas');
    await expect(page).toHaveURL(/\/pt-BR\/entrar\?next=/);
    await expect(page.getByText('Polpa de açaí congelada')).toHaveCount(0);
  });

  test('cria, reencontra e opera a mesma carga persistida', async ({ page }) => {
    await resetMockScenarioThenLogin(page, 'market-active', shipper);
    await page.goto('/pt-BR/minhas-cargas/nova');

    await page.locator('input[name="origin"]').fill('Porto Velho');
    await page.locator('input[name="destination"]').fill('Miritituba');
    await page.locator('input[name="window"]').fill('15–18 setembro');
    await page.getByRole('button', { name: /publicar|criar|continuar/i }).click();

    await expect(page).toHaveURL(/\/pt-BR\/minhas-cargas\/mock-\d+/);
    const createdUrl = page.url();
    await expect(page.getByText('Porto Velho → Miritituba')).toBeVisible();

    await page.goto('/pt-BR/minhas-cargas');
    await expect(page.getByText('Porto Velho')).toBeVisible();
    await page.goto(createdUrl);

    await page.getByRole('link', { name: /document/i }).click();
    await page.getByRole('button', { name: /resolver/i }).click();
    await page.getByRole('button', { name: /confirmar|resolver/i }).last().click();
    await expect(page.getByRole('button', { name: /resolver/i })).toHaveCount(0);
  });
});
