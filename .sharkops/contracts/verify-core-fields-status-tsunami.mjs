import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coreRoot = path.join(root, 'src/shared/design-system/core');
const forbidden = /hydro|hydri|cargo|shipper|river|route|vessel/i;

const cores = ['text-field', 'search-field', 'filter-chip', 'status-badge'];
for (const name of cores) {
  const file = path.join(coreRoot, name, `${name}.tsx`);
  if (!existsSync(file)) throw new Error(`[core-fields] missing ${file}`);
  const source = readFileSync(file, 'utf8');
  if (forbidden.test(source)) throw new Error(`[core-fields] ${name} contains product-specific naming`);
}

const adapters = [
  ['src/shared/components/text-field/TextField.tsx', '<input'],
  ['src/shared/components/search-field/SearchField.tsx', '<input'],
  ['src/shared/components/filter-chip/FilterChip.tsx', '<button'],
  ['src/shared/components/status-badge/StatusBadge.tsx', '<span'],
];
for (const [rel, forbiddenDom] of adapters) {
  const source = readFileSync(path.join(root, rel), 'utf8');
  if (source.includes(forbiddenDom)) {
    throw new Error(`[core-fields] compatibility adapter still owns semantic DOM: ${rel}`);
  }
  if (!source.includes('@/shared/design-system/core/')) {
    throw new Error(`[core-fields] adapter does not delegate to core: ${rel}`);
  }
}

console.log('[core-fields] PASS');
console.log(' TextField + SearchField: semantic input ownership moved to neutral core');
console.log(' FilterChip: press interaction and button semantics moved to neutral core');
console.log(' StatusBadge: generic status semantics moved to core; business mapping remains adapter-owned');
console.log(' Existing CSS modules remain compatibility skins');
