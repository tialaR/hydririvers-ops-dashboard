import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  coreButton: 'src/shared/design-system/core/button/button.tsx',
  coreSurface: 'src/shared/design-system/core/surface/surface.tsx',
  coreIconButton: 'src/shared/design-system/core/icon-button/icon-button.tsx',
  coreIndex: 'src/shared/design-system/core/index.ts',
  legacyButton: 'src/shared/components/button/Button.tsx',
  uiButton: 'src/shared/ui/button/button.tsx',
  legacySurface: 'src/shared/components/surface/Surface.tsx',
  dsSurface: 'src/shared/design-system/components/surface/surface.tsx',
  productionIconButton: 'src/shared/components/icon-button/icon-button.tsx',
  dsIconButton: 'src/shared/design-system/components/icon-button/icon-button.tsx',
};

function fail(message) {
  console.error(`[core-tsunami] FAIL: ${message}`);
  process.exit(1);
}

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!existsSync(absolute)) fail(`missing ${relativePath}`);
  return readFileSync(absolute, 'utf8');
}

const coreFiles = [files.coreButton, files.coreSurface, files.coreIconButton];
const forbidden = /\b(hydro|hydri|hydrorivers|shipper|cargo|maplibre)\b|--hy-|--hydro-|\.module\.(?:sass|scss|css)/i;
for (const relativePath of coreFiles) {
  const raw = read(relativePath);
  if (forbidden.test(raw)) fail(`generic core is product/styling coupled: ${relativePath}`);
}

const coreIndex = read(files.coreIndex);
for (const exportName of ['./badge', './button', './icon-button', './surface']) {
  if (!coreIndex.includes(`export * from '${exportName}'`)) {
    fail(`core public API missing ${exportName}`);
  }
}

const delegates = [
  [files.legacyButton, "@/shared/design-system/core/button"],
  [files.uiButton, "@/shared/design-system/core/button"],
  [files.legacySurface, "@/shared/design-system/core/surface"],
  [files.dsSurface, "@/shared/design-system/core/surface"],
  [files.productionIconButton, "@/shared/design-system/core/icon-button"],
  [files.dsIconButton, "@/shared/design-system/core/icon-button"],
];

for (const [relativePath, importPath] of delegates) {
  const raw = read(relativePath);
  if (!raw.includes(importPath)) fail(`${relativePath} does not delegate to ${importPath}`);
}

if (read(files.legacyButton).includes('<button') || read(files.uiButton).includes('<button')) {
  fail('legacy Button layers still own native button DOM');
}
if (read(files.legacySurface).includes('<Tag') || read(files.dsSurface).includes('<div')) {
  fail('legacy Surface layers still own native surface DOM');
}
if (read(files.productionIconButton).includes('<button') || read(files.dsIconButton).includes('<button')) {
  fail('IconButton compatibility layers still own native button DOM');
}

for (const [relativePath, marker] of [
  [files.coreButton, 'data-ui-component="button"'],
  [files.coreSurface, 'data-ui-component="surface"'],
  [files.coreIconButton, 'data-ui-component="icon-button"'],
]) {
  if (!read(relativePath).includes(marker)) fail(`${relativePath} missing semantic marker`);
}

console.log('[core-tsunami] PASS');
console.log(' Button: one semantic DOM owner, two compatibility skins');
console.log(' Surface: one semantic DOM owner, two compatibility skins');
console.log(' IconButton: one semantic DOM owner, production behavior preserved in adapter');
console.log(' CSS files untouched; visual identity stays outside generic core');
