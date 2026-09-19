#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const manifestArg = process.argv.slice(2).find((arg) => arg.startsWith('--manifest='));
const manifestName = manifestArg?.slice('--manifest='.length);
if (!manifestName) {
  console.error('SHARKLOCK CAPTURE FAIL: --manifest=<name> is required');
  process.exit(1);
}

const manifest = JSON.parse(await readFile(path.resolve('config/visual-gates', `${manifestName}.json`), 'utf8'));
const baseUrl = manifest.baseUrl ?? 'http://127.0.0.1:3100';
const runtimePath = path.resolve(manifest.runtimeArtifact);
const statusPath = path.resolve(path.dirname(runtimePath), 'capture-status.json');
await mkdir(path.dirname(runtimePath), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: manifest.viewport,
    colorScheme: manifest.theme === 'dark' ? 'dark' : 'light'
  });

  if (Array.isArray(manifest.cookies) && manifest.cookies.length > 0) {
    const hostname = new URL(baseUrl).hostname;
    await context.addCookies(manifest.cookies.map((cookie) => ({
      ...cookie,
      domain: cookie.domain ?? hostname,
      path: cookie.path ?? '/'
    })));
  }

  if (manifest.auth?.type === 'mock-user-id') {
    const response = await context.request.post(`${baseUrl}${manifest.auth.endpoint}`, {
      data: { userId: manifest.auth.userId }
    });
    if (!response.ok()) {
      throw new Error(`mock login returned HTTP ${response.status()}`);
    }
  }

  const page = await context.newPage();
  await page.goto(`${baseUrl}${manifest.route}`, { waitUntil: manifest.waitUntil ?? 'networkidle' });

  for (const selector of manifest.assertVisibleSelectors ?? []) {
    await page.locator(selector).waitFor({ state: 'visible', timeout: manifest.assertTimeoutMs ?? 15000 });
  }
  for (const selector of manifest.denySelectors ?? []) {
    const count = await page.locator(selector).count();
    if (count !== 0) throw new Error(`forbidden runtime selector is present: ${selector}`);
  }

  await page.screenshot({
    path: runtimePath,
    animations: 'disabled',
    caret: 'hide',
    fullPage: false
  });

  await writeFile(statusPath, `${JSON.stringify({
    gate: 'SHARKLOCK-CAPTURE-v1',
    manifest: manifestName,
    status: 'PASS',
    runtimeArtifact: manifest.runtimeArtifact,
    viewport: manifest.viewport,
    route: manifest.route
  }, null, 2)}\n`);
  console.log(`SHARKLOCK CAPTURE PASS: ${manifest.runtimeArtifact}`);
} catch (error) {
  await writeFile(statusPath, `${JSON.stringify({
    gate: 'SHARKLOCK-CAPTURE-v1',
    manifest: manifestName,
    status: 'FAIL',
    error: error instanceof Error ? error.message : String(error)
  }, null, 2)}\n`);
  console.error(`SHARKLOCK CAPTURE FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
