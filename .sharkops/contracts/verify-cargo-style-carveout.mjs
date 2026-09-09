import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const legacy = path.join(root, 'src/features/shipper-mobile-flow/components/shared-ui/shared-ui.module.sass');
const cargoStyle = path.join(root, 'src/features/cargo/styles/cargo-flow.module.sass');
const stateFile = path.join(root, '.sharkops/contracts/cargo-style-carveout.json');
const targets = [
  'src/features/shipper-mobile-flow/screens/my-cargoes-screen.tsx',
  'src/features/shipper-mobile-flow/screens/public-cargoes-screen.tsx',
  'src/features/shipper-mobile-flow/screens/cargo-detail-screen.tsx',
  'src/features/shipper-mobile-flow/screens/public-cargo-detail-screen.tsx',
  'src/features/shipper-mobile-flow/screens/documents-screen.tsx',
];

function fail(message) {
  console.error(`[cargo-style-carveout] FAIL: ${message}`);
  process.exit(1);
}

if (!existsSync(cargoStyle)) fail('cargo-owned style module is missing');
if (!existsSync(stateFile)) fail('carve-out state is missing');
const state = JSON.parse(readFileSync(stateFile, 'utf8'));
const legacyText = readFileSync(legacy, 'utf8');
const cargoText = readFileSync(cargoStyle, 'utf8');
const currentLines = legacyText.split(/\r?\n/).length;
if (currentLines > state.afterLines) fail(`legacy stylesheet grew: frozen ${state.afterLines}, current ${currentLines}`);
if (currentLines >= state.beforeLines) fail(`legacy stylesheet did not shrink: before ${state.beforeLines}, current ${currentLines}`);
if (cargoText.includes('shipper-mobile-flow')) fail('cargo-owned stylesheet references persona feature');

let consumers = 0;
for (const rel of targets) {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) fail(`target screen missing: ${rel}`);
  const raw = readFileSync(abs, 'utf8');
  if (raw.includes('shared-ui/shared-ui.module.sass')) fail(`target still consumes God stylesheet: ${rel}`);
  if (!raw.includes("@/features/cargo/styles/cargo-flow.module.sass")) fail(`target does not consume cargo-owned styles: ${rel}`);
}

const screenDir = path.join(root, 'src/features/shipper-mobile-flow/screens');
for (const rel of state.remainingLegacyConsumers) {
  const abs = path.join(root, rel);
  if (existsSync(abs) && readFileSync(abs, 'utf8').includes('shared-ui/shared-ui.module.sass')) consumers += 1;
}
if (consumers > state.afterConsumers) fail(`legacy consumer count regressed: frozen ${state.afterConsumers}, current ${consumers}`);

console.log('[cargo-style-carveout] PASS');
console.log(` legacy stylesheet: ${state.beforeLines} -> <= ${state.afterLines} lines`);
console.log(` cargo screen consumers removed: ${targets.length}`);
console.log(` remaining legacy consumers frozen at <= ${state.afterConsumers}`);
console.log(' business behavior: untouched; ownership only');
