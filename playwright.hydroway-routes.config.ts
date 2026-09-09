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
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
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
