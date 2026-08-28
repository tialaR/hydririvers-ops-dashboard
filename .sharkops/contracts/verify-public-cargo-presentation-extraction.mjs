import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => {
  console.error(`[public-cargo-presentation] FAIL: ${message}`);
  process.exit(1);
};
const rel = (file) => path.join(root, file);
const required = [
  'src/features/cargo/public/screens/public-cargoes-screen.tsx',
  'src/features/cargo/public/screens/public-cargo-detail-screen.tsx',
  'src/features/cargo/public/components/public-cargo-card-restricted/public-cargo-card-restricted.tsx',
  'src/features/cargo/public/components/public-cargo-card-restricted/public-cargo-card-restricted.module.sass',
];
for (const file of required) {
  if (!existsSync(rel(file))) fail(`missing canonical presentation: ${file}`);
}

if (existsSync(rel('src/features/shipper-mobile-flow/components/public-cargo-card-restricted'))) {
  fail('persona-owned public cargo card still exists');
}

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
      )
    : [];

for (const file of walk(rel('src/features/cargo/public')).filter((file) => /\.(ts|tsx)$/.test(file))) {
  const raw = readFileSync(file, 'utf8');
  if (raw.includes('@/features/shipper-mobile-flow/')) {
    fail(`canonical public presentation imports persona feature: ${path.relative(root, file)}`);
  }
  if (raw.includes('@/features/cargo/owned/')) {
    fail(`canonical public presentation imports owned cargo: ${path.relative(root, file)}`);
  }
}

const legacyAdapters = [
  'src/features/shipper-mobile-flow/screens/public-cargoes-screen.tsx',
  'src/features/shipper-mobile-flow/screens/public-cargo-detail-screen.tsx',
];
const routeClients = [
  'src/app/[locale]/(shipper-mobile-flow)/cargas-publicas/public-cargoes-route-client.tsx',
  'src/app/[locale]/(shipper-mobile-flow)/cargas-publicas/[id]/public-cargo-detail-route-client.tsx',
];

const existingLegacyAdapters = legacyAdapters.filter((file) => existsSync(rel(file)));
const existingRouteClients = routeClients.filter((file) => existsSync(rel(file)));

if (existingLegacyAdapters.length > 0 && existingLegacyAdapters.length !== legacyAdapters.length) {
  fail('public-cargo persona adapters are partially collapsed; expected both adapters or none');
}

if (existingLegacyAdapters.length === legacyAdapters.length) {
  for (const file of legacyAdapters) {
    const raw = readFileSync(rel(file), 'utf8');
    if (!raw.includes('@/features/cargo/public/screens/')) {
      fail(`persona screen is not a cargo/public adapter: ${file}`);
    }
    if (raw.includes('publicDetailHero') || raw.includes('corridorMiniGrid') || raw.includes('PublicCargoCardRestricted')) {
      fail(`public-specific presentation leaked into persona adapter: ${file}`);
    }
    const lines = raw.split('\n').length;
    if (lines > 35) fail(`persona adapter grew beyond thin-shell budget (${lines} lines): ${file}`);
  }
} else {
  if (existingRouteClients.length !== routeClients.length) {
    fail('legacy persona screens are absent but route composition clients are incomplete');
  }
  const [listClient, detailClient] = routeClients.map((file) => readFileSync(rel(file), 'utf8'));
  if (!listClient.includes('@/features/cargo/public/screens/public-cargoes-screen')) {
    fail('list route client must compose canonical cargo/public presentation');
  }
  if (!detailClient.includes('@/features/cargo/public/screens/public-cargo-detail-screen')) {
    fail('detail route client must compose canonical cargo/public presentation');
  }
}

console.log('[public-cargo-presentation] PASS');
console.log(' canonical list + detail + restricted card: cargo/public ownership');
console.log(
  existingLegacyAdapters.length === legacyAdapters.length
    ? ' persona public screens: thin shell/UI adapters only'
    : ' persona public screens: collapsed; route clients own compatibility composition',
);
console.log(' cargo/public -> shipper-mobile-flow dependency: 0');
console.log(' cargo/public -> cargo/owned dependency: 0');
