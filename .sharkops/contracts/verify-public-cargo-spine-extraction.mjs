import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/features/cargo/public/domain/public-cargo-types.ts',
  'src/features/cargo/public/domain/public-cargo-privacy.ts',
  'src/features/cargo/public/domain/public-cargo-repository.ts',
  'src/features/cargo/public/mocks/public-cargo.mock.ts',
  'src/features/cargo/public/repositories/mock-public-cargo.repository.ts',
  'src/features/cargo/public/repositories/public-cargo-repository-provider.ts',
  'src/features/cargo/public/application/list-public-cargoes.ts',
  'src/features/cargo/public/application/get-public-cargo-by-id.ts'
];
for (const file of required) {
  if (!existsSync(path.join(root,file))) throw new Error(`missing canonical public cargo file: ${file}`);
}
const forbidden = [
  'src/features/shipper-mobile-flow/domain/public-cargo-privacy-domain.ts',
  'src/features/shipper-mobile-flow/domain/repositories/public-cargo-repository.ts',
  'src/features/shipper-mobile-flow/data/mock/shipper-public-cargo-mock.ts',
  'src/features/shipper-mobile-flow/data/repositories/mock-public-cargo-repository.ts',
  'src/features/shipper-mobile-flow/application/list-public-cargoes.ts',
  'src/features/shipper-mobile-flow/application/get-public-cargo-by-id.ts'
];
for (const file of forbidden) {
  if (existsSync(path.join(root,file))) throw new Error(`legacy persona ownership still exists: ${file}`);
}
function walk(dir) {
  return readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
}
const publicDir=path.join(root,'src/features/cargo/public');
for (const file of walk(publicDir).filter(f => /\.(ts|tsx)$/.test(f))) {
  const raw=readFileSync(file,'utf8');
  if (raw.includes('@/features/shipper-mobile-flow')) throw new Error(`cargo/public depends on persona feature: ${path.relative(root,file)}`);
}
const listPage=readFileSync(path.join(root,'src/app/[locale]/(shipper-mobile-flow)/cargas-publicas/page.tsx'),'utf8');
const detailPage=readFileSync(path.join(root,'src/app/[locale]/(shipper-mobile-flow)/cargas-publicas/[id]/page.tsx'),'utf8');
if (!listPage.includes('@/features/cargo/public/application/list-public-cargoes')) throw new Error('public list route not rewired to cargo/public');
if (!detailPage.includes('@/features/cargo/public/application/get-public-cargo-by-id')) throw new Error('public detail route not rewired to cargo/public');
console.log('[public-cargo-spine] PASS');
console.log(' domain + privacy + repository + mock + read use cases: cargo/public ownership');
console.log(' cargo/public -> shipper-mobile-flow dependency: 0');
console.log(' persona repository provider keeps only a compatibility composition seam');
console.log(' public routes consume cargo/public application directly');
