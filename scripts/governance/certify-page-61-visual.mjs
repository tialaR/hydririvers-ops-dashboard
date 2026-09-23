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
const componentResultPath = path.resolve(evidenceDir, 'components/component-visual-result.json');
const frozenSha256 = '066177797caac3f5349f6a2d9c3f154c82e7bd4e315413dc669e50b09d772066';
const candidateSha = process.env.SHARKLOCK_CANDIDATE_SHA ?? '';

const PERCEPTUAL_THRESHOLD = 0.20;
const PERCEPTUAL_NEIGHBOR_RADIUS = 1;
const MAX_PERCEPTUAL_DIFF_RATIO = 0.02;
const MAX_PERCEPTUAL_RMSE = 0.08;

const regions = [
  { owner: 'Shipment cards', x: 279, y: 267, width: 386, height: 737 },
  { owner: 'Detail tabs', x: 672, y: 504, width: 768, height: 44 },
  { owner: 'Selected cargo summary', x: 672, y: 548, width: 768, height: 382 },
  { owner: 'Attention panel', x: 690, y: 930, width: 732, height: 84 },
];

const mapBounds = { x: 672, y: 56, width: 768, height: 448 };
const mapOwnedUi = [
  { name: 'operation label', x: 690, y: 74, width: 178, height: 34 },
  { name: 'risk pill', x: 1334, y: 74, width: 106, height: 34 },
  { name: 'map controls', x: 1388, y: 166, width: 36, height: 122 },
  { name: 'signal legend', x: 690, y: 444, width: 300, height: 42 },
  { name: 'fit route', x: 1328, y: 444, width: 92, height: 34 },
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
    gate: 'SHARKLOCK-v2.0',
    requirementId: 'HY-VIS-61-DESKTOP-FOUNDATION',
    candidateSha,
    chromiumStatus: 'PASS',
    captureStatus: process.env.SHARKLOCK_CAPTURE_OUTCOME === 'success' ? 'PASS' : 'FAIL',
    contractStatus: process.env.SHARKLOCK_CAPTURE_OUTCOME === 'success' ? 'PASS' : 'FAIL',
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

      const metrics = await page.evaluate(async ({
        reference,
        runtime,
        regionsToMeasure,
        mapRect,
        mapUi,
        perceptualThreshold,
        perceptualNeighborRadius,
      }) => {
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

        const inRect = (x, y, rect) =>
          x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;

        const isIgnoredDynamicPixel = (x, y) => {
          if (!inRect(x, y, mapRect)) return false;
          return !mapUi.some((rect) => inRect(x, y, rect));
        };

        const yiqDistance = (r1, g1, b1, r2, g2, b2) => {
          const dr = r1 - r2;
          const dg = g1 - g2;
          const db = b1 - b2;
          const y = 0.29889531 * dr + 0.58662247 * dg + 0.11448223 * db;
          const i = 0.59597799 * dr - 0.2741761 * dg - 0.32180189 * db;
          const q = 0.21147017 * dr - 0.52261711 * dg + 0.31114694 * db;
          return Math.sqrt(0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q) / 187.66;
        };

        const rawRegions = new Map(regionsToMeasure.map((region) => [region.owner, {
          ...region,
          divergentPixels: 0,
          squaredError: 0,
          perceptualDivergentPixels: 0,
          perceptualSquaredError: 0,
          eligiblePixels: 0,
        }]));

        let rawDivergentPixels = 0;
        let rawSquaredError = 0;
        let perceptualDivergentPixels = 0;
        let perceptualSquaredError = 0;
        let eligiblePixels = 0;
        let ignoredDynamicPixels = 0;

        for (let y = 0; y < 1024; y += 1) {
          for (let x = 0; x < 1440; x += 1) {
            const offset = (y * 1440 + x) * 4;
            const rr = referencePixels[offset];
            const rg = referencePixels[offset + 1];
            const rb = referencePixels[offset + 2];
            const cr = runtimePixels[offset];
            const cg = runtimePixels[offset + 1];
            const cb = runtimePixels[offset + 2];

            const red = Math.abs(rr - cr);
            const green = Math.abs(rg - cg);
            const blue = Math.abs(rb - cb);
            const rawDifferent = red !== 0 || green !== 0 || blue !== 0;
            const pixelSquaredError = red ** 2 + green ** 2 + blue ** 2;
            let perceptual = yiqDistance(rr, rg, rb, cr, cg, cb);
            if (perceptualNeighborRadius > 0) {
              for (let dy = -perceptualNeighborRadius; dy <= perceptualNeighborRadius; dy += 1) {
                for (let dx = -perceptualNeighborRadius; dx <= perceptualNeighborRadius; dx += 1) {
                  if (dx === 0 && dy === 0) continue;
                  const candidateX = Math.max(0, Math.min(1439, x + dx));
                  const candidateY = Math.max(0, Math.min(1023, y + dy));
                  const candidateOffset = (candidateY * 1440 + candidateX) * 4;
                  perceptual = Math.min(
                    perceptual,
                    yiqDistance(
                      rr,
                      rg,
                      rb,
                      runtimePixels[candidateOffset],
                      runtimePixels[candidateOffset + 1],
                      runtimePixels[candidateOffset + 2],
                    ),
                  );
                }
              }
            }
            const perceptualDifferent = perceptual > perceptualThreshold;
            const ignored = isIgnoredDynamicPixel(x, y);

            if (rawDifferent) rawDivergentPixels += 1;
            rawSquaredError += pixelSquaredError;

            if (ignored) {
              ignoredDynamicPixels += 1;
              diffImage.data[offset] = 18;
              diffImage.data[offset + 1] = 18;
              diffImage.data[offset + 2] = 18;
              diffImage.data[offset + 3] = 255;
            } else {
              eligiblePixels += 1;
              perceptualSquaredError += perceptual ** 2;
              if (perceptualDifferent) perceptualDivergentPixels += 1;

              diffImage.data[offset] = perceptualDifferent ? Math.min(255, red * 3 + 60) : Math.min(60, red);
              diffImage.data[offset + 1] = perceptualDifferent ? Math.min(255, green * 3) : Math.min(60, green);
              diffImage.data[offset + 2] = perceptualDifferent ? Math.min(255, blue * 3) : Math.min(60, blue);
              diffImage.data[offset + 3] = 255;
            }

            for (const region of rawRegions.values()) {
              if (!inRect(x, y, region)) continue;
              if (rawDifferent) region.divergentPixels += 1;
              region.squaredError += pixelSquaredError;
              if (!ignored) {
                region.eligiblePixels += 1;
                region.perceptualSquaredError += perceptual ** 2;
                if (perceptualDifferent) region.perceptualDivergentPixels += 1;
              }
            }
          }
        }

        diffContext.putImageData(diffImage, 0, 0);

        const normalizeRawRmse = (sum, pixelCount) =>
          Math.sqrt(sum / (pixelCount * 4)) / 255;
        const normalizePerceptualRmse = (sum, pixelCount) =>
          pixelCount > 0 ? Math.sqrt(sum / pixelCount) : 0;

        const regional = [...rawRegions.values()].map((region) => ({
          owner: region.owner,
          bounds: { x: region.x, y: region.y, width: region.width, height: region.height },
          divergentPixels: region.divergentPixels,
          divergentPercent: (region.divergentPixels / (region.width * region.height)) * 100,
          rmse: normalizeRawRmse(region.squaredError, region.width * region.height),
          perceptualDivergentPixels: region.perceptualDivergentPixels,
          perceptualDiffRatio: region.eligiblePixels > 0
            ? region.perceptualDivergentPixels / region.eligiblePixels
            : 0,
          perceptualRmse: normalizePerceptualRmse(region.perceptualSquaredError, region.eligiblePixels),
          eligiblePixels: region.eligiblePixels,
        })).sort((a, b) => b.perceptualDivergentPixels - a.perceptualDivergentPixels);

        return {
          viewport: { width: 1440, height: 1024 },
          raw: {
            divergentPixels: rawDivergentPixels,
            divergentPercent: (rawDivergentPixels / (1440 * 1024)) * 100,
            rmse: normalizeRawRmse(rawSquaredError, 1440 * 1024),
          },
          perceptual: {
            threshold: perceptualThreshold,
            divergentPixels: perceptualDivergentPixels,
            diffRatio: perceptualDivergentPixels / eligiblePixels,
            rmse: normalizePerceptualRmse(perceptualSquaredError, eligiblePixels),
            eligiblePixels,
            ignoredDynamicPixels,
          },
          ignored: {
            mapCartography: mapRect,
            preservedOwnedUi: mapUi,
          },
          regions: regional,
        };
      }, {
        reference: referenceBytes.toString('base64'),
        runtime: runtimeBytes.toString('base64'),
        regionsToMeasure: regions,
        mapRect: mapBounds,
        mapUi: mapOwnedUi,
        perceptualThreshold: PERCEPTUAL_THRESHOLD,
        perceptualNeighborRadius: PERCEPTUAL_NEIGHBOR_RADIUS,
      });

      await page.screenshot({ path: diffPath, animations: 'disabled', caret: 'hide' });

      const perceptualPass =
        metrics.perceptual.diffRatio <= MAX_PERCEPTUAL_DIFF_RATIO &&
        metrics.perceptual.rmse <= MAX_PERCEPTUAL_RMSE;
      const strictPixelPerfectStatus =
        metrics.raw.divergentPixels === 0 && metrics.raw.rmse === 0 ? 'PASS' : 'FAIL';
      const visualStatus = perceptualPass ? 'PASS' : 'FAIL';
      const contractStatus = process.env.SHARKLOCK_CAPTURE_OUTCOME === 'success' ? 'PASS' : 'FAIL';
      let componentReport = null;
      if (await fileExists(componentResultPath)) {
        componentReport = JSON.parse(await readFile(componentResultPath, 'utf8'));
      }
      const componentStatus = componentReport?.status === 'PASS' ? 'PASS' : 'FAIL';
      const certificationPass =
        contractStatus === 'PASS' && visualStatus === 'PASS' && componentStatus === 'PASS';

      const evidence = {
        gate: 'SHARKLOCK-v2.0',
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
        policy: {
          perceptualThreshold: PERCEPTUAL_THRESHOLD,
          perceptualNeighborRadius: PERCEPTUAL_NEIGHBOR_RADIUS,
          maxPerceptualDiffRatio: MAX_PERCEPTUAL_DIFF_RATIO,
          maxPerceptualRmse: MAX_PERCEPTUAL_RMSE,
          geometryTolerancePx: 2,
          dynamicMask: 'Map cartography only; HydroRivers-owned overlays remain measured',
        },
        chromiumStatus: 'PASS',
        captureStatus: 'PASS',
        contractStatus,
        componentStatus,
        componentVisualArtifact: componentReport ? path.relative(root, componentResultPath) : null,
        componentVisual: componentReport,
        referenceArtifact: path.relative(root, referencePath),
        referenceSha256,
        runtimeArtifact: path.relative(root, runtimePath),
        runtimeSha256: sha256(runtimeBytes),
        diffArtifact: path.relative(root, diffPath),
        metricsArtifact: path.relative(root, metricsPath),
        metrics,
        strictPixelPerfectStatus,
        visualStatus,
        evidenceChainStatus: certificationPass ? 'PASS' : 'FAIL',
        certificationStatus: certificationPass ? 'PASS' : 'FAIL',
        blockers: [
          ...(contractStatus === 'PASS' ? [] : ['hard structural contract failed']),
          ...(visualStatus === 'PASS' ? [] : ['perceptual visual diff exceeds calibrated Page 61 threshold']),
          ...(componentStatus === 'PASS' ? [] : ['Storybook component visual contract failed or is missing']),
        ],
      };

      await writeFile(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
      await writeFile(resultPath, `${JSON.stringify(evidence, null, 2)}\n`);
      console.log(
        `SHARKLOCK ${evidence.certificationStatus}: raw=${metrics.raw.divergentPixels}px RMSE=${metrics.raw.rmse.toFixed(6)} | perceptual=${(metrics.perceptual.diffRatio * 100).toFixed(3)}% RMSE=${metrics.perceptual.rmse.toFixed(6)} | ignored map pixels=${metrics.perceptual.ignoredDynamicPixels}`,
      );
      process.exitCode = evidence.certificationStatus === 'PASS' ? 0 : 1;
    } finally {
      await browser.close();
    }
  }
}
