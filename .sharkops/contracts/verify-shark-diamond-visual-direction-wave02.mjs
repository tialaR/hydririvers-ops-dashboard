import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const page = readFileSync(resolve(root, 'src/app/[locale]/hy-ui-lab/tmp-shark-diamond-auth/page.tsx'), 'utf8');
const screen = readFileSync(resolve(root, 'src/app/[locale]/hy-ui-lab/tmp-shark-diamond-auth/shark-diamond-auth-golden-screen.tsx'), 'utf8');
const styles = readFileSync(resolve(root, 'src/app/[locale]/hy-ui-lab/tmp-shark-diamond-auth/shark-diamond-auth-golden-screen.module.sass'), 'utf8');

const failures = [];
if (!page.includes('resolveSpikeHydrowayMapModel')) failures.push('lab must use canonical waterway model');
if (!screen.includes('HydrowayMapProductShell')) failures.push('left context must use real MapLibre product map');
if (!screen.includes('PhoneInput')) failures.push('auth lab must reuse canonical country/phone control');
if (!screen.includes("'register'")) failures.push('lab must expose register composition');
if (screen.includes("t('continue')") || screen.includes("t('registerLink')")) failures.push('stale missing i18n keys remain');
if (/mock/i.test(screen.replace(/MockMode/g, ''))) failures.push('user-facing mock language must not be hard-coded in lab screen');
if (!styles.includes('.mapViewport')) failures.push('map viewport composition missing');
if (!styles.includes('background: #fff')) failures.push('neutral white input surface contract missing');

if (failures.length) {
  console.error('[shark-diamond-visual-direction-w02] FAIL');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log('[shark-diamond-visual-direction-w02] PASS');
console.log(' auth lab: real HydroRivers MapLibre context, not decorative SVG/CSS scene');
console.log(' login + register compositions available in one Golden Screen');
console.log(' canonical country/phone control reused');
console.log(' stale lab i18n keys and user-facing mock language removed');
