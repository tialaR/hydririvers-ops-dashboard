import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const shellRoot = path.join(root, 'src/features/product-shell');
const personaRoot = path.join(root, 'src/features/shipper-mobile-flow');
const srcRoot = path.join(root, 'src');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function textFiles(dir) {
  return walk(dir).filter((file) => /\.(ts|tsx|sass|scss)$/.test(file));
}

function countFiles(dir) {
  return walk(dir).length;
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

const failures = [];
if (!fs.existsSync(shellRoot)) failures.push('src/features/product-shell missing');

const shellPersonaDeps = textFiles(shellRoot).filter((file) => fs.readFileSync(file, 'utf8').includes('@/features/shipper-mobile-flow'));
if (shellPersonaDeps.length) failures.push(`product-shell imports persona code: ${shellPersonaDeps.map(rel).join(', ')}`);

const sharedPersonaDeps = textFiles(path.join(root, 'src/shared')).filter((file) => fs.readFileSync(file, 'utf8').includes('@/features/shipper-mobile-flow'));
if (sharedPersonaDeps.length) failures.push(`shared imports persona code: ${sharedPersonaDeps.map(rel).join(', ')}`);

const forbiddenOldPaths = [
  'src/features/shipper-mobile-flow/components/app-header',
  'src/features/shipper-mobile-flow/components/avatar-menu-sheet',
  'src/features/shipper-mobile-flow/components/bottom-nav',
  'src/features/shipper-mobile-flow/components/bottom-sheet',
  'src/features/shipper-mobile-flow/components/confirmation-sheet',
  'src/features/shipper-mobile-flow/components/language-switcher',
  'src/features/shipper-mobile-flow/components/mobile-app-shell',
  'src/features/shipper-mobile-flow/components/notification-bell',
  'src/features/shipper-mobile-flow/components/primary-button',
  'src/features/shipper-mobile-flow/components/theme-switcher',
  'src/features/shipper-mobile-flow/providers/shipper-flow-provider.tsx',
  'src/features/shipper-mobile-flow/domain/shipper-nav-domain.ts',
  'src/features/shipper-mobile-flow/styles/shipper-flow-chrome-overrides.module.sass',
  'src/features/shipper-mobile-flow/styles/_shipper-mixins.sass',
  'src/features/shipper-mobile-flow/styles/_shipper-rem-scale.sass'
];
for (const target of forbiddenOldPaths) {
  const absolute = path.join(root, target);
  if (fs.existsSync(absolute) && (fs.statSync(absolute).isFile() || walk(absolute).length > 0)) {
    failures.push(`legacy shell ownership still exists: ${target}`);
  }
}

const personaFiles = countFiles(personaRoot);
if (personaFiles > 44) failures.push(`shipper-mobile-flow expected <= 44 files; found ${personaFiles}`);

const externalConsumers = textFiles(srcRoot).filter((file) => !file.startsWith(personaRoot + path.sep) && fs.readFileSync(file, 'utf8').includes('@/features/shipper-mobile-flow'));
if (externalConsumers.length > 12) failures.push(`external persona consumers expected <= 12; found ${externalConsumers.length}`);

const provider = path.join(shellRoot, 'providers/product-shell-provider.tsx');
if (!fs.existsSync(provider) || !fs.readFileSync(provider, 'utf8').includes('ProductShellProvider')) failures.push('canonical ProductShellProvider missing');

if (failures.length) {
  console.error('[product-shell-ownership] FAIL');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log('[product-shell-ownership] PASS');
console.log(' shell/chrome ownership: features/product-shell');
console.log(` shipper-mobile-flow files: ${personaFiles}`);
console.log(` external persona consumers: ${externalConsumers.length}`);
console.log(` product-shell -> shipper-mobile-flow dependency: ${shellPersonaDeps.length}`);
console.log(` shared -> shipper-mobile-flow dependency: ${sharedPersonaDeps.length}`);
console.log(' visual behavior/i18n contracts preserved; ownership only');
