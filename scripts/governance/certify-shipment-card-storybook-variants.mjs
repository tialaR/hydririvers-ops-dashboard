#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseUrl = process.env.PAGE61_STORYBOOK_URL || 'http://127.0.0.1:6106';
const evidenceDir = path.resolve(root, 'reports/sharklock-evidence/page-61/shipment-card-variants');
const geometry = { width: 386, height: 232, tolerancePx: 2 };
const variants = [
  { name: 'Attention', storyId: 'cargo-shipment-card--attention', tone: 'delayed' },
  { name: 'InTransit', storyId: 'cargo-shipment-card--in-transit', tone: 'inTransit' },
  { name: 'Delivered', storyId: 'cargo-shipment-card--delivered', tone: 'completed' },
  { name: 'Open', storyId: 'cargo-shipment-card--open', tone: 'open' },
  { name: 'Blocked', storyId: 'cargo-shipment-card--blocked', tone: 'blocked' },
];

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const results = [];
  for (const item of variants) {
    const page = await browser.newPage({ viewport: { width: 520, height: 420 } });
    await page.goto(`${baseUrl}/iframe.html?id=${item.storyId}&viewMode=story`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);

    const card = page.locator('[data-testid="shipment-card"]').first();
    const status = page.locator('[data-testid="shipment-card-status"]').first();
    await card.waitFor({ state: 'visible', timeout: 20000 });
    await status.waitFor({ state: 'visible', timeout: 20000 });

    const box = await card.boundingBox();
    if (!box) throw new Error(`${item.name}: missing ShipmentCard bounding box`);
    const tone = await status.getAttribute('data-tone');
    const stateBrands = await card.locator('[data-state-code]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-state-code')),
    );
    const pseudoBorderColor = await status.evaluate((node) =>
      getComputedStyle(node, '::before').borderTopColor,
    );

    const geometryPass =
      Math.abs(box.width - geometry.width) <= geometry.tolerancePx &&
      Math.abs(box.height - geometry.height) <= geometry.tolerancePx;
    const semanticPass = tone === item.tone;
    const brandsPass = stateBrands.includes('AM') && stateBrands.includes('PA');

    const screenshot = path.resolve(evidenceDir, `${item.storyId}.png`);
    await card.screenshot({ path: screenshot, animations: 'disabled', caret: 'hide' });

    results.push({
      ...item,
      runtimeBox: box,
      geometryPass,
      semanticPass,
      brandsPass,
      pseudoBorderColor,
      pass: geometryPass && semanticPass && brandsPass,
      screenshot: path.relative(root, screenshot),
    });
    await page.close();
  }

  const criticalColors = Object.fromEntries(
    results
      .filter((result) => ['delayed', 'inTransit', 'completed'].includes(result.tone))
      .map((result) => [result.tone, result.pseudoBorderColor]),
  );
  const uniqueCriticalColors = new Set(Object.values(criticalColors)).size === 3;

  const report = {
    gate: 'SHIPMENT-CARD-STORYBOOK-VARIANTS-v1',
    status: results.every((result) => result.pass) && uniqueCriticalColors ? 'PASS' : 'FAIL',
    geometry,
    uniqueCriticalColors,
    criticalColors,
    results,
  };

  await writeFile(
    path.resolve(evidenceDir, 'shipment-card-variant-result.json'),
    JSON.stringify(report, null, 2) + '\n',
  );

  for (const result of results) {
    console.log(
      `${result.pass ? 'PASS' : 'FAIL'} ${result.name}: tone=${result.tone} color=${result.pseudoBorderColor} geometry=${result.runtimeBox.width}x${result.runtimeBox.height} brands=${result.brandsPass ? 'PASS' : 'FAIL'}`,
    );
  }
  console.log(`${uniqueCriticalColors ? 'PASS' : 'FAIL'} critical semantic colors are distinct`);

  process.exitCode = report.status === 'PASS' ? 0 : 1;
} finally {
  await browser.close();
}
