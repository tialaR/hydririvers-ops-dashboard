import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const configPath = path.join(root, '.sharkops', 'contracts', 'ui-core-boundary.json');
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function topLevelDirectories(relativeRoot) {
  const absoluteRoot = path.join(root, relativeRoot);
  if (!existsSync(absoluteRoot)) return [];
  return readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (!existsSync(configPath)) {
  console.error('[ui-core-boundary] missing contract:', configPath);
  process.exit(1);
}

const config = readJson(configPath);

for (const requiredRoot of [config.canonicalRoot, config.coreRoot, config.themeRoot, config.patternsRoot]) {
  const absolute = path.join(root, requiredRoot);
  if (!existsSync(absolute) || !statSync(absolute).isDirectory()) {
    fail(`required DS boundary missing: ${requiredRoot}`);
  }
}

for (const legacyRoot of config.legacyRoots) {
  const allowed = new Set(config.legacyTopLevelAllowlist[legacyRoot] ?? []);
  for (const name of topLevelDirectories(legacyRoot)) {
    if (!allowed.has(name)) {
      fail(`new legacy UI namespace is forbidden: ${legacyRoot}/${name}`);
    }
  }
}

const coreAbsolute = path.join(root, config.coreRoot);
const coreFiles = walk(coreAbsolute);
for (const file of coreFiles) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const basename = path.basename(file).toLowerCase();
  for (const prefix of config.genericCoreForbiddenNamePrefixes) {
    if (basename.startsWith(prefix)) {
      fail(`product-coupled filename inside generic core: ${relative}`);
    }
  }

  if (/\.(ts|tsx|js|mjs|css|scss|sass|md)$/.test(file)) {
    const raw = readFileSync(file, 'utf8').toLowerCase();
    for (const token of config.genericCoreForbiddenTokens) {
      if (raw.includes(token.toLowerCase())) {
        fail(`product-coupled token inside generic core: ${relative} -> ${token}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error('\n[ui-core-boundary] FAIL');
  for (const item of failures) console.error(` - ${item}`);
  console.error('\nRule: new reusable UI belongs in the product-agnostic Design System core; product identity belongs in themes/patterns/features.');
  process.exit(1);
}

console.log('[ui-core-boundary] PASS');
console.log(` canonical: ${config.canonicalRoot}`);
console.log(` generic core: ${config.coreRoot}`);
console.log(` HydroRivers theme: ${config.themeRoot}`);
console.log(` patterns: ${config.patternsRoot}`);
console.log(' legacy shared/components and shared/ui are frozen: migration may shrink them, but new namespaces are blocked.');
