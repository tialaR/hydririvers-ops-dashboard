import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const screenPath = resolve(root, 'src/app/[locale]/hy-ui-lab/tmp-shark-diamond-auth/shark-diamond-auth-golden-screen.tsx');
const stylePath = resolve(root, 'src/app/[locale]/hy-ui-lab/tmp-shark-diamond-auth/shark-diamond-auth-golden-screen.module.sass');
const screen = readFileSync(screenPath, 'utf8');
const styles = readFileSync(stylePath, 'utf8');

const fail = (message) => {
  console.error(`[shark-diamond-visual-direction-w03] FAIL: ${message}`);
  process.exit(1);
};

if (/\bmock\b/i.test(screen)) fail('technical mock copy must not be exposed in the Golden Auth screen');
if (screen.includes('<select')) fail('native select must not define persona role choice in the Golden Auth screen');
if (!screen.includes('HydrowayMapProductShell')) fail('real HydroRivers waterway map context must be preserved');
if (!screen.includes('Belém · Santarém · Manaus')) fail('Amazon corridor identity must be explicit');
if (!screen.includes('roleChoiceActive')) fail('role choice must use explicit accessible selection cards');
if (!styles.includes('overflow-y: auto')) fail('desktop auth pane must allow independent vertical scroll');
if (!styles.includes('input:-webkit-autofill')) fail('browser autofill surface must be normalized to the light visual mode');
if (!styles.includes("--surface: #ffffff")) fail('PhoneInput must be visually scoped to the light Golden Auth surface');

console.log('[shark-diamond-visual-direction-w03] PASS');
console.log(' product identity: Amazon waterway operations, not decorative map');
console.log(' auth copy: no technical mock language');
console.log(' register role: accessible custom choice, no native select');
console.log(' light mode: form, autofill and phone input normalized');
console.log(' responsive behavior: independent desktop scroll + compact mobile map context');
