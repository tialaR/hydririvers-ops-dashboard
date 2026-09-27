#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseUrl = process.env.PAGE62_STORYBOOK_URL || 'http://127.0.0.1:6106';
const evidenceDir = path.resolve(root, 'reports/sharklock-evidence/page-62/overview-composition');

await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1024 },
  deviceScaleFactor: 1,
});

const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(error.message));

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

try {
  const indexResponse = await fetch(`${baseUrl}/index.json`);
  if (!indexResponse.ok) throw new Error(`Storybook index unavailable: ${indexResponse.status}`);
  const storyIndex = await indexResponse.json();
  const story = Object.values(storyIndex.entries || {}).find(
    (entry) =>
      entry.type === 'story' &&
      entry.title === 'Page 62/Shipper Journey' &&
      normalize(entry.name) === normalize('Overview'),
  );
  if (!story) throw new Error('Overview story not found');

  await page.goto(`${baseUrl}/iframe.html?id=${story.id}&viewMode=story`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.evaluate(() => document.fonts.ready);

  const rootLocator = page.locator('[data-testid="page62-overview"]').first();
  await rootLocator.waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[data-testid="overview-hydro-chart-card"] [data-echart-renderer="svg"]').first().waitFor({
    state: 'visible',
    timeout: 20000,
  });

  const metrics = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };

    const metricCells = Array.from(document.querySelectorAll('[data-testid="overview-kpi-strip"] article')).map((node) => {
      const box = node.getBoundingClientRect();
      const value = node.querySelector('strong');
      return {
        width: box.width,
        height: box.height,
        valueFont: value ? Number.parseFloat(getComputedStyle(value).fontSize) : 0,
      };
    });

    const action = document.querySelector('[data-testid="overview-action-panel"]');
    const mapPanel = document.querySelector('[data-testid="overview-map-panel"]');
    const workspace = document.querySelector('[data-testid="overview-workspace"]');
    const chart = document.querySelector('[data-testid="overview-hydro-chart-card"] [data-echart-renderer]');
    const mapSvg = document.querySelector('[data-testid="overview-map-surface"] svg[role="img"]');
    const rootElement = document.documentElement;

    return {
      root: rect('[data-testid="page62-overview"]'),
      workspace: rect('[data-testid="overview-workspace"]'),
      kpiStrip: rect('[data-testid="overview-kpi-strip"]'),
      mapPanel: rect('[data-testid="overview-map-panel"]'),
      mapSurface: rect('[data-testid="overview-map-surface"]'),
      actionPanel: rect('[data-testid="overview-action-panel"]'),
      chartCard: rect('[data-testid="overview-hydro-chart-card"]'),
      chart: chart ? (() => {
        const box = chart.getBoundingClientRect();
        return {
          width: box.width,
          height: box.height,
          renderer: chart.getAttribute('data-echart-renderer'),
        };
      })() : null,
      metricCells,
      sourceCount: document.querySelectorAll('[data-testid="overview-hydro-chart-card"] footer > span').length,
      mapSvgVisible: Boolean(mapSvg && mapSvg.getBoundingClientRect().width > 100),
      workspaceBackgroundImage: workspace ? getComputedStyle(workspace).backgroundImage : null,
      actionBackground: action ? getComputedStyle(action).backgroundColor : null,
      mapPanelBackground: mapPanel ? getComputedStyle(mapPanel).backgroundColor : null,
      overflowX: rootElement.scrollWidth - rootElement.clientWidth,
    };
  });

  const failures = [];
  if (!metrics.root || metrics.root.width < 1180) failures.push('overview root is too narrow at desktop');
  if (!metrics.workspace || metrics.workspace.width < 780) failures.push('overview workspace is compressed');
  if (!metrics.kpiStrip || metrics.metricCells.length !== 5) failures.push('five-metric operational strip missing');
  if (metrics.metricCells.some((cell) => cell.height < 96)) failures.push('metric strip cells are vertically compressed');
  if (metrics.metricCells.some((cell) => cell.valueFont < 24)) failures.push('metric values lack visual hierarchy');
  if (!metrics.mapSurface || metrics.mapSurface.width < 500 || metrics.mapSurface.height < 390) failures.push('operational map lacks useful area');
  if (!metrics.mapSvgVisible) failures.push('deterministic operational map fallback is not visible');
  if (!metrics.actionPanel || !metrics.mapPanel) failures.push('overview hero composition incomplete');
  if (metrics.actionPanel && metrics.workspace && metrics.actionPanel.width > metrics.workspace.width * 0.4) failures.push('attention panel dominates the overview');
  if (metrics.actionPanel && metrics.mapPanel && metrics.actionBackground !== metrics.mapPanelBackground) failures.push('attention panel uses a competing background instead of the neutral surface');
  if (!metrics.chart || metrics.chart.width < 700 || metrics.chart.height < 300) failures.push('hydro chart is not visually dominant enough');
  if (metrics.chart?.renderer !== 'svg') failures.push('overview hydro chart must use SVG renderer');
  if (metrics.sourceCount < 4) failures.push('operational source context is incomplete');
  if (metrics.workspaceBackgroundImage && metrics.workspaceBackgroundImage !== 'none') failures.push('decorative workspace gradient regressed into Overview');
  if (metrics.overflowX > 4) failures.push(`horizontal overflow ${metrics.overflowX}px`);

  const relevantConsoleErrors = consoleErrors.filter(
    (entry) => !/Failed to load resource|ERR_NAME_NOT_RESOLVED|net::ERR_/i.test(entry),
  );
  if (relevantConsoleErrors.length) failures.push(`runtime console errors: ${relevantConsoleErrors.length}`);

  const screenshotPath = path.resolve(evidenceDir, 'page62-overview-composition.png');
  await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled', caret: 'hide' });

  const report = {
    gate: 'PAGE62-OVERVIEW-COMPOSITION-v1',
    status: failures.length ? 'FAIL' : 'PASS',
    failures,
    metrics,
    screenshot: path.relative(root, screenshotPath),
  };

  await writeFile(
    path.resolve(evidenceDir, 'page62-overview-composition-result.json'),
    JSON.stringify(report, null, 2) + '\n',
  );

  console.log(`${report.status} Page 62 Overview Composition`, {
    map: metrics.mapSurface,
    action: metrics.actionPanel,
    chart: metrics.chart,
    metricCells: metrics.metricCells.length,
    sources: metrics.sourceCount,
    overflowX: metrics.overflowX,
  });
  failures.forEach((failure) => console.log('- ' + failure));

  process.exitCode = failures.length ? 1 : 0;
} finally {
  await browser.close();
}
