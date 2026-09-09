import { describe, expect, it, vi } from 'vitest';

import {
  canApplyMobileInitialRouteOverview,
  createApplyRouteOverviewCameraAction,
  markMobileInitialRouteOverviewApplied,
  resetMobileRouteOverviewInitialState,
} from '@/features/waterway-map/utils/mobile-route-overview-camera';

describe('mobile route overview camera', () => {
  it('createApplyRouteOverviewCameraAction replica a sequência do FAB visão da rota', () => {
    const clearActiveChapter = vi.fn();
    const bumpCameraFlyRequest = vi.fn();
    const fitRouteOverview = vi.fn(() => true);

    const apply = createApplyRouteOverviewCameraAction({
      clearActiveChapter,
      bumpCameraFlyRequest,
      fitRouteOverview,
    });

    apply();
    apply();

    expect(clearActiveChapter).toHaveBeenCalledTimes(2);
    expect(bumpCameraFlyRequest).toHaveBeenCalledTimes(2);
    expect(fitRouteOverview).toHaveBeenCalledTimes(2);
  });

  it('canApplyMobileInitialRouteOverview só permite uma aplicação por cargoId', () => {
    const state = { appliedCargoId: null, userInteracted: false };

    expect(
      canApplyMobileInitialRouteOverview(state, {
        mobileCamera: true,
        cargoId: 'CARGO-001',
        mapReady: true,
      }),
    ).toBe(true);

    markMobileInitialRouteOverviewApplied(state, 'CARGO-001');

    expect(
      canApplyMobileInitialRouteOverview(state, {
        mobileCamera: true,
        cargoId: 'CARGO-001',
        mapReady: true,
      }),
    ).toBe(false);

    expect(
      canApplyMobileInitialRouteOverview(state, {
        mobileCamera: true,
        cargoId: 'CARGO-002',
        mapReady: true,
      }),
    ).toBe(true);
  });

  it('não aplica antes do mapa estar pronto', () => {
    const state = { appliedCargoId: null, userInteracted: false };

    expect(
      canApplyMobileInitialRouteOverview(state, {
        mobileCamera: true,
        cargoId: 'CARGO-001',
        mapReady: false,
      }),
    ).toBe(false);
  });

  it('não aplica após interação manual do usuário', () => {
    const state = { appliedCargoId: null, userInteracted: true };

    expect(
      canApplyMobileInitialRouteOverview(state, {
        mobileCamera: true,
        cargoId: 'CARGO-001',
        mapReady: true,
      }),
    ).toBe(false);
  });

  it('resetMobileRouteOverviewInitialState libera nova aplicação ao trocar carga', () => {
    const state = { appliedCargoId: 'CARGO-001', userInteracted: false };

    resetMobileRouteOverviewInitialState(state);

    expect(
      canApplyMobileInitialRouteOverview(state, {
        mobileCamera: true,
        cargoId: 'CARGO-002',
        mapReady: true,
      }),
    ).toBe(true);
  });

  it('ignora mobileCamera desligado (desktop / spike)', () => {
    const state = { appliedCargoId: null, userInteracted: false };

    expect(
      canApplyMobileInitialRouteOverview(state, {
        mobileCamera: false,
        cargoId: 'CARGO-001',
        mapReady: true,
      }),
    ).toBe(false);
  });
});
