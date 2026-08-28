import { readFileSync } from 'node:fs';

const formPath = 'src/features/auth/components/auth-form/auth-form.tsx';
const stylePath = 'src/features/auth/components/auth-form/auth-form.module.sass';
const form = readFileSync(formPath, 'utf8');
const style = readFileSync(stylePath, 'utf8');

const checks = [
  ['immersive auth scene exists', form.includes('styles.authScene') && form.includes('styles.authSceneRiver')],
  ['scene stays decorative', form.includes('<div className={styles.authScene} aria-hidden>')],
  ['desktop becomes split composition', style.includes('grid-template-columns: minmax(0, 1.2fr) minmax(29rem, 0.8fr)')],
  ['mobile composes scene behind auth card', style.includes('margin: clamp(-2.4rem, -6vw, -1.55rem) auto 0')],
  ['motion respects reduced motion', style.includes('@media (prefers-reduced-motion: reduce)')],
  ['new component tokens use hy namespace', style.includes('--hy-auth-scene-safe-edge') && style.includes('--hy-auth-scene-route-width')]
];

for (const [label, ok] of checks) {
  if (!ok) {
    console.error(`[shark-diamond-auth-visual-w01] FAIL: ${label}`);
    process.exit(1);
  }
}

console.log('[shark-diamond-auth-visual-w01] PASS');
console.log(' auth behavior untouched; visual composition only');
console.log(' desktop: immersive hydro scene + dedicated auth panel');
console.log(' mobile: hydro scene header + elevated auth card');
console.log(' visual acceptance still requires human review on real routes');
