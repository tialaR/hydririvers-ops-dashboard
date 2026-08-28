import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const walk = (dir) => {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(rel) : [rel];
  });
};
const fail = (message) => {
  console.error(`[hydrology-impact-ownership] FAIL: ${message}`);
  process.exit(1);
};

const legacy = [
  'src/features/shipper-mobile-flow/application/get-hydrology-chart-data.ts',
  'src/features/shipper-mobile-flow/application/get-hydrology-summary.ts',
  'src/features/shipper-mobile-flow/application/get-impact-chart-data.ts',
  'src/features/shipper-mobile-flow/application/get-impact-summary.ts',
  'src/features/shipper-mobile-flow/data/mock/shipper-hydro-mock.ts',
  'src/features/shipper-mobile-flow/data/repositories/mock-hydro-repository.ts',
  'src/features/shipper-mobile-flow/domain/repositories/hydro-repository.ts',
  'src/features/shipper-mobile-flow/screens/hydrology-screen.tsx',
  'src/features/shipper-mobile-flow/screens/impact-screen.tsx',
  'src/features/shipper-mobile-flow/types/shipper-chart-types.ts'
];

for (const file of legacy) {
  if (exists(file)) fail(`legacy persona owner still exists: ${file}`);
}

const required = [
  'src/features/hydrology/application/get-hydrology-chart-data.ts',
  'src/features/hydrology/application/get-hydrology-summary.ts',
  'src/features/hydrology/domain/hydrology-repository.ts',
  'src/features/hydrology/repositories/mock-hydrology-repository.ts',
  'src/features/hydrology/screens/hydrology-screen.tsx',
  'src/features/impact/application/get-impact-chart-data.ts',
  'src/features/impact/application/get-impact-summary.ts',
  'src/features/impact/domain/impact-operations.ts',
  'src/features/impact/repositories/mock-impact-repository.ts',
  'src/features/impact/screens/impact-screen.tsx',
  'src/shared/design-system/patterns/operational-chart/index.ts'
];
for (const file of required) {
  if (!exists(file)) fail(`required owner missing: ${file}`);
}

for (const feature of ['src/features/hydrology', 'src/features/impact']) {
  for (const file of walk(feature).filter((p) => /\.(ts|tsx)$/.test(p))) {
    if (read(file).includes('@/features/shipper-mobile-flow')) {
      fail(`${feature} imports persona code through ${file}`);
    }
  }
}

for (const file of walk('src/shared/design-system/patterns/operational-chart').filter((p) => /\.(ts|tsx)$/.test(p))) {
  if (read(file).includes('@/features/')) {
    fail(`portable chart core imports feature code through ${file}`);
  }
}

const hydroRoute = read('src/app/[locale]/(shipper-mobile-flow)/hidrologia/page.tsx');
const impactRoute = read('src/app/[locale]/(shipper-mobile-flow)/impacto/page.tsx');
if (!hydroRoute.includes('@/features/hydrology/')) fail('hydrology route does not consume canonical feature');
if (!impactRoute.includes('@/features/impact/')) fail('impact route does not consume canonical feature');

const shipperCount = walk('src/features/shipper-mobile-flow').length;
if (shipperCount > 70) fail(`shipper-mobile-flow grew above SO-019 target: ${shipperCount}`);

console.log('[hydrology-impact-ownership] PASS');
console.log(' hydrology domain/application/data/presentation: features/hydrology');
console.log(' impact operational ownership: features/impact');
console.log(' operational Recharts core: shared/design-system/patterns/operational-chart');
console.log(` shipper-mobile-flow files: ${shipperCount}`);
console.log(' hydrology -> shipper-mobile-flow dependency: 0');
console.log(' impact -> shipper-mobile-flow dependency: 0');
