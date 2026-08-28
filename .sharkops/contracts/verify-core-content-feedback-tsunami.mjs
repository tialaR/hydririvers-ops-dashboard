import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coreRoot = path.join(root, 'src/shared/design-system/core');
const forbidden = /hydro|hydri|cargo|shipper|river|route|vessel/i;
const cores = ['card', 'informational-card', 'inline-alert', 'otp-input', 'progress-bar', 'pressable-surface'];
for (const name of cores) {
  const file = path.join(coreRoot, name, `${name}.tsx`);
  if (!existsSync(file)) throw new Error(`[core-content] missing ${file}`);
  const source = readFileSync(file, 'utf8');
  if (forbidden.test(source)) throw new Error(`[core-content] ${name} contains product-specific naming`);
}

const adapters = [
  ['src/shared/ui/card/card.tsx', '<article'],
  ['src/shared/components/informational-card/InformationalCard.tsx', '<h3'],
  ['src/shared/components/inline-alert/InlineAlert.tsx', '<p'],
  ['src/shared/components/otp-input/OtpInput.tsx', '<input'],
  ['src/shared/design-system/components/progress-bar/progress-bar.tsx', 'role="progressbar"'],
  ['src/shared/design-system/components/pressable-surface/pressable-surface.tsx', '<button'],
];
for (const [rel, forbiddenDom] of adapters) {
  const source = readFileSync(path.join(root, rel), 'utf8');
  if (source.includes(forbiddenDom)) throw new Error(`[core-content] adapter still owns semantic DOM: ${rel}`);
  if (!source.includes('@/shared/design-system/core/')) throw new Error(`[core-content] adapter does not delegate to core: ${rel}`);
}

console.log('[core-content] PASS');
console.log(' Card + InformationalCard + InlineAlert: semantic shells moved to neutral core');
console.log(' OtpInput: input behavior and accessibility moved to neutral core');
console.log(' ProgressBar + PressableSurface: semantic interaction moved to neutral core');
console.log(' Existing visual CSS remains adapter-owned');
