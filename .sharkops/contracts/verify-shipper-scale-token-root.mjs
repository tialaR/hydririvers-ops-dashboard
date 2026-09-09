import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const shellPath = resolve(root, 'src/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell.module.sass');
const scalePath = resolve(root, 'src/features/shipper-mobile-flow/styles/_shipper-rem-scale.sass');
const buttonPath = resolve(root, 'src/features/shipper-mobile-flow/components/primary-button/primary-button.module.sass');

const shell = readFileSync(shellPath, 'utf8');
const scale = readFileSync(scalePath, 'utf8');
const button = readFileSync(buttonPath, 'utf8');

function fail(message) {
  console.error(`[shipper-scale-root] FAIL: ${message}`);
  process.exit(1);
}

if (!shell.includes('@include shipper-rem-scale-tokens')) {
  fail('MobileAppShell root does not install the shipper rem-scale token set');
}
if (shell.includes('// removed missing mixin: shipper-rem-scale-tokens')) {
  fail('stale removed-mixin marker still present');
}
if (!scale.includes('--button-h: 3.25rem')) fail('button height token missing from canonical scale');
if (!scale.includes('--button-secondary-h: 3rem')) fail('secondary button height token missing from canonical scale');
if (!scale.includes('--touch-min: 2.75rem')) fail('touch minimum token missing from canonical scale');
if (!button.includes('min-height: var(--button-h)')) fail('PrimaryButton no longer consumes canonical button height token');

console.log('[shipper-scale-root] PASS');
console.log(' canonical shipper rem-scale tokens are installed at MobileAppShell root');
console.log(' PrimaryButton keeps token-driven sizing; no route-specific CSS workaround added');
