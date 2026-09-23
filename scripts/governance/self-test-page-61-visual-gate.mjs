#!/usr/bin/env node

const POLICY = {
  perceptualThreshold: 0.20,
  perceptualNeighborRadius: 1,
  maxDiffRatio: 0.02,
  maxRmse: 0.085,
  geometryTolerancePx: 2,
};

const COMPONENT_POLICY = {
  perceptualThreshold: 0.20,
  maxDiffRatio: 0.05,
  maxRmse: 0.11,
  geometryTolerancePx: 2,
};

function yiqDistance([r1, g1, b1], [r2, g2, b2]) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  const y = 0.29889531 * dr + 0.58662247 * dg + 0.11448223 * db;
  const i = 0.59597799 * dr - 0.2741761 * dg - 0.32180189 * db;
  const q = 0.21147017 * dr - 0.52261711 * dg + 0.31114694 * db;
  return Math.sqrt(0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q) / 187.66;
}

function evaluatePixels(reference, candidate, mask = new Set()) {
  let divergent = 0;
  let squared = 0;
  let eligible = 0;

  for (let index = 0; index < reference.length; index += 1) {
    if (mask.has(index)) continue;
    eligible += 1;
    const distance = yiqDistance(reference[index], candidate[index]);
    squared += distance ** 2;
    if (distance > POLICY.perceptualThreshold) divergent += 1;
  }

  const diffRatio = eligible === 0 ? 0 : divergent / eligible;
  const rmse = eligible === 0 ? 0 : Math.sqrt(squared / eligible);
  return {
    divergent,
    diffRatio,
    rmse,
    pass: diffRatio <= POLICY.maxDiffRatio && rmse <= POLICY.maxRmse,
  };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`PAGE61 GATE SELF-TEST FAIL: ${message}`);
    process.exit(1);
  }
}

const pixelCount = 10_000;
const reference = Array.from({ length: pixelCount }, () => [100, 100, 100]);

// Benign renderer noise: every raw RGB pixel changes by one unit.
// It must remain perceptually equivalent.
const benignNoise = Array.from({ length: pixelCount }, () => [101, 101, 101]);
const benignResult = evaluatePixels(reference, benignNoise);
assert(benignResult.pass, '1-RGB renderer noise must not block the gate');

// Real regression: 3% of the surface changes from gray to white.
// It exceeds the 2% perceptual ratio budget and must fail.
const realRegression = reference.map((pixel) => [...pixel]);
for (let index = 0; index < 300; index += 1) realRegression[index] = [255, 255, 255];
const regressionResult = evaluatePixels(reference, realRegression);
assert(!regressionResult.pass, '3% high-contrast regression must fail the gate');

// Dynamic region: the exact same high-contrast pixels are explicitly masked.
// Only the dynamic area may disappear from the perceptual score.
const dynamicMask = new Set(Array.from({ length: 300 }, (_, index) => index));
const maskedResult = evaluatePixels(reference, realRegression, dynamicMask);
assert(maskedResult.pass, 'explicit dynamic mask should ignore only masked pixels');

// Hard geometry is independent from perceptual similarity.
const geometryDelta = 8;
assert(geometryDelta > POLICY.geometryTolerancePx, '8px structural shift must exceed the 2px contract');

console.log('PAGE61 GATE SELF-TEST PASS', {
  policy: POLICY,
  benign: benignResult,
  regression: regressionResult,
  masked: maskedResult,
});


// Component policy calibration: small raster differences may pass, but
// a meaningful 6% high-contrast regression must still fail.
function evaluateComponentPixels(reference, candidate) {
  let divergent = 0;
  let squared = 0;
  for (let index = 0; index < reference.length; index += 1) {
    const distance = yiqDistance(reference[index], candidate[index]);
    squared += distance ** 2;
    if (distance > COMPONENT_POLICY.perceptualThreshold) divergent += 1;
  }
  const diffRatio = divergent / reference.length;
  const rmse = Math.sqrt(squared / reference.length);
  return {
    divergent,
    diffRatio,
    rmse,
    pass: diffRatio <= COMPONENT_POLICY.maxDiffRatio && rmse <= COMPONENT_POLICY.maxRmse,
  };
}

const componentNoise = Array.from({ length: pixelCount }, () => [104, 104, 104]);
assert(
  evaluateComponentPixels(reference, componentNoise).pass,
  'small component raster noise must not block the gate',
);

const componentRegression = reference.map((pixel) => [...pixel]);
for (let index = 0; index < 600; index += 1) componentRegression[index] = [255, 255, 255];
assert(
  !evaluateComponentPixels(reference, componentRegression).pass,
  '6% high-contrast component regression must fail the gate',
);
