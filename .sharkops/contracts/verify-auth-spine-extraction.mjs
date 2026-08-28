import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const auth = path.join(root, 'src/features/auth');
const persona = path.join(root, 'src/features/shipper-mobile-flow');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const required = [
  'src/features/auth/domain/auth-experience-types.ts',
  'src/features/auth/domain/auth-experience-repository.ts',
  'src/features/auth/mocks/auth-experience.mock.ts',
  'src/features/auth/repositories/mock-auth-experience.repository.ts',
  'src/features/auth/repositories/auth-experience-repository-provider.ts',
  'src/features/auth/application/get-current-auth-user.ts',
  'src/features/auth/application/get-auth-phone-countries.ts',
  'src/features/auth/application/get-mock-auth-otp.ts'
];

for (const rel of required) {
  if (!existsSync(path.join(root, rel))) throw new Error(`missing auth-owned spine file: ${rel}`);
}

const retired = [
  'src/features/shipper-mobile-flow/application/get-current-shipper-user.ts',
  'src/features/shipper-mobile-flow/application/get-phone-countries.ts',
  'src/features/shipper-mobile-flow/application/get-mock-otp.ts',
  'src/features/shipper-mobile-flow/data/mock/shipper-auth-mock.ts',
  'src/features/shipper-mobile-flow/data/mock/shipper-user-mock.ts',
  'src/features/shipper-mobile-flow/data/repositories/mock-user-repository.ts',
  'src/features/shipper-mobile-flow/domain/repositories/user-repository.ts'
];
for (const rel of retired) {
  if (existsSync(path.join(root, rel))) throw new Error(`retired persona auth file still exists: ${rel}`);
}

for (const file of walk(auth).filter((file) => /\.(ts|tsx)$/.test(file))) {
  const raw = readFileSync(file, 'utf8');
  if (raw.includes('@/features/shipper-mobile-flow')) {
    throw new Error(`auth imports persona feature: ${path.relative(root, file)}`);
  }
}

const routeExpectations = [
  ['src/app/[locale]/(shipper-mobile-flow)/layout.tsx', '@/features/auth/application/get-current-auth-user'],
  ['src/app/[locale]/(shipper-mobile-flow)/entrar/page.tsx', '@/features/auth/application/get-auth-phone-countries'],
  ['src/app/[locale]/(shipper-mobile-flow)/registrar/page.tsx', '@/features/auth/application/get-auth-phone-countries'],
  ['src/app/[locale]/(shipper-mobile-flow)/verificar-otp/page.tsx', '@/features/auth/application/get-mock-auth-otp']
];
for (const [rel, marker] of routeExpectations) {
  const raw = readFileSync(path.join(root, rel), 'utf8');
  if (!raw.includes(marker)) throw new Error(`route not rewired to auth ownership: ${rel}`);
}

const provider = readFileSync(path.join(persona, 'data/repositories/repository-provider.ts'), 'utf8');
if (/mockUserRepository|UserRepository|\buser:\s/.test(provider)) {
  throw new Error('persona repository provider still owns auth user repository');
}

const types = readFileSync(path.join(persona, 'types/shipper-flow-types.ts'), 'utf8');
if (!types.includes('export type ShipperUser = AuthExperienceUser;') || !types.includes('export type ShipperPhoneCountry = AuthPhoneCountryOption;')) {
  throw new Error('persona auth compatibility types are not aliases to auth ownership');
}

console.log('[auth-spine] PASS');
console.log(' auth current-user / phone-country / OTP read spine: features/auth ownership');
console.log(' persona auth repository + mock + read-use-case files: removed');
console.log(' auth -> shipper-mobile-flow dependency: 0');
console.log(' login/register/OTP presentation remains unchanged for next extraction wave');
