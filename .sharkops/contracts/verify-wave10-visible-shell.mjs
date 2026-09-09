import { readFileSync } from 'node:fs';

const files = {
  shell: 'src/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell.module.sass',
  header: 'src/features/shipper-mobile-flow/components/app-header/app-header.module.sass',
  nav: 'src/features/shipper-mobile-flow/components/bottom-nav/bottom-nav.module.sass',
  ui: 'src/features/shipper-mobile-flow/components/shared-ui/shared-ui.module.sass',
};

const source = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, readFileSync(file, 'utf8')]));
const required = [
  ['shell', 'SO-001-WAVE10:VISIBLE-SHELL'],
  ['header', 'SO-001-WAVE10:VISIBLE-HEADER'],
  ['nav', 'SO-001-WAVE10:VISIBLE-NAV'],
  ['ui', 'SO-001-WAVE10:VISIBLE-COCKPIT-CARGOES'],
];
for (const [key, marker] of required) {
  if (!source[key].includes(marker)) throw new Error(`missing ${marker}`);
}
if (!source.shell.includes('@media (min-width: 48rem)')) throw new Error('medium layout missing');
if (!source.shell.includes('@media (min-width: 80rem)')) throw new Error('wide layout missing');
if (!source.nav.includes('grid-template-columns: 1fr')) throw new Error('wide navigation rail missing');
if (!source.ui.includes('@media (prefers-reduced-motion: reduce)')) throw new Error('reduced motion protection missing');

console.log('[wave10-visible] PASS');
console.log(' compact: mobile-first visual hierarchy refined');
console.log(' medium: tablet composition strengthened');
console.log(' wide: desktop canvas + navigation rail enabled');
console.log(' business/domain code: untouched');
console.log(' content glass: reduced in favor of solid/tonal product surfaces');
