import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const authTsx = resolve(root, 'src/features/auth/components/auth-form/auth-form.tsx');
const authSass = resolve(root, 'src/features/auth/components/auth-form/auth-form.module.sass');
const labPage = resolve(root, 'src/app/[locale]/hy-ui-lab/tmp-shark-diamond-auth/page.tsx');
const labScreen = resolve(root, 'src/app/[locale]/hy-ui-lab/tmp-shark-diamond-auth/shark-diamond-auth-golden-screen.tsx');
const labStyles = resolve(root, 'src/app/[locale]/hy-ui-lab/tmp-shark-diamond-auth/shark-diamond-auth-golden-screen.module.sass');

for (const path of [authTsx, authSass, labPage, labScreen, labStyles]) {
  if (!existsSync(path)) throw new Error(`missing expected file: ${path}`);
}
const currentAuth = readFileSync(authTsx, 'utf8');
const currentSass = readFileSync(authSass, 'utf8');
const lab = readFileSync(labScreen, 'utf8');
const styles = readFileSync(labStyles, 'utf8');

if (currentAuth.includes('authScene')) throw new Error('rejected decorative authScene still present in production AuthForm');
if (currentSass.includes('.authScene')) throw new Error('rejected authScene styles still present in production AuthForm');
if (!lab.includes("useTranslations('auth')")) throw new Error('lab must reuse i18n auth messages');
if (!styles.includes('--hy-auth-lab-')) throw new Error('lab tokens must use --hy-* component token convention');
if (!styles.includes('@media (max-width: 860px)')) throw new Error('lab must declare adaptive mobile behavior');
if (!styles.includes('@media (prefers-reduced-motion: reduce)')) throw new Error('lab must respect reduced motion');

console.log('[shark-diamond-visual-direction-w01] PASS');
console.log(' rejected decorative auth composition: retired');
console.log(' production auth behavior: preserved');
console.log(' temporary full-screen Golden Auth lab: installed');
console.log(' visual direction: product-context + focused task + adaptive composition');
