import { existsSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const legacyRoot = join(root, 'src/features/shipper-mobile-flow/screens');
const authRoot = join(root, 'src/features/auth/screens');
const screenNames = ['login-screen.tsx', 'register-screen.tsx', 'verify-otp-screen.tsx'];
const canonical = screenNames.map((file) => join(authRoot, file));
const legacy = screenNames.map((file) => join(legacyRoot, file));
const fail = (message) => {
  console.error(`[auth-presentation] FAIL: ${message}`);
  process.exit(1);
};
const rel = (file) => relative(root, file).split(sep).join('/');

if (canonical.some((file) => !existsSync(file))) fail('canonical auth screen missing from features/auth');
for (const file of canonical) {
  const source = readFileSync(file, 'utf8');
  if (source.includes('features/shipper-mobile-flow')) fail(`auth presentation imports persona feature: ${rel(file)}`);
}
if (legacy.some(existsSync)) fail('persona auth compatibility adapters must remain collapsed after Wave 03');

console.log('[auth-presentation] PASS');
console.log(' login/register/OTP canonical presentation: features/auth ownership');
console.log(' persona auth compatibility adapters: 0');
console.log(' auth -> shipper-mobile-flow dependency in canonical screens: 0');
