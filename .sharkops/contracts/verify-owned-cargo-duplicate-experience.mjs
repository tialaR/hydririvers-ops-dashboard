import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const statePath = path.join(root, '.sharkops/contracts/owned-cargo-duplicate-experience.json');
const legacyDir = path.join(root, 'src/features/shipper-mobile-flow/screens');
const ownedDir = path.join(root, 'src/features/cargo/owned');
const legacyScreens = [
  'my-cargoes-screen.tsx',
  'cargo-detail-screen.tsx',
  'documents-screen.tsx',
  'cargo-map-screen.tsx',
];

function fail(message) {
  console.error(`[owned-cargo-duplicate] FAIL: ${message}`);
  process.exit(1);
}
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
function lineCount(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).length;
}

if (!fs.existsSync(statePath)) fail('baseline state missing');
if (!fs.existsSync(ownedDir)) fail('cargo/owned boundary missing');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

let currentLines = 0;
for (const name of legacyScreens) {
  const file = path.join(legacyDir, name);
  if (fs.existsSync(file)) currentLines += lineCount(file);
}
if (currentLines > state.legacyCombinedLines) {
  fail(`legacy owned-cargo screens grew: frozen ${state.legacyCombinedLines}; current ${currentLines}`);
}

// Only authenticated/owned cargo screens belong to this containment gate.
// Public cargo screens are a separate SO-014 slice and must never be classified
// as owned debt merely because their filename contains "cargo-detail".
const ownedScreenNamePatterns = [
  /^my-cargoes(?:-.+)?-screen\.tsx$/,
  /^cargo-detail(?:-.+)?-screen\.tsx$/,
  /^documents(?:-.+)?-screen\.tsx$/,
  /^cargo-map(?:-.+)?-screen\.tsx$/,
];

const currentLegacyOwnedScreens = fs.existsSync(legacyDir)
  ? fs.readdirSync(legacyDir).filter((name) => ownedScreenNamePatterns.some((pattern) => pattern.test(name)))
  : [];

for (const name of currentLegacyOwnedScreens) {
  if (!state.allowedLegacyScreenFiles.includes(name)) {
    fail(`new owned-cargo screen inside persona feature: ${name}`);
  }
}

const reverseImports = [];
for (const file of walk(ownedDir).filter((file) => /\.(ts|tsx|js|mjs)$/.test(file))) {
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.includes('@/features/shipper-mobile-flow') || raw.includes('features/shipper-mobile-flow')) {
    reverseImports.push(path.relative(root, file).split(path.sep).join('/'));
  }
}
if (reverseImports.length) fail(`cargo/owned imports persona feature: ${reverseImports.join(', ')}`);

console.log('[owned-cargo-duplicate] PASS');
console.log(` legacy owned-cargo screen lines: frozen ${state.legacyCombinedLines}; current ${currentLines}`);
console.log(' public cargo screens: excluded from owned debt classification');
console.log(' rule: legacy persona owned screens may shrink, never grow');
console.log(' rule: cargo/owned owns all new authenticated cargo presentation');
console.log(' rule: cargo/owned -> shipper-mobile-flow dependency remains forbidden');
