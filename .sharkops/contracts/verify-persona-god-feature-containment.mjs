import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const featureRoot = path.join(root, 'src/features/shipper-mobile-flow');
const sharedRoot = path.join(root, 'src/shared');
const baselinePath = path.join(root, '.sharkops/contracts/persona-god-feature-baseline.json');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function fail(message) {
  console.error(`[persona-god-feature] FAIL: ${message}`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const currentFeatureFiles = existsSync(featureRoot) ? walk(featureRoot).map(rel).sort() : [];
const baselineFeatureFiles = [...baseline.featureFiles].sort();
const baselineSet = new Set(baselineFeatureFiles);
const newFeatureFiles = currentFeatureFiles.filter((file) => !baselineSet.has(file));
if (newFeatureFiles.length > 0) {
  fail(`shipper-mobile-flow grew after containment: ${newFeatureFiles.join(', ')}`);
}

const srcFiles = walk(path.join(root, 'src')).filter((file) => /\.(ts|tsx)$/.test(file));
const importerFiles = [];
for (const file of srcFiles) {
  if (file.startsWith(featureRoot + path.sep)) continue;
  const raw = readFileSync(file, 'utf8');
  if (raw.includes("@/features/shipper-mobile-flow")) importerFiles.push(rel(file));
}
importerFiles.sort();
const baselineImporters = new Set(baseline.externalImporters);
const newImporters = importerFiles.filter((file) => !baselineImporters.has(file));
if (newImporters.length > 0) {
  fail(`new external consumers of shipper-mobile-flow are forbidden: ${newImporters.join(', ')}`);
}

if (statSync(sharedRoot).isDirectory()) {
  const sharedFiles = walk(sharedRoot).filter((file) => /\.(ts|tsx|js|mjs)$/.test(file));
  const sharedLeaks = sharedFiles.filter((file) => readFileSync(file, 'utf8').includes("@/features/shipper-mobile-flow"));
  if (sharedLeaks.length > 0) {
    fail(`shared must not depend on persona feature: ${sharedLeaks.map(rel).join(', ')}`);
  }
}

console.log('[persona-god-feature] PASS');
console.log(` frozen feature files: ${baselineFeatureFiles.length}; current: ${currentFeatureFiles.length}`);
console.log(` frozen external consumers: ${baseline.externalImporters.length}; current: ${importerFiles.length}`);
console.log(' rule: shipper-mobile-flow may shrink, but it cannot gain new files or new consumers');
console.log(' rule: shared cannot import persona-specific feature code');
