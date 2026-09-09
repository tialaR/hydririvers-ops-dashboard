import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const personaDir = path.join(root, 'src/features/shipper-mobile-flow');
const publicDir = path.join(root, 'src/features/cargo/public');

function fail(message) {
  console.error(`[so016-closeout] FAIL: ${message}`);
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (!existsSync(publicDir)) fail('cargo/public feature is missing');
if (!existsSync(personaDir)) fail('shipper-mobile-flow feature is missing');

const personaFiles = walk(personaDir).filter((file) => /\.(ts|tsx)$/.test(file));
const publicFiles = walk(publicDir).filter((file) => /\.(ts|tsx)$/.test(file));

const forbiddenImport = '@/features/cargo/public/';
const personaImportLeaks = personaFiles.filter((file) => readFileSync(file, 'utf8').includes(forbiddenImport));
if (personaImportLeaks.length > 0) {
  fail(`persona feature still imports cargo/public: ${personaImportLeaks.map((file) => path.relative(root, file)).join(', ')}`);
}

const forbiddenPersonaSymbols = [
  'ShipperPublicCargo',
  'SHIPPER_PUBLIC_CARGOES',
  'getShipperPublicCargo',
  'publicCargo: PublicCargoRepository',
  'publicCargo: mockPublicCargoRepository'
];

for (const symbol of forbiddenPersonaSymbols) {
  const leaks = personaFiles.filter((file) => readFileSync(file, 'utf8').includes(symbol));
  if (leaks.length > 0) {
    fail(`retired public compatibility symbol ${symbol} remains in: ${leaks.map((file) => path.relative(root, file)).join(', ')}`);
  }
}

const legacyPublicScreens = [
  path.join(personaDir, 'screens/public-cargoes-screen.tsx'),
  path.join(personaDir, 'screens/public-cargo-detail-screen.tsx')
];
for (const file of legacyPublicScreens) {
  if (existsSync(file)) fail(`legacy persona public screen returned: ${path.relative(root, file)}`);
}

const legacyPublicCard = path.join(personaDir, 'components/public-cargo-card-restricted/public-cargo-card-restricted.tsx');
if (existsSync(legacyPublicCard)) fail(`legacy persona public card returned: ${path.relative(root, legacyPublicCard)}`);

const publicMock = path.join(publicDir, 'mocks/public-cargo.mock.ts');
if (!existsSync(publicMock)) fail('public cargo mock source is missing');
const publicMockRaw = readFileSync(publicMock, 'utf8');
if (publicMockRaw.includes('SHIPPER_PUBLIC_CARGOES')) {
  fail('cargo/public still exports persona-specific SHIPPER_PUBLIC_CARGOES alias');
}

const requiredPublicSlices = ['application', 'components', 'domain', 'mocks', 'repositories', 'screens'];
for (const slice of requiredPublicSlices) {
  if (!existsSync(path.join(publicDir, slice))) fail(`cargo/public/${slice} ownership slice is missing`);
}

console.log('[so016-closeout] PASS');
console.log(' public cargo domain/data/application/presentation ownership: cargo/public only');
console.log(' shipper-mobile-flow -> cargo/public implementation imports: 0');
console.log(' retired public compatibility aliases: 0');
console.log(' legacy persona public screens/cards: 0');
console.log(' navigation references to public cargo remain allowed as shell concerns');
