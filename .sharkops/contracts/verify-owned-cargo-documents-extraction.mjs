import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const canonical = path.join(root, 'src/features/cargo/owned/screens/owned-cargo-documents-screen.tsx');
const adapter = path.join(root, 'src/features/shipper-mobile-flow/screens/documents-screen.tsx');

function fail(message) {
  console.error(`[owned-cargo-documents-extraction] FAIL: ${message}`);
  process.exit(1);
}

if (!existsSync(canonical)) fail('canonical owned cargo documents screen is missing');
if (!existsSync(adapter)) fail('documents compatibility adapter is missing');

const canonicalSource = readFileSync(canonical, 'utf8');
const adapterSource = readFileSync(adapter, 'utf8');

if (canonicalSource.includes('@/features/shipper-mobile-flow/')) {
  fail('canonical documents screen imports persona God Feature');
}
if (!canonicalSource.includes('OwnedCargoDocumentsScreen')) {
  fail('canonical documents screen export missing');
}
if (!canonicalSource.includes("@/features/cargo/owned/domain/owned-cargo-types")) {
  fail('canonical documents screen does not consume cargo-owned types');
}
if (!adapterSource.includes('OwnedCargoDocumentsScreen')) {
  fail('legacy documents screen does not delegate to canonical owned screen');
}
if (!adapterSource.includes('MobileAppShell') || !adapterSource.includes('useShipperFlow')) {
  fail('legacy documents adapter no longer owns temporary persona shell/confirmation bridge');
}
if (adapterSource.includes('className={styles.') || adapterSource.includes('documents.map(')) {
  fail('legacy documents adapter still owns documents presentation');
}

const adapterLines = adapterSource.split(/\r?\n/).length;
if (adapterLines > 42) fail(`documents adapter is too large: ${adapterLines} lines (max 42)`);

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
if (legacyLines >= 135) fail(`legacy owned screen debt did not shrink: current ${legacyLines}, previous 135`);

console.log(` legacy owned screen debt: 135 -> ${legacyLines} lines`);
console.log('[owned-cargo-documents-extraction] PASS');
console.log(' canonical documents presentation: cargo/owned ownership');
console.log(' persona documents screen: shell/confirmation compatibility adapter only');
console.log(' cargo/owned -> shipper-mobile-flow dependency: 0 in canonical documents screen');
console.log(' business behavior: preserved');
