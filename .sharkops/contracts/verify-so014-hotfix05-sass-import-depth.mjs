import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skeleton = path.join(root, 'src/features/cargo/public/components/public-cargas-mobile/public-cargas-mobile-skeleton.module.scss');
const action = path.join(root, 'src/features/cargo/public/components/public-cargas-mobile/public-cargo-action-sheet.module.scss');

const fail = (message) => {
  console.error(`[so014-hotfix05] FAIL: ${message}`);
  process.exit(1);
};

for (const file of [skeleton, action]) {
  if (!existsSync(file)) fail(`missing target: ${path.relative(root, file)}`);
}

const skeletonSource = readFileSync(skeleton, 'utf8');
const actionSource = readFileSync(action, 'utf8');

if (!skeletonSource.includes("@use '../../../../../shared/styles/tokens/hy-v2-light' as hyV2Light;")) {
  fail('public cargo skeleton does not resolve shared hy-v2-light from its new public slice depth');
}
if (skeletonSource.includes("@use '../../../../shared/styles/tokens/hy-v2-light'")) {
  fail('stale pre-boundary skeleton import remains');
}
if (!actionSource.includes("@use '../../../styles/cargo-v2-light-shell' as cargoV2Shell;")) {
  fail('public action sheet does not resolve cargo shared style ownership from its new public slice depth');
}
if (actionSource.includes("@use '../../styles/cargo-v2-light-shell'")) {
  fail('stale pre-boundary action-sheet import remains');
}

console.log('[so014-hotfix05] PASS');
console.log(' public skeleton token import: shared ownership resolved');
console.log(' public action-sheet shell import: neutral cargo ownership resolved');
