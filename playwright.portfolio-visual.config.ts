import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'shipper-portfolio-visual.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  outputDir: 'test-results/portfolio-visual',
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'reports/portfolio-visual-html', open: 'never' }]]
    : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 45_000,
  },
  webServer: {
    command:
      'HYDRORIVERS_EXPOSE_OTP_CODE=true HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true HYDRORIVERS_FORCE_MOCK_QA_UI=true HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true npm run build && HYDRORIVERS_EXPOSE_OTP_CODE=true HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true HYDRORIVERS_FORCE_MOCK_QA_UI=true HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true npm run start -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/pt-BR',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'mobile-375',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'mobile-390',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'mobile-430',
      use: { ...devices['Desktop Chrome'], viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true },
    },
  ],
});
