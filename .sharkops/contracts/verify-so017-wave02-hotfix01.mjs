import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const routeClients = [
  'src/app/[locale]/(shipper-mobile-flow)/entrar/login-route-client.tsx',
  'src/app/[locale]/(shipper-mobile-flow)/registrar/register-route-client.tsx',
  'src/app/[locale]/(shipper-mobile-flow)/verificar-otp/verify-otp-route-client.tsx',
].map((file) => join(root, file));
const pages = [
  'src/app/[locale]/(shipper-mobile-flow)/entrar/page.tsx',
  'src/app/[locale]/(shipper-mobile-flow)/registrar/page.tsx',
  'src/app/[locale]/(shipper-mobile-flow)/verificar-otp/page.tsx',
].map((file) => join(root, file));
const fail = (message) => { console.error(`[so017-wave02-hotfix01] FAIL: ${message}`); process.exit(1); };

if (routeClients.some(existsSync)) fail('Wave 02 route clients still create new containment consumers');
for (const page of pages) {
  const source = readFileSync(page, 'utf8');
  if (!source.includes('@/features/shipper-mobile-flow/screens/')) fail(`baseline page importer slot not restored: ${page}`);
}
console.log('[so017-wave02-hotfix01] PASS');
console.log(' route-client consumers removed; baseline page importer slots restored');
console.log(' canonical auth presentation remains in features/auth');
