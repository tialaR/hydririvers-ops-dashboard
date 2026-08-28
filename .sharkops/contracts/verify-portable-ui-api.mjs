import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ds = path.join(root, 'src/shared/design-system');
const core = path.join(ds, 'core');
const publicApi = path.join(ds, 'index.ts');
const baselineFile = path.join(root, '.sharkops/contracts/wave07-liquid-import-baseline.json');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
function rel(p) { return path.relative(root, p).split(path.sep).join('/'); }
function fail(msg) { console.error(`[portable-ui] FAIL: ${msg}`); process.exit(1); }

if (!fs.existsSync(publicApi)) fail('canonical src/shared/design-system/index.ts missing');
const api = fs.readFileSync(publicApi, 'utf8');
if (!api.includes("export * from './core'")) fail('public API does not expose neutral core');
if (!api.includes("from './materials/glass'")) fail('public API does not expose generic glass material');
if (/LiquidGlass|HydroRivers|HydriRivers/.test(api)) fail('public API leaks product/implementation naming');

const forbiddenCore = [/liquid-glass/i, /hydrorivers/i, /hydririvers/i, /hydro\.semantic/i, /\/features\//, /\/app\//, /shared\/ui/, /shared\/components/];
for (const file of walk(core).filter((f) => /\.(ts|tsx)$/.test(f))) {
  const raw = fs.readFileSync(file, 'utf8');
  for (const rule of forbiddenCore) if (rule.test(raw)) fail(`core coupling in ${rel(file)}: ${rule}`);
}

const sourceFiles = walk(path.join(root, 'src')).filter((f) => /\.(ts|tsx)$/.test(f) && !rel(f).startsWith('src/shared/design-system/'));
const offenders = [];
for (const file of sourceFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  if (/from\s+['"][^'"]*design-system\/primitives\/liquid-glass-/m.test(raw)) offenders.push(rel(file));
}
offenders.sort();
const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const allowed = new Set(baseline.files || []);
const growth = offenders.filter((f) => !allowed.has(f));
if (growth.length) fail(`new direct Liquid Glass imports detected: ${growth.join(', ')}`);

console.log('[portable-ui] PASS');
console.log(' canonical public API: src/shared/design-system/index.ts');
console.log(' core vocabulary: product-neutral and extraction-safe');
console.log(` direct Liquid Glass consumer debt frozen at ${offenders.length} file(s); it may shrink, never grow`);
console.log(' Storybook/package extraction now has a stable neutral entrypoint');
