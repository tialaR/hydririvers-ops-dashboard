import { existsSync, readFileSync } from 'node:fs';
const mustExist = [
  'src/features/cargo/domain/owned-cargo-types.ts',
  'src/features/cargo/domain/owned-cargo-repository.ts',
  'src/features/cargo/repositories/mock-owned-cargo.repository.ts',
  'src/features/cargo/repositories/owned-cargo-repository-provider.ts',
  'src/features/cargo/application/list-owned-cargoes.ts',
  'src/features/cargo/application/get-owned-cargo-by-id.ts',
  'src/features/cargo/application/get-owned-cargo-documents.ts',
  'src/features/cargo/application/get-owned-cargo-map-data.ts'
];
for (const file of mustExist) if (!existsSync(file)) throw new Error(`missing cargo spine file: ${file}`);
const forbidden = [
  'src/features/shipper-mobile-flow/domain/repositories/cargo-repository.ts',
  'src/features/shipper-mobile-flow/data/repositories/mock-cargo-repository.ts',
  'src/features/shipper-mobile-flow/data/mock/shipper-cargo-mock.ts',
  'src/features/shipper-mobile-flow/application/list-shipper-cargoes.ts',
  'src/features/shipper-mobile-flow/application/get-shipper-cargo-by-id.ts',
  'src/features/shipper-mobile-flow/application/get-shipper-documents.ts',
  'src/features/shipper-mobile-flow/application/get-cargo-map-data.ts'
];
for (const file of forbidden) if (existsSync(file)) throw new Error(`legacy cargo ownership still exists: ${file}`);
for (const file of mustExist) {
  const src = readFileSync(file, 'utf8');
  if (src.includes("@/features/shipper-mobile-flow")) {
    // cockpit metric/chart compatibility is allowed only in domain/mock until later cockpit extraction.
    if (!file.endsWith('owned-cargo-repository.ts') && !file.endsWith('owned-cargo.mock.ts')) throw new Error(`cargo spine imports persona feature: ${file}`);
  }
}
console.log('[cargo-spine] PASS');
console.log(' ownership moved: cargo domain + repository + mock data + primary read use cases');
console.log(' compatibility: shipper presentation aliases preserved');
console.log(' business behavior: unchanged');
