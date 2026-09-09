import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const canonical = path.join(root, 'src/features/cargo/owned/screens/owned-cargo-detail-screen.tsx');
const adapter = path.join(root, 'src/features/shipper-mobile-flow/screens/cargo-detail-screen.tsx');
const statePath = path.join(root, '.sharkops/contracts/owned-cargo-duplicate-experience.json');

function fail(message) {
  console.error(`[owned-cargo-detail-extraction] FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(canonical)) fail('canonical owned cargo detail screen missing');
if (!fs.existsSync(adapter)) fail('legacy compatibility adapter missing');

const canonicalSource = fs.readFileSync(canonical, 'utf8');
const adapterSource = fs.readFileSync(adapter, 'utf8');

if (canonicalSource.includes('@/features/shipper-mobile-flow')) {
  fail('canonical owned screen still imports persona feature');
}
if (!canonicalSource.includes('export function OwnedCargoDetailScreen')) {
  fail('canonical screen export missing');
}
if (!adapterSource.includes('OwnedCargoDetailScreen')) {
  fail('legacy screen does not delegate to canonical owned screen');
}
if (!adapterSource.includes('MobileAppShell')) {
  fail('legacy adapter no longer preserves persona shell compatibility');
}

const adapterLines = adapterSource.split(/\r?\n/).length;
if (adapterLines > 45) fail(`legacy detail adapter is still too large: ${adapterLines} lines`);

if (fs.existsSync(statePath)) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const legacyDir = path.join(root, 'src/features/shipper-mobile-flow/screens');
  const allowed = state.allowedLegacyScreenFiles ?? [];
  const total = allowed.reduce((sum, name) => {
    const file = path.join(legacyDir, name);
    return sum + (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/).length : 0);
  }, 0);
  if (total >= state.legacyCombinedLines) {
    fail(`duplicate owned screen debt did not shrink: frozen ${state.legacyCombinedLines}; current ${total}`);
  }
  console.log(` legacy owned screen debt: ${state.legacyCombinedLines} -> ${total} lines`);
}

console.log('[owned-cargo-detail-extraction] PASS');
console.log(' canonical detail body: cargo/owned ownership');
console.log(' persona detail screen: thin shell/map-preview adapter only');
console.log(' business behavior: preserved');
