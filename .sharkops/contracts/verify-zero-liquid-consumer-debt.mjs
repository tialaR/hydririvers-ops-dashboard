import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const ds = path.join(src, 'shared', 'design-system');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const offenders = [];
for (const file of walk(src)) {
  if (file.startsWith(ds + path.sep)) continue;
  if (!/\.(ts|tsx|js|jsx)$/.test(file)) continue;
  const raw = readFileSync(file, 'utf8');
  if (/shared\/design-system\/primitives\/liquid-glass-/.test(raw)) {
    offenders.push(path.relative(root, file));
  }
}

if (offenders.length > 0) {
  console.error('[zero-liquid-consumer-debt] FAIL: direct material implementation imports remain outside design-system');
  for (const file of offenders) console.error(` - ${file}`);
  process.exit(1);
}

const lab = path.join(src, 'features', 'cargo', 'components', 'mobile-list-lab', 'mobile-cargo-list-lab.tsx');
const labRaw = readFileSync(lab, 'utf8');
if (!labRaw.includes("@/shared/design-system/components/bottom-navigation")) {
  console.error('[zero-liquid-consumer-debt] FAIL: mobile lab does not consume neutral BottomNavigation');
  process.exit(1);
}
if (!labRaw.includes("@/shared/design-system/components/bottom-sheet")) {
  console.error('[zero-liquid-consumer-debt] FAIL: mobile lab does not consume neutral BottomSheet');
  process.exit(1);
}

console.log('[zero-liquid-consumer-debt] PASS');
console.log(' direct Liquid Glass imports outside design-system: 0');
console.log(' BottomNavigation + BottomSheet: neutral consumer boundary installed');
console.log(' current glass implementation remains private and replaceable');
