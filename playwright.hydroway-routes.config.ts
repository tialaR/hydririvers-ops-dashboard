import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.HYDROWAY_ROUTES_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'hydroway-map-routes.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: 'test-results/hydroway-routes',
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'on',
  },
  webServer: {
    command: 'npm run dev -- --port 3000',
    /** Raiz `/` responde 404; usar rota localizada para health-check e reuseExistingServer. */
    url: `${baseURL}/pt-BR`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      ...process.env,
      HYDRORIVERS_HYDROWAY_MAP_SPIKE_ROUTE: 'true',
    },
  },
  projects: [
    {
      name: 'desktop-chromium',
      grepInvert: /@mobile-hydroway/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      grep: /@mobile-hydroway/,
      use: { ...devices['Pixel 5'] },
    },
  ],
});
