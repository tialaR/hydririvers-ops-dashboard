#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const manifestArg = process.argv.slice(2).find((arg) => arg.startsWith('--manifest='));
const manifestName = manifestArg?.slice('--manifest='.length);
if (!manifestName) {
  console.error('SHARKLOCK FAIL: --manifest=<name> is required');
  process.exit(1);
}

const root = process.cwd();
const manifest = JSON.parse(await readFile(path.resolve(root, 'config/visual-gates', `${manifestName}.json`), 'utf8'));
const referencePath = path.resolve(root, manifest.referenceArtifact);
const runtimePath = path.resolve(root, manifest.runtimeArtifact);
const diffPath = path.resolve(root, manifest.diffArtifact);
const metricsPath = path.resolve(root, manifest.metricsArtifact);
const resultPath = path.resolve(root, manifest.resultArtifact);
const candidateSha = process.env.SHARKLOCK_CANDIDATE_SHA || '';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
async function exists(file) { try { await access(file); return true; } catch { return false; } }

async function fail(reason) {
  await mkdir(path.dirname(resultPath), { recursive: true });
  await writeFile(resultPath, `${JSON.stringify({
    gate: 'SHARKLOCK-v2',
    manifest: manifestName,
    requirementId: manifest.requirementId,
    candidateSha,
    certificationStatus: 'FAIL',
    evidenceChainStatus: 'FAIL',
    blockers: [reason]
  }, null, 2)}\n`);
  console.error(`SHARKLOCK FAIL: ${reason}`);
  process.exitCode = 1;
}

if (!candidateSha) {
  await fail('candidate SHA is missing');
} else if (!(await exists(referencePath))) {
  await fail('canonical reference is missing');
} else if (!(await exists(runtimePath))) {
  await fail('runtime screenshot is missing');
} else {
  const referenceBytes = await readFile(referencePath);
  const runtimeBytes = await readFile(runtimePath);
  const referenceSha = sha256(referenceBytes);

  if (referenceSha !== manifest.referenceSha256) {
    await fail(`canonical reference hash mismatch: ${referenceSha}`);
  } else {
    const browser = await chromium.launch({ headless: true });
    try {
      const { width, height } = manifest.viewport;
      const page = await browser.newPage({ viewport: { width, height } });
      await page.setContent(`<style>html,body{margin:0;background:#000}canvas{display:block}</style><canvas id="diff" width="${width}" height="${height}"></canvas>`);

      const metrics = await page.evaluate(async ({ reference, runtime, regions, width, height }) => {
        const loadImage = (source) => new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('PNG decode failed'));
          image.src = `data:image/png;base64,${source}`;
        });

        const [referenceImage, runtimeImage] = await Promise.all([loadImage(reference), loadImage(runtime)]);
        if (referenceImage.width !== width || referenceImage.height !== height) {
          throw new Error(`reference dimensions are ${referenceImage.width}x${referenceImage.height}, expected ${width}x${height}`);
        }
        if (runtimeImage.width !== width || runtimeImage.height !== height) {
          throw new Error(`runtime dimensions are ${runtimeImage.width}x${runtimeImage.height}, expected ${width}x${height}`);
        }

        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
        sourceContext.drawImage(referenceImage, 0, 0);
        const ref = sourceContext.getImageData(0, 0, width, height).data;
        sourceContext.clearRect(0, 0, width, height);
        sourceContext.drawImage(runtimeImage, 0, 0);
        const run = sourceContext.getImageData(0, 0, width, height).data;

        const diffCanvas = document.querySelector('#diff');
        const diffContext = diffCanvas.getContext('2d');
        const diffImage = diffContext.createImageData(width, height);
        const regionAcc = new Map((regions ?? []).map((region) => [region.owner, { ...region, divergentPixels: 0, squaredError: 0 }]));
        let divergentPixels = 0;
        let squaredError = 0;

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const offset = (y * width + x) * 4;
            const red = Math.abs(ref[offset] - run[offset]);
            const green = Math.abs(ref[offset + 1] - run[offset + 1]);
            const blue = Math.abs(ref[offset + 2] - run[offset + 2]);
            const different = red !== 0 || green !== 0 || blue !== 0;
            const pixelSq = red ** 2 + green ** 2 + blue ** 2;
            if (different) divergentPixels += 1;
            squaredError += pixelSq;

            diffImage.data[offset] = Math.min(255, red * 3);
            diffImage.data[offset + 1] = Math.min(255, green * 3);
            diffImage.data[offset + 2] = Math.min(255, blue * 3);
            diffImage.data[offset + 3] = 255;

            for (const region of regionAcc.values()) {
              if (x >= region.x && x < region.x + region.width && y >= region.y && y < region.y + region.height) {
                if (different) region.divergentPixels += 1;
                region.squaredError += pixelSq;
              }
            }
          }
        }

        diffContext.putImageData(diffImage, 0, 0);
        const normalize = (sum, pixels) => Math.sqrt(sum / (pixels * 4)) / 255;
        return {
          viewport: { width, height },
          divergentPixels,
          divergentPercent: (divergentPixels / (width * height)) * 100,
          rmse: normalize(squaredError, width * height),
          regions: [...regionAcc.values()].map((region) => ({
            owner: region.owner,
            bounds: { x: region.x, y: region.y, width: region.width, height: region.height },
            divergentPixels: region.divergentPixels,
            divergentPercent: (region.divergentPixels / (region.width * region.height)) * 100,
            rmse: normalize(region.squaredError, region.width * region.height)
          })).sort((a, b) => b.divergentPixels - a.divergentPixels)
        };
      }, {
        reference: referenceBytes.toString('base64'),
        runtime: runtimeBytes.toString('base64'),
        regions: manifest.regions ?? [],
        width,
        height
      });

      await mkdir(path.dirname(diffPath), { recursive: true });
      await page.screenshot({ path: diffPath, animations: 'disabled', caret: 'hide' });

      const maxPixels = manifest.thresholds?.maxDivergentPixels ?? 0;
      const maxRmse = manifest.thresholds?.maxRmse ?? 0;
      const visualPass = metrics.divergentPixels <= maxPixels && metrics.rmse <= maxRmse;

      const evidence = {
        gate: 'SHARKLOCK-v2',
        manifest: manifestName,
        requirementId: manifest.requirementId,
        candidateSha,
        source: manifest.source,
        persona: manifest.persona,
        viewport: `${width}x${height}`,
        theme: manifest.theme,
        route: manifest.route,
        referenceArtifact: manifest.referenceArtifact,
        referenceSha256: referenceSha,
        runtimeArtifact: manifest.runtimeArtifact,
        runtimeSha256: sha256(runtimeBytes),
        diffArtifact: manifest.diffArtifact,
        metricsArtifact: manifest.metricsArtifact,
        thresholds: manifest.thresholds,
        metrics,
        visualStatus: visualPass ? 'PASS' : 'FAIL',
        evidenceChainStatus: visualPass ? 'PASS' : 'FAIL',
        certificationStatus: visualPass ? 'PASS' : 'FAIL',
        blockers: visualPass ? [] : ['visual diff exceeds the manifest threshold']
      };

      await writeFile(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
      await writeFile(resultPath, `${JSON.stringify(evidence, null, 2)}\n`);

      console.log(`SHARKLOCK ${visualPass ? 'PASS' : 'FAIL'}: ${metrics.divergentPixels} divergent pixels; RMSE ${metrics.rmse.toFixed(6)}`);
      if (!visualPass) process.exitCode = 1;
    } catch (error) {
      await fail(error instanceof Error ? error.message : String(error));
    } finally {
      await browser.close();
    }
  }
}
