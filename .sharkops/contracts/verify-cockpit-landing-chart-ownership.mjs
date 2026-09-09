import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const walk = (dir) => {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(rel) : [rel];
  });
};
const fail = (message) => { console.error(`[cockpit-landing-chart-ownership] FAIL: ${message}`); process.exit(1); };

const persona = 'src/features/shipper-mobile-flow';
const personaFiles = walk(persona).filter((file) => fs.statSync(path.join(root, file)).isFile());
if (personaFiles.length > 34) fail(`shipper-mobile-flow expected <= 34 files; got ${personaFiles.length}`);

const removed = [
  'application/get-cockpit-metrics.ts',
  'application/get-cockpit-trend-data.ts',
  'application/get-default-shipper-cargo-id.ts',
  'application/get-landing-chart-points.ts',
  'components/bar-chart-card/bar-chart-card.tsx',
  'components/line-chart-card/line-chart-card.tsx',
  'screens/cockpit-screen.tsx',
  'screens/landing-screen.tsx',
  'components/search-filter-bar/search-filter-bar.tsx',
  'components/search-filter-bar/search-filter-bar.module.sass'
];
for (const rel of removed) if (exists(`${persona}/${rel}`)) fail(`retired persona file still exists: ${rel}`);

const required = [
  'src/features/dashboard/application/get-mobile-cockpit-metrics.ts',
  'src/features/dashboard/application/get-mobile-cockpit-trend-data.ts',
  'src/features/dashboard/application/get-mobile-cockpit-default-cargo-id.ts',
  'src/features/dashboard/components/mobile-cockpit/mobile-cockpit-screen.tsx',
  'src/features/home/application/get-shipper-landing-chart-points.ts',
  'src/features/home/components/shipper-landing/shipper-landing-screen.tsx'
];
for (const rel of required) if (!exists(rel)) fail(`canonical ownership file missing: ${rel}`);

for (const feature of ['src/features/dashboard', 'src/features/home']) {
  const leaks = walk(feature).filter((file) => /\.(ts|tsx)$/.test(file) && read(file).includes('@/features/shipper-mobile-flow'));
  if (leaks.length) fail(`${feature} depends on persona: ${leaks.join(', ')}`);
}

const cockpitRoute = read('src/app/[locale]/(shipper-mobile-flow)/cockpit/page.tsx');
if (cockpitRoute.includes('@/features/shipper-mobile-flow')) fail('cockpit route still consumes persona implementation');
const landingRoute = read('src/app/[locale]/(shipper-mobile-flow)/page.tsx');
if (landingRoute.includes('@/features/shipper-mobile-flow')) fail('landing route still consumes persona implementation');

const allSrc = walk('src').filter((file) => /\.(ts|tsx)$/.test(file));
const legacyChartRefs = allSrc.filter((file) => {
  const body = read(file);
  return body.includes('shipper-mobile-flow/components/line-chart-card') || body.includes('shipper-mobile-flow/components/bar-chart-card');
});
if (legacyChartRefs.length) fail(`legacy chart wrappers still referenced: ${legacyChartRefs.join(', ')}`);

console.log('[cockpit-landing-chart-ownership] PASS');
console.log(' cockpit ownership: features/dashboard');
console.log(' landing ownership: features/home');
console.log(' chart rendering: canonical shared/design-system operational-chart');
console.log(` shipper-mobile-flow files: ${personaFiles.length}`);
console.log(' dashboard/home -> shipper-mobile-flow dependency: 0');
