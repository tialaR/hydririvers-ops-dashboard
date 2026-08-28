import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  adr: 'docs/adr/0041-responsive-visual-language-contract.md',
  breakpoints: 'src/shared/design-system/foundations/responsive/breakpoints.ts',
  responsive: 'src/shared/design-system/foundations/responsive/responsive.module.sass',
  theme: 'src/shared/design-system/themes/hydrorivers/visual-language.module.sass',
};

for (const [label, rel] of Object.entries(files)) {
  if (!existsSync(path.join(root, rel))) {
    console.error(`[responsive-visual] FAIL: missing ${label}: ${rel}`);
    process.exit(1);
  }
}

const breakpoints = readFileSync(path.join(root, files.breakpoints), 'utf8');
const responsive = readFileSync(path.join(root, files.responsive), 'utf8');
const theme = readFileSync(path.join(root, files.theme), 'utf8');
const combined = `${breakpoints}\n${responsive}`;

if (!breakpoints.includes("ResponsiveViewport = 'compact' | 'medium' | 'wide'")) {
  console.error('[responsive-visual] FAIL: compact/medium/wide vocabulary missing');
  process.exit(1);
}
if (!responsive.includes('@media (min-width: 48rem)') || !responsive.includes('@media (min-width: 80rem)')) {
  console.error('[responsive-visual] FAIL: tablet/desktop layout thresholds missing');
  process.exit(1);
}
if (!theme.includes('@media (prefers-reduced-motion: reduce)')) {
  console.error('[responsive-visual] FAIL: reduced-motion contract missing');
  process.exit(1);
}
if (/features\/(cargo|marketplace|shipper)|domain\/|repositories\//i.test(combined + '\n' + theme)) {
  console.error('[responsive-visual] FAIL: design-system visual foundations contain business coupling');
  process.exit(1);
}
console.log('[responsive-visual] PASS');
console.log(' mobile-first compact mode: protected');
console.log(' tablet medium mode: first-class');
console.log(' desktop wide mode: first-class');
console.log(' business/domain coupling: absent');
console.log(' reduced motion: protected');
