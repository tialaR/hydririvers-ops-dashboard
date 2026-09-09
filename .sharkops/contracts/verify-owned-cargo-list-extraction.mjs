import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const canonical = path.join(root, 'src/features/cargo/owned/screens/owned-cargo-list-screen.tsx');
const adapter = path.join(root, 'src/features/shipper-mobile-flow/screens/my-cargoes-screen.tsx');

function fail(message) {
  console.error(`[owned-cargo-list-extraction] FAIL: ${message}`);
  process.exit(1);
}

if (!existsSync(canonical)) fail('canonical owned cargo list screen is missing');
if (!existsSync(adapter)) fail('compatibility adapter is missing');

const canonicalSource = readFileSync(canonical, 'utf8');
const adapterSource = readFileSync(adapter, 'utf8');

if (canonicalSource.includes('@/features/shipper-mobile-flow/')) {
  fail('canonical owned cargo list screen imports persona God Feature');
}
if (!canonicalSource.includes("@/features/cargo/owned/domain/owned-cargo-types")) {
  fail('canonical list screen does not consume cargo-owned domain type');
}
if (!canonicalSource.includes('CargoCardList')) {
  fail('canonical list screen does not own cargo list presentation');
}
if (!adapterSource.includes('OwnedCargoListScreen')) {
  fail('persona screen does not delegate to canonical owned cargo list screen');
}

const adapterLines = adapterSource.split(/\r?\n/).length;
if (adapterLines > 45) {
  fail(`persona list adapter is too large: ${adapterLines} lines (max 45)`);
}

const legacyScreens = [
  'my-cargoes-screen.tsx',
  'cargo-detail-screen.tsx',
  'documents-screen.tsx',
  'cargo-map-screen.tsx',
];
let legacyLines = 0;
for (const file of legacyScreens) {
  const full = path.join(root, 'src/features/shipper-mobile-flow/screens', file);
  if (existsSync(full)) legacyLines += readFileSync(full, 'utf8').split(/\r?\n/).length;
}

if (legacyLines >= 213) {
  fail(`legacy owned screen debt did not shrink: current ${legacyLines}, previous 213`);
}

console.log(` legacy owned screen debt: 213 -> ${legacyLines} lines`);
console.log('[owned-cargo-list-extraction] PASS');
console.log(' canonical owned cargo list body: cargo/owned ownership');
console.log(' persona list screen: thin shell/UI-primitive adapter only');
console.log(' cargo/owned -> shipper-mobile-flow dependency: 0 in canonical list screen');
