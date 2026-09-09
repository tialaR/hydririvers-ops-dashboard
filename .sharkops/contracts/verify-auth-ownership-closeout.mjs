import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const authRoot = join(root, 'src/features/auth');
const personaRoot = join(root, 'src/features/shipper-mobile-flow');
const fail = (message) => {
  console.error(`[auth-closeout] FAIL: ${message}`);
  process.exit(1);
};
const rel = (file) => relative(root, file).split(sep).join('/');

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const authFiles = walk(authRoot).filter((file) => /\.(ts|tsx)$/.test(file));
for (const file of authFiles) {
  const source = readFileSync(file, 'utf8');
  if (source.includes('@/features/shipper-mobile-flow')) {
    fail(`features/auth imports Persona God Feature: ${rel(file)}`);
  }
}

const retiredPersonaAuthScreens = [
  'src/features/shipper-mobile-flow/screens/login-screen.tsx',
  'src/features/shipper-mobile-flow/screens/register-screen.tsx',
  'src/features/shipper-mobile-flow/screens/verify-otp-screen.tsx',
];
for (const file of retiredPersonaAuthScreens) {
  if (existsSync(join(root, file))) fail(`retired persona auth adapter returned: ${file}`);
}

const routes = [
  ['src/app/[locale]/(shipper-mobile-flow)/entrar/page.tsx', '@/features/auth/screens/login-screen'],
  ['src/app/[locale]/(shipper-mobile-flow)/registrar/page.tsx', '@/features/auth/screens/register-screen'],
  ['src/app/[locale]/(shipper-mobile-flow)/verificar-otp/page.tsx', '@/features/auth/screens/verify-otp-screen'],
];
for (const [file, expected] of routes) {
  const abs = join(root, file);
  if (!existsSync(abs)) fail(`auth route missing: ${file}`);
  const source = readFileSync(abs, 'utf8');
  if (!source.includes(expected)) fail(`auth route does not consume canonical auth screen: ${file}`);
  if (source.includes('@/features/shipper-mobile-flow/screens/')) fail(`auth route regressed to persona screen: ${file}`);
}

const provider = join(personaRoot, 'providers/shipper-flow-provider.tsx');
if (existsSync(provider)) {
  const source = readFileSync(provider, 'utf8');
  if (source.includes('isAuthenticated') || source.includes('setAuthenticated')) {
    fail('dead persona authentication state returned to shipper-flow-provider');
  }
}

const requiredAuthFiles = [
  'src/features/auth/application/get-auth-phone-countries.ts',
  'src/features/auth/application/get-current-auth-user.ts',
  'src/features/auth/application/get-mock-auth-otp.ts',
  'src/features/auth/screens/login-screen.tsx',
  'src/features/auth/screens/register-screen.tsx',
  'src/features/auth/screens/verify-otp-screen.tsx',
  'src/features/auth/components/auth-shell/auth-shell.tsx',
  'src/features/auth/components/auth-action-button/auth-action-button.tsx',
];
for (const file of requiredAuthFiles) {
  if (!existsSync(join(root, file))) fail(`canonical auth ownership file missing: ${file}`);
}

console.log('[auth-closeout] PASS');
console.log(' auth read spine + login/register/OTP presentation: features/auth ownership');
console.log(' persona auth compatibility adapters: 0');
console.log(' features/auth -> shipper-mobile-flow dependency: 0');
console.log(' auth routes consume canonical auth screens directly');
console.log(' dead persona authentication state: absent');
console.log(' shell identity/profile concerns remain explicitly outside SO-017 closeout');
