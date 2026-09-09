export type MobileRouteOverviewInitialState = {
  appliedCargoId: string | null;
  userInteracted: boolean;
};

export function resetMobileRouteOverviewInitialState(state: MobileRouteOverviewInitialState): void {
  state.userInteracted = false;
  state.appliedCargoId = null;
}

export function canApplyMobileInitialRouteOverview(
  state: MobileRouteOverviewInitialState,
  options: {
    mobileCamera: boolean;
    cargoId: string;
    mapReady: boolean;
  },
): boolean {
  if (!options.mobileCamera) return false;
  if (state.userInteracted) return false;
  if (state.appliedCargoId === options.cargoId) return false;
  if (!options.mapReady) return false;
  return true;
}

export function markMobileInitialRouteOverviewApplied(
  state: MobileRouteOverviewInitialState,
  cargoId: string,
): void {
  state.appliedCargoId = cargoId;
}

/** Mesma sequência do clique no FAB “Visão da rota” (handleFitRoute). */
export function createApplyRouteOverviewCameraAction(actions: {
  clearActiveChapter: () => void;
  bumpCameraFlyRequest: () => void;
  fitRouteOverview: () => boolean | void;
}): () => void {
  return () => {
    actions.clearActiveChapter();
    actions.bumpCameraFlyRequest();
    actions.fitRouteOverview();
  };
}
