#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const evidenceDir = path.resolve(root, 'reports/sharklock-evidence/page-61');
const referencePath = path.resolve(root, 'docs/governance/figma-freeze/page-61/m01-desktop-foundation-parity-review.png');
const runtimePath = path.resolve(evidenceDir, 'runtime-219-254-1440x1024.png');
const diffPath = path.resolve(evidenceDir, 'visual-diff-219-254.png');
const metricsPath = path.resolve(evidenceDir, 'metrics.json');
const resultPath = path.resolve(evidenceDir, 'sharklock-result.json');
const frozenSha256 = '066177797caac3f5349f6a2d9c3f154c82e7bd4e315413dc669e50b09d772066';
const candidateSha = process.env.SHARKLOCK_CANDIDATE_SHA ?? '';

const regions = [
  { owner: 'OwnedCargoShipmentCard', x: 279, y: 267, width: 386, height: 737 },
  { owner: 'OwnedCargoDetailTabs', x: 672, y: 504, width: 768, height: 44 },
  { owner: 'OwnedCargoDetailSummary', x: 672, y: 548, width: 768, height: 382 },
  { owner: 'OwnedCargoAttentionPanel', x: 690, y: 930, width: 732, height: 84 },
];

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function writeBlockedResult(reason) {
  await mkdir(evidenceDir, { recursive: true });
  const result = {
    gate: 'SHARKLOCK-v1.0',
    requirementId: 'HY-VIS-61-DESKTOP-FOUNDATION',
    candidateSha,
    chromiumStatus: 'PASS',
    captureStatus: process.env.SHARKLOCK_CAPTURE_OUTCOME === 'success' ? 'PASS' : 'FAIL',
    visualStatus: 'NÃO PROVADO',
    evidenceChainStatus: 'FAIL',
    certificationStatus: 'FAIL',
    blockers: [reason],
  };
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`);
  console.error(`SHARKLOCK FAIL: ${reason}`);
  process.exitCode = 1;
}

if (!candidateSha) {
  await writeBlockedResult('candidate SHA is missing');
} else if (!(await fileExists(referencePath))) {
  await writeBlockedResult('canonical Figma PNG is missing');
} else if (!(await fileExists(runtimePath))) {
  await writeBlockedResult('runtime screenshot is missing');
} else {
  const referenceBytes = await readFile(referencePath);
  const runtimeBytes = await readFile(runtimePath);
  const referenceSha256 = sha256(referenceBytes);

  if (referenceSha256 !== frozenSha256) {
    await writeBlockedResult(`canonical Figma PNG hash mismatch: ${referenceSha256}`);
  } else {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
      await page.setContent('<style>html,body{margin:0;background:#000}canvas{display:block}</style><canvas id="diff" width="1440" height="1024"></canvas>');
      const metrics = await page.evaluate(async ({ reference, runtime, regionsToMeasure }) => {
        const loadImage = (source) => new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('PNG decode failed'));
          image.src = `data:image/png;base64,${source}`;
        });
        const [referenceImage, runtimeImage] = await Promise.all([
          loadImage(reference),
          loadImage(runtime),
        ]);
        if (referenceImage.width !== 1440 || referenceImage.height !== 1024) {
          throw new Error(`reference dimensions are ${referenceImage.width}x${referenceImage.height}`);
        }
        if (runtimeImage.width !== 1440 || runtimeImage.height !== 1024) {
          throw new Error(`runtime dimensions are ${runtimeImage.width}x${runtimeImage.height}`);
        }

        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = 1440;
        sourceCanvas.height = 1024;
        const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
        sourceContext.drawImage(referenceImage, 0, 0);
        const referencePixels = sourceContext.getImageData(0, 0, 1440, 1024).data;
        sourceContext.clearRect(0, 0, 1440, 1024);
        sourceContext.drawImage(runtimeImage, 0, 0);
        const runtimePixels = sourceContext.getImageData(0, 0, 1440, 1024).data;

        const diffCanvas = document.querySelector('#diff');
        const diffContext = diffCanvas.getContext('2d');
        const diffImage = diffContext.createImageData(1440, 1024);
        const accumulators = new Map(regionsToMeasure.map((region) => [region.owner, {
          ...region,
          divergentPixels: 0,
          squaredError: 0,
        }]));
        let divergentPixels = 0;
        let squaredError = 0;

        for (let y = 0; y < 1024; y += 1) {
          for (let x = 0; x < 1440; x += 1) {
            const offset = (y * 1440 + x) * 4;
            const red = Math.abs(referencePixels[offset] - runtimePixels[offset]);
            const green = Math.abs(referencePixels[offset + 1] - runtimePixels[offset + 1]);
            const blue = Math.abs(referencePixels[offset + 2] - runtimePixels[offset + 2]);
            const isDifferent = red !== 0 || green !== 0 || blue !== 0;
            if (isDifferent) divergentPixels += 1;
            const pixelSquaredError = red ** 2 + green ** 2 + blue ** 2;
            squaredError += pixelSquaredError;

            diffImage.data[offset] = Math.min(255, red * 3);
            diffImage.data[offset + 1] = Math.min(255, green * 3);
            diffImage.data[offset + 2] = Math.min(255, blue * 3);
            diffImage.data[offset + 3] = 255;

            for (const region of accumulators.values()) {
              if (x >= region.x && x < region.x + region.width && y >= region.y && y < region.y + region.height) {
                if (isDifferent) region.divergentPixels += 1;
                region.squaredError += pixelSquaredError;
              }
            }
          }
        }
        diffContext.putImageData(diffImage, 0, 0);

        // ImageMagick-compatible normalized RGBA RMSE. Alpha is opaque in both PNGs.
        const normalize = (sum, pixelCount) => Math.sqrt(sum / (pixelCount * 4)) / 255;
        const regional = [...accumulators.values()].map((region) => ({
          owner: region.owner,
          bounds: { x: region.x, y: region.y, width: region.width, height: region.height },
          divergentPixels: region.divergentPixels,
          divergentPercent: (region.divergentPixels / (region.width * region.height)) * 100,
          rmse: normalize(region.squaredError, region.width * region.height),
        })).sort((a, b) => b.divergentPixels - a.divergentPixels);

        return {
          viewport: { width: 1440, height: 1024 },
          divergentPixels,
          divergentPercent: (divergentPixels / (1440 * 1024)) * 100,
          rmse: normalize(squaredError, 1440 * 1024),
          regions: regional,
        };
      }, {
        reference: referenceBytes.toString('base64'),
        runtime: runtimeBytes.toString('base64'),
        regionsToMeasure: regions,
      });

      await page.screenshot({ path: diffPath, animations: 'disabled', caret: 'hide' });
      const visualStatus = metrics.divergentPixels === 0 && metrics.rmse === 0 ? 'PASS' : 'FAIL';
      const evidence = {
        gate: 'SHARKLOCK-v1.0',
        requirementId: 'HY-VIS-61-DESKTOP-FOUNDATION',
        candidateSha,
        source: {
          type: 'FIGMA_CANONICAL',
          fileKey: 'hQA6rajAQLYVUVSR47YSws',
          page: '61',
          frame: 'M01 · Desktop Foundation · Parity Review',
          node: '219:254',
        },
        persona: 'shipper',
        viewport: '1440x1024',
        theme: 'dark',
        route: '/pt-BR/minhas-cargas?visualFixture=page61-219-254',
        chromiumStatus: 'PASS',
        captureStatus: 'PASS',
        referenceArtifact: path.relative(root, referencePath),
        referenceSha256,
        runtimeArtifact: path.relative(root, runtimePath),
        runtimeSha256: sha256(runtimeBytes),
        diffArtifact: path.relative(root, diffPath),
        metricsArtifact: path.relative(root, metricsPath),
        metrics,
        visualStatus,
        evidenceChainStatus: visualStatus,
        certificationStatus: visualStatus,
        blockers: visualStatus === 'PASS' ? [] : ['visual diff exceeds the strict canonical threshold'],
      };
      await writeFile(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
      await writeFile(resultPath, `${JSON.stringify(evidence, null, 2)}\n`);
      console.log(`SHARKLOCK ${visualStatus}: ${metrics.divergentPixels} divergent pixels; RMSE ${metrics.rmse.toFixed(6)}`);
      process.exitCode = visualStatus === 'PASS' ? 0 : 1;
    } finally {
      await browser.close();
    }
  }
}
