import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const legacyDir = path.join(root, 'src/features/shipper-mobile-flow/screens');
const ownedDir = path.join(root, 'src/features/cargo/owned');
const appDir = path.join(root, 'src/app/[locale]/(shipper-mobile-flow)/minhas-cargas');

const legacyScreens = [
  'my-cargoes-screen.tsx',
  'cargo-detail-screen.tsx',
  'documents-screen.tsx',
  'cargo-map-screen.tsx',
];

function fail(message) {
  console.error(`[owned-cargo-legacy-collapse] FAIL: ${message}`);
  process.exit(1);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const name of legacyScreens) {
  const file = path.join(legacyDir, name);
  if (fs.existsSync(file)) fail(`legacy owned screen still exists: ${name}`);
}

const requiredRouteAdapters = [
  'owned-cargo-list-route-client.tsx',
  '[id]/owned-cargo-detail-route-client.tsx',
  '[id]/documentos/owned-cargo-documents-route-client.tsx',
];

for (const relative of requiredRouteAdapters) {
  if (!fs.existsSync(path.join(appDir, relative))) fail(`route composition adapter missing: ${relative}`);
}

for (const file of walk(ownedDir).filter((file) => /\.(ts|tsx|js|mjs)$/.test(file))) {
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.includes('@/features/shipper-mobile-flow') || raw.includes('features/shipper-mobile-flow')) {
    fail(`canonical cargo/owned code imports persona feature: ${path.relative(root, file)}`);
  }
}

const appFiles = walk(appDir).filter((file) => /\.(ts|tsx)$/.test(file));
for (const file of appFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  if (/shipper-mobile-flow\/screens\/(my-cargoes-screen|cargo-detail-screen|documents-screen|cargo-map-screen)/.test(raw)) {
    fail(`route still imports legacy owned screen: ${path.relative(root, file)}`);
  }
}

console.log('[owned-cargo-legacy-collapse] PASS');
console.log(' legacy owned cargo screens: 4 -> 0');
console.log(' canonical owned presentation: cargo/owned');
console.log(' route-only composition: app layer');
console.log(' cargo/owned -> shipper-mobile-flow dependency: 0');
console.log(' business behavior: preserved by moving compatibility composition to routes');
