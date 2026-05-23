import { expect, test } from '@playwright/test';

import { expectNoHydrowaySpikeDevUi, smokeHydrowayRoute } from './support/hydroway-route-smoke';

const SPIKE_ROUTES = [
  {
    path: '/pt-BR/dev/hydroway-map-spike?cargoId=CARGO-001',
    screenshotName: 'spike-pt-br-cargo-001',
    cargoId: 'CARGO-001',
    expectFallback: false,
  },
  {
    path: '/pt-BR/dev/hydroway-map-spike?cargoId=CARGO-002',
    screenshotName: 'spike-pt-br-cargo-002',
    cargoId: 'CARGO-002',
    expectFallback: false,
  },
  {
    path: '/pt-BR/dev/hydroway-map-spike?cargoId=CARGO-004',
    screenshotName: 'spike-pt-br-cargo-004',
    cargoId: 'CARGO-004',
    expectFallback: false,
  },
  {
    path: '/pt-BR/dev/hydroway-map-spike?cargoId=CARGO-001&forceSvgFallback=1',
    screenshotName: 'spike-pt-br-cargo-001-svg-fallback',
    cargoId: 'CARGO-001',
    expectFallback: true,
  },
  {
    path: '/en-US/dev/hydroway-map-spike?cargoId=CARGO-001',
    screenshotName: 'spike-en-us-cargo-001',
    cargoId: 'CARGO-001',
    expectFallback: false,
  },
  {
    path: '/es/dev/hydroway-map-spike?cargoId=CARGO-001',
    screenshotName: 'spike-es-cargo-001',
    cargoId: 'CARGO-001',
    expectFallback: false,
  },
] as const;

test.describe('Hydroway map spike — rotas dev', () => {
  for (const route of SPIKE_ROUTES) {
    test(`smoke ${route.path}`, async ({ page }, testInfo) => {
      await smokeHydrowayRoute(page, route.path, testInfo, {
        screenshotName: route.screenshotName,
      });

      await expect(page.getByTestId('hydroway-map-spike')).toBeVisible();
      await expect(page.getByRole('heading', { name: /Hydroway Map Spike/i })).toBeVisible();
      await expect(page.getByTestId('hydroway-map-cargo-id')).toHaveText(route.cargoId);

      if (route.expectFallback) {
        await expect(page.getByTestId('hydroway-map-fallback')).toBeAttached();
        await expect(page.getByTestId('hydroway-map-provider')).toHaveText(/SVG/i);
      }
    });
  }
});

test.describe('Cargas — rotas protegidas do marketplace', () => {
  test('smoke /pt-BR/cargas lista marketplace', async ({ page }, testInfo) => {
    await smokeHydrowayRoute(page, '/pt-BR/cargas', testInfo, {
      screenshotName: 'cargas-pt-br-lista',
    });

    await expect(page.getByRole('heading', { name: 'Lista de cargas' })).toBeVisible();
    await expect(page.getByText('CARGO-001').first()).toBeVisible();
    await expect(page.locator('[data-cargo-id="cargo-001"]').first()).toBeVisible();

    await expectNoHydrowaySpikeDevUi(page);
    await expect(page).not.toHaveURL(/hydroway-map-spike/);
  });

  test('smoke /pt-BR/cargas/CARGO-001/mapa rota oficial', async ({ page }, testInfo) => {
    await smokeHydrowayRoute(page, '/pt-BR/cargas/CARGO-001/mapa', testInfo, {
      screenshotName: 'cargas-pt-br-cargo-001-mapa',
    });

    await expect(page).toHaveURL(/\/pt-BR\/cargas\/CARGO-001\/mapa/);
    await expect(page.getByText(/cargo-001/i).first()).toBeVisible();
    await expect(page.getByTestId('hydroway-map-product')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-product-stage')).toBeVisible();

    await expectNoHydrowaySpikeDevUi(page);
    await expect(page.getByRole('heading', { name: /Hydroway Map Spike/i })).toHaveCount(0);
  });

  test('smoke /pt-BR/cargas/CARGO-004/mapa rota oficial', async ({ page }, testInfo) => {
    await smokeHydrowayRoute(page, '/pt-BR/cargas/CARGO-004/mapa', testInfo, {
      screenshotName: 'cargas-pt-br-cargo-004-mapa',
    });

    await expect(page).toHaveURL(/\/pt-BR\/cargas\/CARGO-004\/mapa/);
    await expect(page.getByTestId('hydroway-map-product')).toBeVisible();
    await expectNoHydrowaySpikeDevUi(page);
  });
});

test.describe('Cargas — mobile smoke @mobile-hydroway', () => {
  test('smoke /pt-BR/cargas em viewport mobile', async ({ page }, testInfo) => {
    await smokeHydrowayRoute(page, '/pt-BR/cargas', testInfo, {
      screenshotName: 'cargas-pt-br-mobile-lista',
    });

    await expect(page.getByRole('textbox', { name: /Buscar cargas/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /CARGO-001/i }).first()).toBeVisible();
    await expect(page.getByText('CARGO-001').first()).toBeVisible();

    await expectNoHydrowaySpikeDevUi(page);
  });

  test('smoke /pt-BR/cargas/CARGO-001/mapa experiência mobile', async ({ page }, testInfo) => {
    await smokeHydrowayRoute(page, '/pt-BR/cargas/CARGO-001/mapa', testInfo, {
      screenshotName: 'cargas-pt-br-mobile-mapa',
    });

    await expect(page.getByTestId('hydroway-map-mobile-experience')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-back')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-stage')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-focus-origin-button')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-center-cargo-button')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-focus-destination-button')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-route-overview-button')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-product')).toHaveCount(0);
    await expect(page.getByTestId('hydroway-map-product-stage')).toHaveCount(0);
    await expect(page.getByTestId('hydroway-map-mobile-top-bar')).toHaveCount(0);
    await expect(page.getByTestId('hydroway-map-mobile-bottom-summary')).toHaveCount(0);
    await expect(page.getByTestId('hydroway-map-mobile-layer-panel')).toHaveCount(0);
    await expect(page.getByTestId('hydroway-map-cargo-id')).toHaveCount(0);
    await expect(page.getByRole('group', { name: /Selecionar carga demo/i })).toHaveCount(0);
    await expect(page.getByRole('group', { name: /Resumo operacional da carga/i })).toHaveCount(0);
    await expectNoHydrowaySpikeDevUi(page);
  });

  test('smoke /pt-BR/cargas/CARGO-004/mapa experiência mobile', async ({ page }, testInfo) => {
    await smokeHydrowayRoute(page, '/pt-BR/cargas/CARGO-004/mapa', testInfo, {
      screenshotName: 'cargas-pt-br-mobile-mapa-cargo-004',
    });

    await expect(page.getByTestId('hydroway-map-mobile-experience')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-back')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-stage')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-focus-origin-button')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-center-cargo-button')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-focus-destination-button')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-mobile-route-overview-button')).toBeVisible();
    await expect(page.getByTestId('hydroway-map-product')).toHaveCount(0);
    await expect(page.getByTestId('hydroway-map-cargo-id')).toHaveCount(0);
    await expectNoHydrowaySpikeDevUi(page);
  });
});
