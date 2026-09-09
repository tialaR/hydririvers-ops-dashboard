import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const fail = (message) => {
  console.error(`[auth-adapter-collapse] FAIL: ${message}`);
  process.exit(1);
};
const read = (file) => readFileSync(join(root, file), 'utf8');

const legacyScreens = [
  'src/features/shipper-mobile-flow/screens/login-screen.tsx',
  'src/features/shipper-mobile-flow/screens/register-screen.tsx',
  'src/features/shipper-mobile-flow/screens/verify-otp-screen.tsx',
];
for (const file of legacyScreens) {
  if (existsSync(join(root, file))) fail(`legacy persona auth adapter still exists: ${file}`);
}

const routes = [
  'src/app/[locale]/(shipper-mobile-flow)/entrar/page.tsx',
  'src/app/[locale]/(shipper-mobile-flow)/registrar/page.tsx',
  'src/app/[locale]/(shipper-mobile-flow)/verificar-otp/page.tsx',
];
for (const file of routes) {
  const source = read(file);
  if (source.includes('@/features/shipper-mobile-flow')) fail(`auth route still consumes persona feature: ${file}`);
  if (!source.includes('@/features/auth/')) fail(`auth route is not wired to auth ownership: ${file}`);
}

const canonical = [
  'src/features/auth/screens/login-screen.tsx',
  'src/features/auth/screens/register-screen.tsx',
  'src/features/auth/screens/verify-otp-screen.tsx',
  'src/features/auth/components/auth-shell/auth-shell.tsx',
  'src/features/auth/components/auth-action-button/auth-action-button.tsx',
];
for (const file of canonical) {
  const source = read(file);
  if (source.includes('features/shipper-mobile-flow')) fail(`auth ownership imports persona feature: ${file}`);
}

const provider = read('src/features/shipper-mobile-flow/providers/shipper-flow-provider.tsx');
if (provider.includes('isAuthenticated') || provider.includes('setAuthenticated')) {
  fail('dead persona authentication state still exists in ShipperFlowProvider');
}

const otp = read('src/features/auth/screens/verify-otp-screen.tsx');
if (otp.includes('onAuthenticated')) fail('OTP canonical screen still exposes persona session callback');

console.log('[auth-adapter-collapse] PASS');
console.log(' persona login/register/OTP adapters: 3 -> 0');
console.log(' auth routes consume features/auth directly');
console.log(' auth shell/action presentation: auth ownership over neutral shared primitives');
console.log(' dead persona authentication state: removed');
console.log(' features/auth -> shipper-mobile-flow dependency: 0');
