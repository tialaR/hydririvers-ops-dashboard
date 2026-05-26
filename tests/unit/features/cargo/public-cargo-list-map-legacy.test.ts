import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { getPublicCargos, PUBLIC_MARKETPLACE_CARGO_IDS } from '@/features/cargo/services/cargo.service';
import { publicCargosMock } from '@/features/cargo/mocks/publicCargos.mock';
import {
  resolveCargoHydrowayMapModel,
  validateHydrowayMapModel,
} from '@/features/waterway-map/data/resolve-cargo-hydroway-model';
import {
  resolveCargoOperationalWaterwayContext,
  resolveOperationalDatasetForCargo,
} from '@/features/waterway-map/data/resolve-cargo-operational-waterway-context';
import { getCargoWaterwayTracking } from '@/features/waterway-tracking/waterway-compat';
import { buildMobileRouteSheetViewModel } from '@/features/waterway-map/utils/mobile-route-view-model';

const SRC_ROOT = join(process.cwd(), 'src');

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, acc);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

const SRC_SOURCE = collectSourceFiles(SRC_ROOT).join('\n');

describe('legado visao-geral / CargoMapImmersiveClient', () => {
  it('não referencia view=visao-geral nem CargoMapImmersiveClient em src', () => {
    expect(SRC_SOURCE).not.toMatch(/view=visao-geral/);
    expect(SRC_SOURCE).not.toMatch(/visao-geral/);
    expect(SRC_SOURCE).not.toMatch(/CargoMapImmersiveClient/);
    expect(SRC_SOURCE).not.toMatch(/cargo-map-immersive-client/);
  });

  it('cargoView só cobre abas de detalhe, não mapa', () => {
    const routes = readFileSync(join(SRC_ROOT, 'shared/routing/app-routes.ts'), 'utf8');
    expect(routes).toMatch(/cargoView:\s*\(cargoId: string, view: CargoDetailTabView\)/);
    expect(routes).toMatch(/CargoDetailTabView = 'jornada' \| 'documentos' \| 'custos' \| 'prioridade'/);
    expect(routes).not.toMatch(/visao-geral/);
  });

  it('mapa oficial usa cargoMap, não query view', () => {
    const routes = readFileSync(join(SRC_ROOT, 'shared/routing/app-routes.ts'), 'utf8');
    expect(routes).toMatch(/cargoMap:\s*\(cargoId: string\)/);
    const mapPage = readFileSync(join(SRC_ROOT, 'app/[locale]/cargas/[id]/mapa/page.tsx'), 'utf8');
    expect(mapPage).toContain('resolveCargoHydrowayMapModel');
    expect(mapPage).not.toMatch(/visao-geral/);
  });
});

describe('lista pública canônica — cobertura mínima de mapa', () => {
  it('getPublicCargos retorna todos os cargos públicos do seed e canônicos exclusivos', async () => {
    const list = await getPublicCargos();
    expect(list.map((cargo) => cargo.id)).toEqual(PUBLIC_MARKETPLACE_CARGO_IDS);
    expect(list.length).toBeGreaterThanOrEqual(publicCargosMock.length);
    expect(list.map((cargo) => cargo.id)).toContain('CARGO-006');
    expect(list.map((cargo) => cargo.id)).toContain('CARGO-007');
    expect(list.map((cargo) => cargo.id)).toContain('CARGO-009');
  });

  it('cada cargo da lista resolve modelo, tracking, contexto operacional e sheet', async () => {
    const list = await getPublicCargos();

    for (const cargo of list) {
      const model = resolveCargoHydrowayMapModel(cargo);
      expect(model, cargo.id).not.toBeNull();
      expect(validateHydrowayMapModel(model!), cargo.id).toBe(true);

      const tracking = getCargoWaterwayTracking(cargo.id);
      expect(tracking, cargo.id).toBeDefined();
      expect(tracking!.vesselName.length).toBeGreaterThan(0);

      const context = resolveCargoOperationalWaterwayContext(cargo.id);
      expect(context, cargo.id).not.toBeNull();
      expect(Array.isArray(context!.activeAlertIds)).toBe(true);

      const slice = resolveOperationalDatasetForCargo(cargo.id);
      expect(slice, cargo.id).not.toBeNull();
      expect(Array.isArray(slice!.alerts)).toBe(true);

      const sheet = buildMobileRouteSheetViewModel(cargo, model!, model!.progress01 * 100, tracking);
      expect(sheet.vesselName?.length).toBeGreaterThan(0);
      expect(sheet.etaLabel?.length).toBeGreaterThan(0);
    }
  });
});
