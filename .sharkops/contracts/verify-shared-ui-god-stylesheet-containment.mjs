import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targetRel = 'src/features/shipper-mobile-flow/components/shared-ui/shared-ui.module.sass';
const target = path.join(root, targetRel);
const baselinePath = path.join(root, '.sharkops/contracts/shared-ui-god-stylesheet-baseline.json');

function fail(message) {
  console.error(`[shared-ui-god-stylesheet] FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(baselinePath)) fail('baseline missing; re-run apply.sh');

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const targetExists = fs.existsSync(target);
const raw = targetExists ? fs.readFileSync(target, 'utf8') : '';
const currentLines = targetExists ? raw.split(/\r?\n/).length : 0;
if (currentLines > baseline.lines) {
  fail(`legacy stylesheet grew from ${baseline.lines} to ${currentLines} lines; it may shrink only`);
}

const sourceRoots = [path.join(root, 'src'), path.join(root, 'tests')];
const codeExt = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const consumers = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (codeExt.test(entry.name)) {
      const text = fs.readFileSync(full, 'utf8');
      if (text.includes('components/shared-ui/shared-ui.module.sass') || text.includes('../components/shared-ui/shared-ui.module.sass') || text.includes('./components/shared-ui/shared-ui.module.sass')) {
        consumers.push(path.relative(root, full).split(path.sep).join('/'));
      }
    }
  }
}
sourceRoots.forEach(walk);
consumers.sort();

const allowed = new Set(baseline.consumers);
const newConsumers = consumers.filter((item) => !allowed.has(item));
if (newConsumers.length) fail(`new consumers are forbidden: ${newConsumers.join(', ')}`);
if (consumers.length > baseline.consumers.length) fail('consumer count increased');

const cargoDir = path.join(root, 'src/features/cargo');
const cargoLeaks = [];
function walkCargo(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkCargo(full);
    else if (/\.(ts|tsx|sass|scss|css)$/.test(entry.name)) {
      const text = fs.readFileSync(full, 'utf8');
      if (text.includes('shipper-mobile-flow/components/shared-ui') || text.includes('shared-ui.module.sass')) {
        cargoLeaks.push(path.relative(root, full).split(path.sep).join('/'));
      }
    }
  }
}
walkCargo(cargoDir);
if (cargoLeaks.length) fail(`cargo cannot depend on persona God stylesheet: ${cargoLeaks.join(', ')}`);

console.log('[shared-ui-god-stylesheet] PASS');
console.log(` frozen lines: ${baseline.lines}; current: ${targetExists ? currentLines : 'retired'}`);
console.log(` frozen consumers: ${baseline.consumers.length}; current: ${consumers.length}`);
console.log(' rule: shared-ui.module.sass may shrink, never grow');
console.log(' rule: features/cargo cannot consume persona shared styles');
