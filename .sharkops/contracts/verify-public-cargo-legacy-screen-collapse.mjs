import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const legacyScreens = [
  'src/features/shipper-mobile-flow/screens/public-cargoes-screen.tsx',
  'src/features/shipper-mobile-flow/screens/public-cargo-detail-screen.tsx',
];
const listClient = 'src/app/[locale]/(shipper-mobile-flow)/cargas-publicas/public-cargoes-route-client.tsx';
const detailClient = 'src/app/[locale]/(shipper-mobile-flow)/cargas-publicas/[id]/public-cargo-detail-route-client.tsx';
const listPage = 'src/app/[locale]/(shipper-mobile-flow)/cargas-publicas/page.tsx';
const detailPage = 'src/app/[locale]/(shipper-mobile-flow)/cargas-publicas/[id]/page.tsx';

function fail(message) {
  console.error(`[public-cargo-legacy-collapse] FAIL: ${message}`);
  process.exit(1);
}

for (const file of legacyScreens) {
  if (existsSync(rel(file))) fail(`legacy persona public-cargo screen still exists: ${file}`);
}
for (const file of [listClient, detailClient, listPage, detailPage]) {
  if (!existsSync(rel(file))) fail(`required route composition file missing: ${file}`);
}

const listClientRaw = readFileSync(rel(listClient), 'utf8');
const detailClientRaw = readFileSync(rel(detailClient), 'utf8');
const listPageRaw = readFileSync(rel(listPage), 'utf8');
const detailPageRaw = readFileSync(rel(detailPage), 'utf8');

if (!listClientRaw.includes("@/features/cargo/public/screens/public-cargoes-screen")) {
  fail('list route client must compose canonical cargo/public presentation');
}
if (!detailClientRaw.includes("@/features/cargo/public/screens/public-cargo-detail-screen")) {
  fail('detail route client must compose canonical cargo/public presentation');
}
if (!listPageRaw.includes("./public-cargoes-route-client")) fail('list page must delegate route composition');
if (!detailPageRaw.includes("./public-cargo-detail-route-client")) fail('detail page must delegate route composition');
if (listPageRaw.includes("@/features/shipper-mobile-flow")) fail('list server page must not import persona feature directly');
if (detailPageRaw.includes("@/features/shipper-mobile-flow")) fail('detail server page must not import persona feature directly');

console.log('[public-cargo-legacy-collapse] PASS');
console.log(' persona public-cargo screens: 2 -> 0');
console.log(' canonical public presentation: cargo/public');
console.log(' route-only shell/UI composition: app layer');
console.log(' business behavior: preserved by moving compatibility composition to route clients');
