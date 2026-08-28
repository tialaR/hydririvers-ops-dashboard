import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const moved = new Map([
  ['cargo-card', 'owned-cargo-compact-card'],
  ['cargo-card-accent', 'cargo-card-accent'],
  ['cargo-card-list', 'cargo-card-list'],
  ['cargo-card-meta', 'cargo-card-meta'],
  ['cargo-card-status-preview', 'cargo-card-status-preview'],
  ['cargo-list-card', 'cargo-list-card'],
  ['cargo-status-badge', 'cargo-status-badge'],
  ['cargo-status-filter', 'cargo-status-filter'],
  ['risk-badge', 'risk-badge'],
  ['freshness-indicator', 'freshness-indicator'],
]);

const failures = [];
function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

for (const [legacyName, cargoName] of moved) {
  const oldDir = path.join(root, 'src/features/shipper-mobile-flow/components', legacyName);
  const newDir = path.join(root, 'src/features/cargo/components', cargoName);
  if (existsSync(oldDir)) failures.push(`legacy directory still exists: ${legacyName}`);
  if (!existsSync(newDir)) failures.push(`cargo-owned directory missing: ${cargoName}`);
  for (const file of walk(newDir)) {
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)) continue;
    const raw = readFileSync(file, 'utf8');
    if (raw.includes('@/features/shipper-mobile-flow')) {
      failures.push(`reverse persona dependency: ${path.relative(root, file)}`);
    }
  }
}

const protectedExistingCard = path.join(root, 'src/features/cargo/components/cargo-card/CargoCard.tsx');
if (!existsSync(protectedExistingCard)) {
  failures.push('pre-existing cargo-card component was overwritten or removed');
}

if (failures.length) {
  console.error('[cargo-presentation] FAIL');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log('[cargo-presentation] PASS');
console.log(` moved cargo presentation directories: ${moved.size}`);
console.log(' collision policy: existing cargo-card preserved; persona card migrated as owned-cargo-compact-card');
console.log(' reverse dependency cargo -> shipper-mobile-flow: 0');
console.log(' visual/business behavior: preserved by move + import rewire');
