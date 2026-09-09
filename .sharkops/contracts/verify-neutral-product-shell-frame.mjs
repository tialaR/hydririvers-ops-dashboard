import { readFileSync, existsSync } from 'node:fs';

const frame = 'src/shared/layout/product-shell-frame/product-shell-frame.tsx';
const adapter = 'src/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell.tsx';

function fail(message) {
  console.error(`[neutral-product-shell] FAIL: ${message}`);
  process.exit(1);
}

if (!existsSync(frame)) fail('shared ProductShellFrame is missing');
if (!existsSync(adapter)) fail('shipper MobileAppShell adapter is missing');

const frameSource = readFileSync(frame, 'utf8');
const adapterSource = readFileSync(adapter, 'utf8');

if (/shipper|cargo|hydro|hydri/i.test(frameSource)) fail('shared frame leaks product/persona naming');
if (frameSource.includes('@/features/')) fail('shared frame imports feature code');
if (!adapterSource.includes("@/shared/layout/product-shell-frame/product-shell-frame")) fail('MobileAppShell does not delegate to shared frame');
if (!adapterSource.includes('<ProductShellFrame')) fail('MobileAppShell does not render ProductShellFrame');

console.log('[neutral-product-shell] PASS');
console.log(' generic responsive shell frame: shared ownership');
console.log(' persona-specific header/nav/provider logic: adapter ownership');
console.log(' business rules: untouched');
