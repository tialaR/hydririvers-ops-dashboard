#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const root = process.cwd();
const read = async (path) => readFile(new URL(path, `file://${root}/`), 'utf8');

const uiFiles = [
  'src/features/cargo/owned/screens/owned-cargo-desktop-foundation.tsx',
  'src/features/cargo/owned/components/owned-cargo-shipment-card.tsx',
  'src/features/cargo/owned/components/owned-cargo-detail-summary.tsx',
  'src/features/cargo/owned/components/owned-cargo-attention-panel.tsx',
  'src/features/cargo/owned/components/owned-cargo-detail-tabs.tsx',
];

const forbiddenUiFragments = [
  'visualFixtureEnabled',
  '/fixtures/',
  '/repositories/',
  '/mocks/',
  'shared/server',
  'maplibre-gl',
];

const failures = [];

for (const path of uiFiles) {
  const source = await read(path);
  for (const fragment of forbiddenUiFragments) {
    if (source.includes(fragment)) {
      failures.push(`${path}: forbidden UI dependency/branch "${fragment}"`);
    }
  }
}

const screen = await read('src/features/cargo/owned/screens/owned-cargo-desktop-foundation.tsx');
if (!screen.includes('resolveOwnedCargoDesktopDataset')) {
  failures.push('Page 61 screen must resolve deterministic fixture data through the application boundary');
}
if (!screen.includes('buildOwnedCargoDesktopViewModel')) {
  failures.push('Page 61 screen must consume the owned-cargo view-model contract');
}

const datasetResolver = await read('src/features/cargo/owned/application/resolve-owned-cargo-desktop-dataset.ts');
if (!datasetResolver.includes('/fixtures/page-61-219-254.visual-fixture')) {
  failures.push('fixture resolution must remain isolated in the application dataset resolver');
}

const repositoryContract = await read('src/features/cargo/owned/domain/owned-cargo-repository.ts');
const repositoryProvider = await read('src/features/cargo/owned/repositories/owned-cargo-repository-provider.ts');
if (!repositoryContract.includes('export type OwnedCargoRepository')) {
  failures.push('owned-cargo repository domain contract is missing');
}
if (!repositoryProvider.includes('): OwnedCargoRepository')) {
  failures.push('repository provider must return the domain repository contract');
}

const mapComponent = await read('src/features/waterway-map/components/owned-cargo-operation-map/owned-cargo-operation-map.tsx');
if (mapComponent.includes("from 'maplibre-gl'") || mapComponent.includes('from "maplibre-gl"')) {
  failures.push('product map component must not depend directly on MapLibre; provider owns the vendor dependency');
}

const mapProvider = await read('src/features/waterway-map/providers/maplibre-hydroway-provider.tsx');
if (!mapProvider.includes("from 'maplibre-gl'")) {
  failures.push('MapLibre vendor dependency must remain isolated in the provider layer');
}

if (failures.length > 0) {
  console.error('PAGE61 ARCHITECTURE CONTRACT FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PAGE61 ARCHITECTURE CONTRACT PASS', {
  fixture: 'data-only via application resolver',
  ui: 'fixture-agnostic canonical components',
  repository: 'domain contract boundary preserved',
  map: 'vendor dependency isolated behind provider',
});
