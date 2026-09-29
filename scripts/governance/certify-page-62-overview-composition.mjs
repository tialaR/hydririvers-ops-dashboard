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
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector('[data-testid="overview-map-surface"] .maplibregl-canvas');
      const svg = document.querySelector('[data-testid="overview-map-surface"] .hydroway-map-spike-svg');
      const canvasWidth = canvas?.getBoundingClientRect().width ?? 0;
      const svgWidth = svg?.getBoundingClientRect().width ?? 0;
      return canvasWidth > 100 || svgWidth > 100;
    },
    null,
    { timeout: 20000 },
  );
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
    const mapStage = document.querySelector('[data-testid="overview-map-surface"] [data-testid="hydroway-map-product-stage"]');
    const mapSvg = document.querySelector('[data-testid="overview-map-surface"] .hydroway-map-spike-svg');
    const mapCanvas = document.querySelector('[data-testid="overview-map-surface"] .maplibregl-canvas');
    const filterButtons = Array.from(document.querySelectorAll('[data-testid="overview-filter-tabs"] button'));
    const attentionBadge = document.querySelector('[data-testid="overview-attention-badge"]');
    const rootElement = document.documentElement;

    return {
      root: rect('[data-testid="page62-overview"]'),
      workspace: rect('[data-testid="overview-workspace"]'),
      kpiStrip: rect('[data-testid="overview-kpi-strip"]'),
      mapPanel: rect('[data-testid="overview-map-panel"]'),
      mapSurface: rect('[data-testid="overview-map-surface"]'),
      actionPanel: rect('[data-testid="overview-action-panel"]'),
      attentionBadge: rect('[data-testid="overview-attention-badge"]'),
      filterTabs: rect('[data-testid="overview-filter-tabs"]'),
      filterButtons: filterButtons.map((node) => {
        const box = node.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }),
      metricCells,
      richMapStageVisible: Boolean(mapStage && mapStage.getBoundingClientRect().width > 500),
      mapRendererVisible: Boolean(
        (mapCanvas && mapCanvas.getBoundingClientRect().width > 100) ||
        (mapSvg && mapSvg.getBoundingClientRect().width > 100)
      ),
      workspaceBackgroundImage: workspace ? getComputedStyle(workspace).backgroundImage : null,
      actionBackground: action ? getComputedStyle(action).backgroundColor : null,
      mapPanelBackground: mapPanel ? getComputedStyle(mapPanel).backgroundColor : null,
      overflowX: rootElement.scrollWidth - rootElement.clientWidth,
      actionGap: (() => {
        const kpi = document.querySelector('[data-testid="overview-kpi-strip"]')?.getBoundingClientRect();
        const alert = document.querySelector('[data-testid="overview-action-panel"]')?.getBoundingClientRect();
        return kpi && alert ? alert.top - kpi.bottom : null;
      })(),
    };
  });

  await page.locator('[data-control-key="layers"]').click();
  const layerPanelLocator = page.locator('[data-testid="hydroway-layer-panel"]').first();
  await layerPanelLocator.waitFor({ state: 'visible', timeout: 10000 });
  const mapChrome = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="hydroway-layer-panel"]');
    const layerControl = document.querySelector('[data-control-key="layers"]');
    const surface = layerControl?.querySelector('span');
    if (!panel || !layerControl || !surface) return null;
    const panelStyle = getComputedStyle(panel);
    const surfaceStyle = getComputedStyle(surface);
    const surfaceRect = surface.getBoundingClientRect();
    return {
      panelClientHeight: panel.clientHeight,
      panelScrollHeight: panel.scrollHeight,
      panelOverflowY: panelStyle.overflowY,
      layerModeCount: panel.querySelectorAll('[data-testid^="hydroway-layer-mode-"]').length,
      controlWidth: surfaceRect.width,
      controlHeight: surfaceRect.height,
      controlRadius: Number.parseFloat(surfaceStyle.borderRadius),
    };
  });
  await page.locator('[data-control-key="layers"]').click();

  const failures = [];
  if (!metrics.root || metrics.root.width < 1180) failures.push('overview root is too narrow at desktop');
  if (!metrics.workspace || metrics.workspace.width < 780) failures.push('overview workspace is compressed');
  if (!metrics.filterTabs || metrics.filterButtons.length !== 4) failures.push('four shipment status tabs are missing');
  if (metrics.filterButtons.length === 4) {
    const yValues = metrics.filterButtons.map((button) => button.y);
    if (Math.max(...yValues) - Math.min(...yValues) > 4) failures.push('shipment filters regressed from one horizontal row');
  }
  if (!metrics.attentionBadge || metrics.attentionBadge.width < 110 || metrics.attentionBadge.height < 28) failures.push('attention summary lacks deliberate prominence');
  if (!metrics.kpiStrip || metrics.metricCells.length !== 4) failures.push('four-metric overview strip missing');
  if (metrics.metricCells.some((cell) => cell.height < 88)) failures.push('metric strip cells are vertically compressed');
  if (metrics.metricCells.some((cell) => cell.valueFont < 24)) failures.push('metric values lack visual hierarchy');
  if (!metrics.mapSurface || metrics.mapSurface.width < 740 || metrics.mapSurface.height < 500) failures.push('operational map is not the dominant overview surface');
  if (!metrics.mapPanel || !metrics.workspace || metrics.mapPanel.width < metrics.workspace.width * 0.92) failures.push('operational map does not occupy the available overview width');
  if (!metrics.richMapStageVisible) failures.push('shared MapLibre product stage is not mounted in Overview');
  if (!metrics.mapRendererVisible) failures.push('neither MapLibre nor deterministic SVG fallback is visible');
  if (!metrics.actionPanel || !metrics.mapPanel) failures.push('overview action context is incomplete');
  if (metrics.mapPanel && metrics.kpiStrip && metrics.mapPanel.y >= metrics.kpiStrip.y) failures.push('map must appear before KPI strip');
  if (metrics.kpiStrip && metrics.actionPanel && metrics.kpiStrip.y >= metrics.actionPanel.y) failures.push('KPI strip must appear before attention rail');
  if (metrics.actionPanel && metrics.workspace && metrics.actionPanel.width < metrics.workspace.width * 0.92) failures.push('attention context should read as a horizontal rail, not a sidebar');
  if (metrics.actionPanel && metrics.actionPanel.height > 150) failures.push('overview attention rail is too tall for summary context');
  if (metrics.actionGap === null || metrics.actionGap < 12) failures.push(`overview alert spacing collapsed: ${metrics.actionGap ?? 'missing'}px`);
  if (!mapChrome) {
    failures.push('desktop map controls/layer panel contract unavailable');
  } else {
    if (mapChrome.layerModeCount !== 5) failures.push(`layer panel mode count mismatch: ${mapChrome.layerModeCount}`);
    if (mapChrome.panelScrollHeight > mapChrome.panelClientHeight + 2) {
      failures.push(`layer panel still requires vertical scrolling: ${mapChrome.panelScrollHeight}/${mapChrome.panelClientHeight}px`);
    }
    if (mapChrome.panelOverflowY === 'scroll' || mapChrome.panelOverflowY === 'auto') {
      failures.push(`layer panel retains legacy vertical overflow: ${mapChrome.panelOverflowY}`);
    }
    if (mapChrome.controlRadius >= mapChrome.controlWidth / 2 - 2) {
      failures.push(`desktop map control regressed to circular shape: radius ${mapChrome.controlRadius}px`);
    }
  }
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
    metricCells: metrics.metricCells.length,
    overflowX: metrics.overflowX,
    actionGap: metrics.actionGap,
    mapChrome,
  });
  failures.forEach((failure) => console.log('- ' + failure));

  process.exitCode = failures.length ? 1 : 0;
} finally {
  await browser.close();
}
