#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseUrl = process.env.PAGE62_STORYBOOK_URL || process.env.PAGE61_STORYBOOK_URL || 'http://127.0.0.1:6106';
const evidenceDir = path.resolve(root, 'reports/sharklock-evidence/page-62/d04-d05');

const policy = {
  perceptualThreshold: 0.20,
  perceptualNeighborRadius: 1,
  maxDiffRatio: 0.05,
  maxRmse: 0.11,
  geometryTolerancePx: 2,
};

const surfaces = [
  {
    name: 'D04 Cargo Cockpit',
    storyId: 'page-62-d04-cargo-cockpit--reference',
    selector: '[data-testid="page62-d04-contract"]',
    referencePath: 'docs/governance/figma-freeze/page-62/d04-cargo-cockpit-reference.webp',
    geometry: { width: 380, height: 414 },
  },
  {
    name: 'D05 Operational Timeline',
    storyId: 'page-62-d05-operational-timeline--reference',
    selector: '[data-testid="page62-d05-contract"]',
    referencePath: 'docs/governance/figma-freeze/page-62/d05-operational-timeline-reference.webp',
    geometry: { width: 354, height: 414 },
  },
  {
    name: 'D06 Documents & Evidence',
    storyId: 'page-62-d06-documents-evidence--reference',
    selector: '[data-testid="page62-d06-contract"]',
    referencePath: 'docs/governance/figma-freeze/page-62/d06-documents-reference.webp',
    geometry: { width: 600, height: 548 },
  },
  {
    name: 'D07 Risk & Occurrence',
    storyId: 'page-62-d07-risk-occurrence--reference',
    selector: '[data-testid="page62-d07-contract"]',
    referencePath: 'docs/governance/figma-freeze/page-62/d07-occurrence-reference.webp',
    geometry: { width: 660, height: 548 },
  },
];

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const results = [];

  for (const surface of surfaces) {
    const page = await browser.newPage({
      viewport: { width: Math.max(surface.geometry.width + 120, 640), height: 720 },
      deviceScaleFactor: 1,
    });

    await page.goto(`${baseUrl}/iframe.html?id=${surface.storyId}&viewMode=story`, {
      waitUntil: 'domcontentloaded',
    });
    await page.evaluate(() => document.fonts.ready);

    const target = page.locator(surface.selector).first();
    await target.waitFor({ state: 'visible', timeout: 20000 });
    const box = await target.boundingBox();
    if (!box) throw new Error(`${surface.name}: missing bounding box`);

    const slug = surface.storyId.replace(/[^a-z0-9-]+/gi, '-');
    const runtimePath = path.resolve(evidenceDir, `${slug}-runtime.png`);
    const diffPath = path.resolve(evidenceDir, `${slug}-diff.png`);
    const runtime = await target.screenshot({
      path: runtimePath,
      animations: 'disabled',
      caret: 'hide',
    });
    const reference = await readFile(path.resolve(root, surface.referencePath));

    const diffPage = await browser.newPage({
      viewport: {
        width: Math.floor(surface.geometry.width / 2),
        height: Math.floor(surface.geometry.height / 2),
      },
    });

    const metrics = await diffPage.evaluate(async (args) => {
      const loadImage = (source, mime) =>
        new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('image decode failed'));
          image.src = `data:${mime};base64,${source}`;
        });

      const [refImage, runImage] = await Promise.all([
        loadImage(args.reference, 'image/webp'),
        loadImage(args.runtime, 'image/png'),
      ]);

      const width = refImage.width;
      const height = refImage.height;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      context.drawImage(refImage, 0, 0, width, height);
      const ref = context.getImageData(0, 0, width, height).data;
      context.clearRect(0, 0, width, height);
      context.drawImage(runImage, 0, 0, width, height);
      const run = context.getImageData(0, 0, width, height).data;

      const diffCanvas = document.createElement('canvas');
      diffCanvas.width = width;
      diffCanvas.height = height;
      const diffContext = diffCanvas.getContext('2d');
      const diffImage = diffContext.createImageData(width, height);

      const yiq = (r1, g1, b1, r2, g2, b2) => {
        const dr = r1 - r2;
        const dg = g1 - g2;
        const db = b1 - b2;
        const y = 0.29889531 * dr + 0.58662247 * dg + 0.11448223 * db;
        const i = 0.59597799 * dr - 0.2741761 * dg - 0.32180189 * db;
        const q = 0.21147017 * dr - 0.52261711 * dg + 0.31114694 * db;
        return Math.sqrt(0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q) / 187.66;
      };

      let raw = 0;
      let perceptual = 0;
      let squared = 0;

      for (let offset = 0; offset < ref.length; offset += 4) {
        const red = Math.abs(ref[offset] - run[offset]);
        const green = Math.abs(ref[offset + 1] - run[offset + 1]);
        const blue = Math.abs(ref[offset + 2] - run[offset + 2]);

        if (red !== 0 || green !== 0 || blue !== 0) raw += 1;

        const pixelIndex = offset / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        let distance = yiq(
          ref[offset],
          ref[offset + 1],
          ref[offset + 2],
          run[offset],
          run[offset + 1],
          run[offset + 2],
        );

        for (let dy = -args.radius; dy <= args.radius; dy += 1) {
          for (let dx = -args.radius; dx <= args.radius; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const cx = Math.max(0, Math.min(width - 1, x + dx));
            const cy = Math.max(0, Math.min(height - 1, y + dy));
            const co = (cy * width + cx) * 4;
            distance = Math.min(
              distance,
              yiq(
                ref[offset],
                ref[offset + 1],
                ref[offset + 2],
                run[co],
                run[co + 1],
                run[co + 2],
              ),
            );
          }
        }

        squared += distance * distance;
        const different = distance > args.threshold;
        if (different) perceptual += 1;

        diffImage.data[offset] = different ? Math.min(255, red * 3 + 60) : Math.min(50, red);
        diffImage.data[offset + 1] = different ? Math.min(255, green * 3) : Math.min(50, green);
        diffImage.data[offset + 2] = different ? Math.min(255, blue * 3) : Math.min(50, blue);
        diffImage.data[offset + 3] = 255;
      }

      diffContext.putImageData(diffImage, 0, 0);
      const count = width * height;

      return {
        referenceDimensions: { width, height },
        runtimeDimensions: { width: runImage.width, height: runImage.height },
        rawDivergentPixels: raw,
        perceptualDivergentPixels: perceptual,
        perceptualDiffRatio: perceptual / count,
        perceptualRmse: Math.sqrt(squared / count),
        diffDataUrl: diffCanvas.toDataURL('image/png'),
      };
    }, {
      reference: reference.toString('base64'),
      runtime: runtime.toString('base64'),
      threshold: policy.perceptualThreshold,
      radius: policy.perceptualNeighborRadius,
    });

    await writeFile(
      diffPath,
      Buffer.from(metrics.diffDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'),
    );
    delete metrics.diffDataUrl;

    const geometryPass =
      Math.abs(box.width - surface.geometry.width) <= policy.geometryTolerancePx &&
      Math.abs(box.height - surface.geometry.height) <= policy.geometryTolerancePx;

    const visualPass =
      metrics.perceptualDiffRatio <= policy.maxDiffRatio &&
      metrics.perceptualRmse <= policy.maxRmse;

    results.push({
      ...surface,
      runtimeBox: box,
      geometryPass,
      visualPass,
      pass: geometryPass && visualPass,
      metrics,
      artifacts: {
        reference: surface.referencePath,
        runtime: path.relative(root, runtimePath),
        diff: path.relative(root, diffPath),
      },
    });

    await page.close();
    await diffPage.close();
  }

  const report = {
    gate: 'PAGE62-D04-D07-STORYBOOK-VISUAL-v2',
    referenceSourceSha256: 'dd3371bcdcb43273d9e6307a04b2a32dd947ba1245be42d0081f8e7dfe21b132',
    policy,
    status: results.every((result) => result.pass) ? 'PASS' : 'FAIL',
    results,
  };

  await writeFile(
    path.resolve(evidenceDir, 'page62-d04-d07-visual-result.json'),
    JSON.stringify(report, null, 2) + '\n',
  );

  for (const result of results) {
    console.log(
      `${result.pass ? 'PASS' : 'FAIL'} ${result.name}: geometry=${result.geometryPass ? 'PASS' : 'FAIL'} perceptual=${(result.metrics.perceptualDiffRatio * 100).toFixed(3)}% rmse=${result.metrics.perceptualRmse.toFixed(6)}`,
    );
  }

  process.exitCode = report.status === 'PASS' ? 0 : 1;
} finally {
  await browser.close();
}
