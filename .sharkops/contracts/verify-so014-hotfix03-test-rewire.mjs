import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const testsRoot = path.join(root, 'tests');
const cargoMarketList = path.join(root, 'src/features/cargo-market/components/my-cargoes-list/my-cargoes-list.tsx');


import { readdirSync } from 'node:fs';
function collect(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? collect(full) : [full];
  });
}

const testFiles = collect(testsRoot).filter((file) => /\.(ts|tsx|js|mjs)$/.test(file));
const stalePublic = 'src/features/cargo/components/public-cargas-mobile/';
const staleOwned = 'src/features/cargo/components/owned-cargo-';
const staleStyleImport = '@/features/cargo/public/components/public-cargas-mobile/public-cargas-mobile-list.module.scss';
const neutralStyleImport = '@/features/cargo/components/cargo-mobile-sheet/cargo-mobile-sheet.module.scss';

const offenders = [];
for (const file of testFiles) {
  const raw = readFileSync(file, 'utf8');
  if (raw.includes(stalePublic) || raw.includes(staleOwned)) offenders.push(path.relative(root, file));
}
if (offenders.length) {
  console.error(`[so014-hotfix03] FAIL: stale hardcoded pre-boundary test paths: ${offenders.join(', ')}`);
  process.exit(1);
}

if (!existsSync(cargoMarketList)) {
  console.error('[so014-hotfix03] FAIL: cargo-market my-cargoes-list source missing');
  process.exit(1);
}
const cargoMarketSource = readFileSync(cargoMarketList, 'utf8');
if (cargoMarketSource.includes(staleStyleImport)) {
  console.error('[so014-hotfix03] FAIL: cargo-market still imports public-owned stylesheet path');
  process.exit(1);
}
if (!cargoMarketSource.includes(neutralStyleImport)) {
  console.error('[so014-hotfix03] FAIL: cargo-market is not using neutral cargo mobile stylesheet');
  process.exit(1);
}

const required = [
  'src/features/cargo/public/components/public-cargas-mobile/public-cargas-mobile-list.tsx',
  'src/features/cargo/owned/components/owned-cargo-card/owned-cargo-card.tsx',
  'src/features/cargo/components/cargo-mobile-sheet/cargo-mobile-sheet.module.scss',
];
for (const rel of required) {
  if (!existsSync(path.join(root, rel))) {
    console.error(`[so014-hotfix03] FAIL: expected new ownership path missing: ${rel}`);
    process.exit(1);
  }
}

console.log('[so014-hotfix03] PASS');
console.log(' stale hardcoded pre-boundary test paths: 0');
console.log(' cargo-market stylesheet ownership: neutral cargo shared layer');
