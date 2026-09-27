#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseUrl = process.env.PAGE62_STORYBOOK_URL || 'http://127.0.0.1:6106';
const evidenceDir = path.resolve(root, 'reports/sharklock-evidence/page-62/cockpit-composition');

await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const indexResponse = await fetch(`${baseUrl}/index.json`);
  if (!indexResponse.ok) throw new Error(`Storybook index unavailable: ${indexResponse.status}`);
  const index = await indexResponse.json();
  const entry = Object.values(index.entries || {}).find(
    (candidate) =>
      candidate.type === 'story' &&
      candidate.title === 'Page 62/Shipper Journey' &&
      String(candidate.name).replace(/[^a-z0-9]+/gi, '').toLowerCase() === 'd04d05cockpit',
  );

  if (!entry) throw new Error('D04D05Cockpit story not found');

  const page = await browser.newPage({
    viewport: { width: 1440, height: 1024 },
    deviceScaleFactor: 1,
  });

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(`${baseUrl}/iframe.html?id=${entry.id}&viewMode=story`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.evaluate(() => document.fonts.ready);

  const rootNode = page.locator('[data-testid="page62-cargo-cockpit"]').first();
  await rootNode.waitFor({ state: 'visible', timeout: 20000 });

  const metrics = await page.evaluate(() => {
    const rectOf = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      };
    };

    const workspace = rectOf('[data-testid="cockpit-workspace"]');
    const kpiGrid = rectOf('[data-testid="cockpit-kpi-grid"]');
    const telemetry = rectOf('[data-testid="cockpit-telemetry-card"]');
    const route = rectOf('[data-testid="cockpit-route-context"]');
    const attention = rectOf('[data-testid="cockpit-attention"]');
    const evidence = rectOf('[data-testid="cockpit-evidence"]');
    const kpis = [
      rectOf('[data-testid="cockpit-kpi-progress"]'),
      rectOf('[data-testid="cockpit-kpi-eta"]'),
      rectOf('[data-testid="cockpit-kpi-signal"]'),
      rectOf('[data-testid="cockpit-kpi-risk"]'),
    ];

    const canvas = document.querySelector('[data-testid="cockpit-telemetry-card"] canvas');
    const canvasRect = canvas?.getBoundingClientRect() ?? null;

    const overlap = (a, b) => {
      if (!a || !b) return false;
      return !(
        a.right <= b.x ||
        b.right <= a.x ||
        a.bottom <= b.y ||
        b.bottom <= a.y
      );
    };

    const telemetryTitle = document.querySelector('[data-testid="cockpit-telemetry-card"] header strong');
    const kpiValues = Array.from(document.querySelectorAll('[data-testid^="cockpit-kpi-"] > strong, [data-testid="cockpit-kpi-progress"] .progressBody strong'));

    return {
      workspace,
      kpiGrid,
      telemetry,
      route,
      attention,
      evidence,
      kpis,
      canvas: canvasRect ? { width: canvasRect.width, height: canvasRect.height } : null,
      telemetryTitlePx: telemetryTitle ? Number.parseFloat(getComputedStyle(telemetryTitle).fontSize) : 0,
      kpiValueSizes: kpiValues.map((node) => Number.parseFloat(getComputedStyle(node).fontSize)),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      overlapTelemetryRoute: overlap(telemetry, route),
      overlapRouteAttention: overlap(route, attention),
      overlapAttentionEvidence: overlap(attention, evidence),
      attentionEvidenceVerticalDelta: attention && evidence ? Math.abs(attention.y - evidence.y) : null,
      bodyScrollHeight: document.documentElement.scrollHeight,
      viewportHeight: document.documentElement.clientHeight,
    };
  });

  const failures = [];
  const requireMetric = (name, value) => {
    if (!value) failures.push(`${name} missing`);
  };

  requireMetric('workspace', metrics.workspace);
  requireMetric('kpiGrid', metrics.kpiGrid);
  requireMetric('telemetry', metrics.telemetry);
  requireMetric('route', metrics.route);
  requireMetric('attention', metrics.attention);
  requireMetric('evidence', metrics.evidence);
  requireMetric('chart canvas', metrics.canvas);

  if (metrics.workspace) {
    if (metrics.workspace.width < 900) failures.push(`workspace too narrow: ${metrics.workspace.width.toFixed(1)}px`);
  }

  if (metrics.kpis.every(Boolean) && metrics.workspace) {
    const widths = metrics.kpis.map((item) => item.width);
    const heights = metrics.kpis.map((item) => item.height);
    const maxWidth = Math.max(...widths);
    const minWidth = Math.min(...widths);
    const minHeight = Math.min(...heights);
    if (minHeight < 130) failures.push(`KPI cards too compressed: min height ${minHeight.toFixed(1)}px`);
    if (maxWidth / minWidth > 1.4) failures.push(`KPI widths too imbalanced: ${minWidth.toFixed(1)}-${maxWidth.toFixed(1)}px`);
  }

  if (metrics.telemetry && metrics.workspace) {
    if (metrics.telemetry.width / metrics.workspace.width < 0.88) {
      failures.push(`telemetry does not dominate workspace width: ${(metrics.telemetry.width / metrics.workspace.width * 100).toFixed(1)}%`);
    }
    if (metrics.telemetry.height < 350) failures.push(`telemetry card too short: ${metrics.telemetry.height.toFixed(1)}px`);
  }

  if (metrics.canvas) {
    if (metrics.canvas.width < 820) failures.push(`telemetry canvas too narrow: ${metrics.canvas.width.toFixed(1)}px`);
    if (metrics.canvas.height < 300) failures.push(`telemetry canvas too short: ${metrics.canvas.height.toFixed(1)}px`);
  }

  if (metrics.route && metrics.workspace) {
    if (metrics.route.width / metrics.workspace.width < 0.88) {
      failures.push(`route context should span workspace: ${(metrics.route.width / metrics.workspace.width * 100).toFixed(1)}%`);
    }
  }

  if (metrics.attention && metrics.evidence && metrics.workspace) {
    if (metrics.attention.width / metrics.workspace.width > 0.78) {
      failures.push(`attention dominates too much horizontal space: ${(metrics.attention.width / metrics.workspace.width * 100).toFixed(1)}%`);
    }
    if (metrics.evidence.width / metrics.workspace.width < 0.20) {
      failures.push(`evidence panel too compressed: ${(metrics.evidence.width / metrics.workspace.width * 100).toFixed(1)}%`);
    }
    if ((metrics.attentionEvidenceVerticalDelta ?? 999) > 4) {
      failures.push(`attention/evidence are not aligned on one row: delta ${metrics.attentionEvidenceVerticalDelta?.toFixed(1)}px`);
    }
  }

  if (metrics.telemetryTitlePx < 16) failures.push(`telemetry title too small: ${metrics.telemetryTitlePx}px`);
  if (metrics.kpiValueSizes.length && Math.min(...metrics.kpiValueSizes) < 15) {
    failures.push(`KPI value typography too small: ${Math.min(...metrics.kpiValueSizes)}px`);
  }

  if (metrics.overflowX > 4) failures.push(`horizontal overflow: ${metrics.overflowX}px`);
  if (metrics.overlapTelemetryRoute) failures.push('telemetry overlaps route context');
  if (metrics.overlapRouteAttention) failures.push('route context overlaps attention');
  if (metrics.overlapAttentionEvidence) failures.push('attention overlaps evidence');

  const relevantConsoleErrors = consoleErrors.filter(
    (entryText) => !/Failed to load resource|ERR_NAME_NOT_RESOLVED|net::ERR_/i.test(entryText),
  );
  if (relevantConsoleErrors.length) failures.push(`runtime console errors: ${relevantConsoleErrors.length}`);

  const screenshotPath = path.resolve(evidenceDir, 'page62-cockpit-composition-1440x1024.png');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  });

  const report = {
    gate: 'PAGE62-COCKPIT-COMPOSITION-v1',
    status: failures.length ? 'FAIL' : 'PASS',
    viewport: { width: 1440, height: 1024 },
    principles: {
      dominantTelemetry: true,
      balancedKpis: true,
      routeFullWidth: true,
      secondaryAlertDoesNotDominate: true,
      evidenceReadable: true,
      noOverlap: true,
      noHorizontalOverflow: true,
    },
    metrics,
    failures,
    screenshot: path.relative(root, screenshotPath),
  };

  await writeFile(
    path.resolve(evidenceDir, 'page62-cockpit-composition-result.json'),
    JSON.stringify(report, null, 2) + '\n',
  );

  console.log(`${report.status} Page 62 Cockpit composition`);
  console.log(JSON.stringify(metrics, null, 2));
  failures.forEach((failure) => console.log(`- ${failure}`));

  process.exitCode = failures.length ? 1 : 0;
} finally {
  await browser.close();
}
