import type { OwnedCargoDesktopFacts } from '@/features/cargo/owned/application/owned-cargo-desktop-view-model';
import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import {
  PAGE_61_219_254_VISUAL_FIXTURE_ID,
  getPage61219254DesktopFacts,
  page61219254SelectedVisualFacts,
  page61219254VisualCargoes,
} from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';

export type OwnedCargoDesktopDataset = {
  cargoes: OwnedCargo[];
  factsForCargo: (cargo: OwnedCargo) => OwnedCargoDesktopFacts | undefined;
  detailTabLabels?: readonly [string, string, string, string, string];
};

export function resolveOwnedCargoDesktopDataset(
  cargoes: OwnedCargo[],
  fixtureId: string | null,
): OwnedCargoDesktopDataset {
  if (fixtureId !== PAGE_61_219_254_VISUAL_FIXTURE_ID) {
    return {
      cargoes,
      factsForCargo: () => undefined,
    };
  }

  return {
    cargoes: page61219254VisualCargoes,
    factsForCargo: getPage61219254DesktopFacts,
    detailTabLabels: page61219254SelectedVisualFacts.tabs,
  };
}
