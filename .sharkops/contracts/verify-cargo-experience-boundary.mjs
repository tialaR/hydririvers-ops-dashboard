import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cargo = path.join(root, 'src/features/cargo');
const owned = path.join(cargo, 'owned');
const pub = path.join(cargo, 'public');
const fail = (msg) => { console.error(`[cargo-experience-boundary] FAIL: ${msg}`); process.exit(1); };

if (!fs.existsSync(owned)) fail('missing features/cargo/owned');
if (!fs.existsSync(pub)) fail('missing features/cargo/public');

const walk = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
  const p = path.join(dir,e.name); return e.isDirectory() ? walk(p) : [p];
}) : [];
const textFiles = (dir) => walk(dir).filter(f => /\.(ts|tsx|js|mjs|sass|scss|css)$/.test(f));
const contains = (file, needle) => fs.readFileSync(file,'utf8').includes(needle);

for (const f of textFiles(owned)) {
  if (contains(f, '@/features/cargo/public/')) fail(`owned slice imports public slice: ${path.relative(root,f)}`);
  if (contains(f, '@/features/shipper-mobile-flow/')) fail(`owned slice imports persona God Feature: ${path.relative(root,f)}`);
}
for (const f of textFiles(pub)) {
  if (contains(f, '@/features/cargo/owned/')) fail(`public slice imports owned slice: ${path.relative(root,f)}`);
  if (contains(f, '@/features/shipper-mobile-flow/')) fail(`public slice imports persona God Feature: ${path.relative(root,f)}`);
}

const legacyOwnedDirs = fs.existsSync(path.join(cargo,'components'))
  ? fs.readdirSync(path.join(cargo,'components'), {withFileTypes:true}).filter(e => e.isDirectory() && e.name.startsWith('owned-cargo-')).map(e => e.name)
  : [];
if (legacyOwnedDirs.length) fail(`owned presentation still at cargo/components root: ${legacyOwnedDirs.join(', ')}`);
if (fs.existsSync(path.join(cargo,'components','public-cargas-mobile'))) fail('public-cargas-mobile still at cargo/components root');

const scanRoots = [path.join(root,'src'), path.join(root,'tests')];
for (const r of scanRoots) for (const f of textFiles(r)) {
  const raw = fs.readFileSync(f,'utf8');
  if (raw.includes('@/features/cargo/components/owned-cargo-')) fail(`stale owned component import: ${path.relative(root,f)}`);
  if (raw.includes('@/features/cargo/components/public-cargas-mobile')) fail(`stale public component import: ${path.relative(root,f)}`);
}

console.log('[cargo-experience-boundary] PASS');
console.log(' owned cargo experience: explicit feature slice');
console.log(' public cargo experience: explicit feature slice');
console.log(' direct owned <-> public coupling: forbidden');
console.log(' persona God Feature dependency from either slice: forbidden');
