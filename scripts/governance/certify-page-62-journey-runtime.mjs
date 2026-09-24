#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseUrl = process.env.PAGE62_STORYBOOK_URL || 'http://127.0.0.1:6106';
const evidenceDir = path.resolve(root, 'reports/sharklock-evidence/page-62/journey-runtime');

const states = [
  {
    name: 'Overview',
    storyKey: 'Overview',
    selector: '[data-testid="page62-overview"]',
    minCharts: 1,
    map: true,
  },
  {
    name: 'D04-D05 Cockpit',
    storyKey: 'D04D05Cockpit',
    selector: '[data-testid="page62-cargo-cockpit"]',
    minCharts: 2,
  },
  {
    name: 'D06-D07 Documents Risk',
    storyKey: 'D06D07DocumentsRisk',
    selector: '[data-testid="page62-d06-documents"]',
    secondarySelector: '[data-testid="page62-d07-occurrence"]',
    minCharts: 0,
  },
  {
    name: 'D08-D09 Negotiation',
    storyKey: 'D08D09Negotiation',
    selector: '[data-testid="page62-d08-d09-negotiation"]',
    minCharts: 1,
  },
  {
    name: 'D10 Action Review',
    storyKey: 'D10ActionReview',
    selector: '[data-testid="page62-d10-review"]',
    minCharts: 0,
  },
  {
    name: 'D11 Action Feedback',
    storyKey: 'D11ActionFeedback',
    selector: '[data-testid="page62-d11-feedback"]',
    minCharts: 1,
  },
  {
    name: 'D12 Correction Resubmit',
    storyKey: 'D12CorrectionResubmit',
    selector: '[data-testid="page62-d12-correction"]',
    minCharts: 1,
  },
  {
    name: 'D13 Monitoring',
    storyKey: 'D13Monitoring',
    selector: '[data-testid="page62-d13-monitoring"]',
    minCharts: 1,
  },
];

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

const normalizeStoryName = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const indexResponse = await fetch(`${baseUrl}/index.json`);
if (!indexResponse.ok) throw new Error(`Storybook index unavailable: ${indexResponse.status}`);
const storyIndex = await indexResponse.json();
const storyEntries = Object.values(storyIndex.entries || {}).filter(
  (entry) => entry.type === 'story' && entry.title === 'Page 62/Shipper Journey',
);

function resolveStoryId(storyKey) {
  const normalized = normalizeStoryName(storyKey);
  const entry = storyEntries.find((candidate) => normalizeStoryName(candidate.name) === normalized);
  if (!entry) {
    throw new Error(`Storybook journey story not found: ${storyKey}. Available: ${storyEntries.map((item) => item.name).join(', ')}`);
  }
  return entry.id;
}

try {
  for (const state of states) {
    const storyId = resolveStoryId(state.storyKey);
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1024 },
      deviceScaleFactor: 1,
    });

    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto(`${baseUrl}/iframe.html?id=${storyId}&viewMode=story`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.evaluate(() => document.fonts.ready);

    const target = page.locator(state.selector).first();
    await target.waitFor({ state: 'visible', timeout: 20000 });

    if (state.secondarySelector) {
      await page.locator(state.secondarySelector).first().waitFor({ state: 'visible', timeout: 20000 });
    }

    const metrics = await page.evaluate(({ selector, secondarySelector }) => {
      const node = document.querySelector(selector);
      const secondary = secondarySelector ? document.querySelector(secondarySelector) : null;
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      const root = document.documentElement;
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4'));
      const headingSizes = headings
        .map((heading) => Number.parseFloat(getComputedStyle(heading).fontSize))
        .filter(Number.isFinite);
      const canvases = Array.from(document.querySelectorAll('canvas'))
        .map((canvas) => {
          const box = canvas.getBoundingClientRect();
          return { width: box.width, height: box.height };
        })
        .filter((box) => box.width > 16 && box.height > 16);

      return {
        width: rect.width,
        height: rect.height,
        secondaryVisible: secondary ? secondary.getBoundingClientRect().width > 0 : true,
        documentWidth: root.scrollWidth,
        viewportWidth: root.clientWidth,
        overflowX: root.scrollWidth - root.clientWidth,
        minHeadingPx: headingSizes.length ? Math.min(...headingSizes) : 0,
        maxHeadingPx: headingSizes.length ? Math.max(...headingSizes) : 0,
        canvasCount: canvases.length,
        canvases,
        mapSurfaceCount: document.querySelectorAll('[aria-label^="Mapa operacional"]').length,
      };
    }, { selector: state.selector, secondarySelector: state.secondarySelector || null });

    const failures = [];
    if (!metrics) failures.push('primary surface missing');
    else {
      if (metrics.width < 300 || metrics.height < 180) failures.push('surface geometry collapsed');
      if (!metrics.secondaryVisible) failures.push('secondary surface missing');
      if (metrics.overflowX > 4) failures.push(`horizontal overflow ${metrics.overflowX}px`);
      if (metrics.minHeadingPx > 0 && metrics.minHeadingPx < 13) failures.push(`heading too small ${metrics.minHeadingPx}px`);
      if (metrics.canvasCount < state.minCharts) failures.push(`expected at least ${state.minCharts} chart canvas, found ${metrics.canvasCount}`);
      if (state.map && metrics.mapSurfaceCount < 1) failures.push('MapLibre/fallback surface missing');
    }

    const relevantConsoleErrors = consoleErrors.filter(
      (entry) => !/Failed to load resource|ERR_NAME_NOT_RESOLVED|net::ERR_/i.test(entry),
    );
    if (relevantConsoleErrors.length) failures.push(`runtime console errors: ${relevantConsoleErrors.length}`);

    const slug = storyId.replace(/[^a-z0-9-]+/gi, '-');
    const screenshotPath = path.resolve(evidenceDir, `${slug}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled', caret: 'hide' });

    results.push({
      name: state.name,
      storyKey: state.storyKey,
      storyId,
      pass: failures.length === 0,
      failures,
      metrics,
      screenshot: path.relative(root, screenshotPath),
    });

    await page.close();
  }

  const report = {
    gate: 'PAGE62-JOURNEY-RUNTIME-VISUAL-v1',
    status: results.every((result) => result.pass) ? 'PASS' : 'FAIL',
    results,
  };

  await writeFile(
    path.resolve(evidenceDir, 'page62-journey-runtime-result.json'),
    JSON.stringify(report, null, 2) + '\n',
  );

  for (const result of results) {
    console.log(
      `${result.pass ? 'PASS' : 'FAIL'} ${result.name}: charts=${result.metrics?.canvasCount ?? 0} overflow=${result.metrics?.overflowX ?? '?'}px`,
    );
    result.failures.forEach((failure) => console.log(`  - ${failure}`));
  }

  process.exitCode = report.status === 'PASS' ? 0 : 1;
} finally {
  await browser.close();
}
