import { expect, type Page, type TestInfo } from '@playwright/test';

const MAPLIBRE_FATAL_CONSOLE_PATTERNS: RegExp[] = [
  /\blayers\b/i,
  /missing required property/i,
  /expected one of/i,
  /Only one zoom-based/i,
  /\bsource\b/i,
  /\bstyle\b/i,
  /WebGL/i,
  /MapLibre/i,
];

const ALLOWED_CONSOLE_ERROR_PATTERNS: RegExp[] = [
  /\/api\/auth\/me\b.*\b401\b/i,
  /\b401\b.*\/api\/auth\/me\b/i,
  /Failed to load resource.*\/api\/auth\/me/i,
  /Unauthorized.*\/api\/auth\/me/i,
];

export type HydrowayRouteSmokeOptions = {
  /** Screenshot filename stem (without extension). */
  screenshotName: string;
  /** Fail when the main document response is 404. Default true. */
  expectDocumentOk?: boolean;
};

export type HydrowayRouteSmokeReport = {
  pageErrors: string[];
  consoleErrors: string[];
  http500Urls: string[];
  documentStatus: number | null;
};

function isAllowedConsoleError(text: string): boolean {
  return ALLOWED_CONSOLE_ERROR_PATTERNS.some((pattern) => pattern.test(text));
}

function isMapLibreFatalConsoleError(text: string): boolean {
  if (isAllowedConsoleError(text)) return false;
  return MAPLIBRE_FATAL_CONSOLE_PATTERNS.some((pattern) => pattern.test(text));
}

function attachSmokeReport(testInfo: TestInfo, report: HydrowayRouteSmokeReport) {
  testInfo.attach('hydroway-smoke-report', {
    body: JSON.stringify(report, null, 2),
    contentType: 'application/json',
  });
}

/**
 * Navega para uma rota, coleta erros de página/console/rede e tira screenshot de evidência.
 * Falha em pageerror, erros MapLibre/Style Spec, HTTP 500 e 404 do documento principal.
 */
export async function smokeHydrowayRoute(
  page: Page,
  routePath: string,
  testInfo: TestInfo,
  options: HydrowayRouteSmokeOptions,
): Promise<HydrowayRouteSmokeReport> {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const http500Urls: string[] = [];
  let documentStatus: number | null = null;

  const onPageError = (error: Error) => {
    pageErrors.push(error.message);
  };

  const onConsole = (message: { type: () => string; text: () => string }) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (isMapLibreFatalConsoleError(text)) {
      consoleErrors.push(text);
    }
  };

  const onResponse = (response: {
    url: () => string;
    status: () => number;
    request: () => { resourceType: () => string };
  }) => {
    const status = response.status();
    if (status === 500) {
      http500Urls.push(`${status} ${response.url()}`);
    }
    if (response.request().resourceType() === 'document') {
      const pageUrl = new URL(page.url(), 'http://localhost');
      const responseUrl = new URL(response.url());
      if (responseUrl.pathname === pageUrl.pathname) {
        documentStatus = status;
      }
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  page.on('response', onResponse);

  try {
    const response = await page.goto(routePath, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (response) {
      documentStatus = response.status();
    }

    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {
      /* MapLibre/animação podem impedir networkidle; domcontentloaded + seletores bastam. */
    });

    await page.screenshot({
      path: testInfo.outputPath(`${options.screenshotName}.png`),
      fullPage: true,
    });

    const report: HydrowayRouteSmokeReport = {
      pageErrors: [...pageErrors],
      consoleErrors: [...consoleErrors],
      http500Urls: [...http500Urls],
      documentStatus,
    };

    attachSmokeReport(testInfo, report);

    expect(pageErrors, `pageerror em ${routePath}`).toEqual([]);
    expect(consoleErrors, `console.error MapLibre/Style em ${routePath}`).toEqual([]);
    expect(http500Urls, `HTTP 500 em ${routePath}`).toEqual([]);

    if (options.expectDocumentOk !== false) {
      expect(documentStatus, `status do documento em ${routePath}`).not.toBe(404);
      expect(documentStatus, `status do documento em ${routePath}`).toBeLessThan(500);
    }

    return report;
  } finally {
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    page.off('response', onResponse);
  }
}

export async function expectNoHydrowaySpikeDevUi(page: Page) {
  await expect(page.getByTestId('hydroway-map-spike')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Hydroway Map Spike/i })).toHaveCount(0);
}
