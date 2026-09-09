import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  core: 'src/shared/design-system/core/badge/badge.tsx',
  coreIndex: 'src/shared/design-system/core/badge/index.ts',
  coreRoot: 'src/shared/design-system/core/index.ts',
  legacyUi: 'src/shared/ui/badge/badge.tsx',
  dsSkin: 'src/shared/design-system/components/badge/badge.tsx',
};

function fail(message) {
  console.error(`[core-badge] FAIL: ${message}`);
  process.exit(1);
}

for (const [name, relativePath] of Object.entries(files)) {
  if (!existsSync(path.join(root, relativePath))) {
    fail(`${name} missing: ${relativePath}`);
  }
}

const core = readFileSync(path.join(root, files.core), 'utf8');
const legacyUi = readFileSync(path.join(root, files.legacyUi), 'utf8');
const dsSkin = readFileSync(path.join(root, files.dsSkin), 'utf8');
const coreRoot = readFileSync(path.join(root, files.coreRoot), 'utf8');

const productTerms = /\b(hydro|hydri|hydrorivers|shipper|cargo)\b/i;
if (productTerms.test(core)) {
  fail('core Badge contains product-specific naming');
}

if (!core.includes('data-ui-component="badge"')) {
  fail('core Badge must expose a stable semantic component marker');
}

if (!legacyUi.includes("@/shared/design-system/core/badge")) {
  fail('legacy shared/ui Badge is not delegated to core Badge');
}

if (!dsSkin.includes("@/shared/design-system/core/badge")) {
  fail('Design System Badge skin is not delegated to core Badge');
}

if (!coreRoot.includes("export * from './badge'")) {
  fail('core public API does not export Badge');
}

if (legacyUi.includes('<span') || dsSkin.includes('<span')) {
  fail('compatibility Badge layers still own their own DOM implementation');
}

console.log('[core-badge] PASS');
console.log(' core primitive: src/shared/design-system/core/badge');
console.log(' legacy shared/ui Badge: compatibility skin');
console.log(' design-system DsBadge: themed skin');
console.log(' visual CSS remains untouched in this wave');
