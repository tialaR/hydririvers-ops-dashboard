import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => readFileSync(path.join(root, p), 'utf8');
const fail = (msg) => { console.error(`[sheet-material] FAIL: ${msg}`); process.exit(1); };
const mustExist = [
  'src/shared/design-system/core/sheet/sheet.tsx',
  'src/shared/design-system/core/sheet/index.ts',
  'src/shared/design-system/materials/glass/glass-material.ts',
  'src/shared/design-system/materials/glass/index.ts',
];
for (const p of mustExist) if (!existsSync(path.join(root, p))) fail(`missing ${p}`);

const core = read('src/shared/design-system/core/sheet/sheet.tsx');
for (const forbidden of ['Hydro', 'Hydri', 'Cargo', 'Shipper', 'liquid-glass', '--hydro-', '--hy-']) {
  if (core.includes(forbidden)) fail(`generic Sheet contains product/material coupling: ${forbidden}`);
}
if (!core.includes('forwardRef')) fail('Sheet must own ref-forwarding semantic container');
if (!core.includes('aria-modal')) fail('Sheet must own modal semantics');

const bottom = read('src/shared/components/bottom-sheet/BottomSheet.tsx');
if (!bottom.includes("from '@/shared/design-system/core/sheet'")) fail('shared BottomSheet is not delegating semantic shell to core Sheet');
if (!bottom.includes('<Sheet')) fail('shared BottomSheet does not render core Sheet');

const liquid = read('src/shared/design-system/primitives/liquid-glass-sheet/liquid-glass-sheet.tsx');
if (!liquid.includes("from '@/shared/design-system/core/sheet'")) fail('LiquidGlassSheet is not delegating semantic shell to core Sheet');
if (!liquid.includes('<Sheet')) fail('LiquidGlassSheet does not render core Sheet');

const legacyMaterial = read('src/shared/design-system/materials/liquid-glass-material/liquid-glass-material.ts');
if (!legacyMaterial.includes("from '../glass'")) fail('legacy liquid-glass material is not a compatibility alias to generic glass material');

const coreIndex = read('src/shared/design-system/core/index.ts');
if (!coreIndex.includes("export * from './sheet';")) fail('core index does not export Sheet');

console.log('[sheet-material] PASS');
console.log(' Sheet: one product-neutral semantic container shared by legacy BottomSheet and LiquidGlassSheet');
console.log(' glass: generic material vocabulary introduced; liquid-glass material kept as compatibility alias');
console.log(' portals, drag/snap, focus behavior and CSS remain adapter-owned');
