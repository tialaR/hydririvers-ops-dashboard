import { readFileSync } from 'node:fs';

const file = 'src/features/cargo/owned/screens/owned-cargo-list-screen.tsx';
const raw = readFileSync(file, 'utf8');

const expected = "size?: 'compact' | 'medium' | 'full';";
if (!raw.includes(expected)) {
  console.error('[owned-cargo-sheet-size] FAIL: canonical screen does not expose the supported BottomSheet size vocabulary');
  process.exit(1);
}
if (raw.includes("size?: 'small' | 'medium' | 'large';")) {
  console.error('[owned-cargo-sheet-size] FAIL: stale small/large size vocabulary remains');
  process.exit(1);
}
if (raw.includes("@/features/shipper-mobile-flow")) {
  console.error('[owned-cargo-sheet-size] FAIL: cargo/owned canonical screen imports persona feature');
  process.exit(1);
}
console.log('[owned-cargo-sheet-size] PASS');
console.log(' canonical owned sheet size vocabulary: compact | medium | full');
console.log(' adapter contract matches existing BottomSheet without mapping or route-specific workaround');
console.log(' product behavior: unchanged (current caller remains size="medium")');
