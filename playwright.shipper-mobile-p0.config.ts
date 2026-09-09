import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'shipper-mobile-p0.visual.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: {
    timeout: 15_000
  },
  outputDir: 'test-results/shipper-mobile-p0',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 45_000
  },
  webServer: {
    command:
      'HYDRORIVERS_EXPOSE_OTP_CODE=true HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true HYDRORIVERS_FORCE_MOCK_QA_UI=true HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true npm run build && HYDRORIVERS_EXPOSE_OTP_CODE=true HYDRORIVERS_ALLOW_MOCK_MODE_RESET=true HYDRORIVERS_FORCE_MOCK_QA_UI=true HYDRORIVERS_FORCE_QA_DIRECT_LOGIN=true npm run start -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/pt-BR/cockpit',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: 'pipe',
    stderr: 'pipe'
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true
      }
    }
  ]
});
