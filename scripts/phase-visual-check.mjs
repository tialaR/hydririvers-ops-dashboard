#!/usr/bin/env node
/**
 * Fluxo visual assistido (temporário): captura hero do detalhe da carga.
 *
 * Pré-requisito: app acessível (ex.: `npm run dev` → http://127.0.0.1:3000).
 * Não inicia servidor automaticamente (evita colidir com portas / e2e :3100).
 *
 * Uso:
 *   BASE_URL=http://127.0.0.1:3000 node scripts/phase-visual-check.mjs
 *   npm run visual:hero-check
 *
 * Saída: .phase-visual-check/cargo-001-desktop.png | cargo-001-mobile.png
 */

import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, '.phase-visual-check');
const baseUrl = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const path = '/pt-BR/cargas/cargo-001';
const url = `${baseUrl}${path}`;

/** Texto estável quando o hero hidratou (pt-BR). */
function heroReadyPredicate() {
  const t = document.body?.innerText ?? '';
  return t.includes('cargo-001') && t.includes('do trajeto');
}

async function capture(viewport, filename) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForFunction(heroReadyPredicate, null, { timeout: 120000 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: join(outDir, filename),
      fullPage: true
    });
    console.log(`OK ${filename} (${viewport.width}×${viewport.height})`);
  } finally {
    await browser.close();
  }
}

await mkdir(outDir, { recursive: true });
console.log(`Base: ${baseUrl}\nRota: ${path}\nPasta: ${outDir}\n`);

await capture({ width: 1600, height: 900 }, 'cargo-001-desktop.png');
await capture({ width: 390, height: 844 }, 'cargo-001-mobile.png');

console.log('\nConcluído. Revise os PNG em .phase-visual-check/');
