'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { HydrowayMapModel } from '../../domain/hydroway-map-model.types';
import { HydrowayMapStage } from '../hydroway-map-stage';
import { useHydrowayMapRuntime } from '../../hooks/use-hydroway-map-runtime';
import { getCargoWaterwayTracking } from '@/features/waterway-tracking/waterway-compat';

import { buildMobileRouteSheetViewModel } from '../../utils/mobile-route-view-model';

import { MobileHydrowayMapShell } from './mobile-hydroway-map-shell';
import { MobileMapControlStack } from './mobile-map-control-stack';
import { MobileMapLayerPanel } from './mobile-map-layer-panel';
import { MobileMapFloatingBackButton } from './mobile-map-floating-back-button';
import { MobileRouteSheet, type MobileRouteSheetSnap } from './mobile-route-sheet';
import styles from './mobile-hydroway-map.module.scss';

type MobileHydrowayMapExperienceProps = {
  cargo: Cargo;
  model: HydrowayMapModel;
};

function MobileHydrowayMapExperienceInner({ cargo, model }: MobileHydrowayMapExperienceProps) {
  const tMap = useTranslations('operationsBoard.map');
  const [infoOpen, setInfoOpen] = useState(false);
  const [routeSheetSnap, setRouteSheetSnap] = useState<MobileRouteSheetSnap>('partial');
  const runtime = useHydrowayMapRuntime({
    model,
    preferredProvider: 'maplibre',
    disableLayerTooltips: true,
    mobileCamera: true,
  });

  const {
    layerPresetPanelOpen,
    handleCloseLayerPresetPanel,
    handleToggleLayerPresetPanel,
    maplibreReady,
    mobileRouteOverviewAppliedCargoId,
    tryApplyMobileInitialRouteOverview,
  } = runtime;

  useEffect(() => {
    if (!maplibreReady) return;
    tryApplyMobileInitialRouteOverview();
  }, [maplibreReady, cargo.id, tryApplyMobileInitialRouteOverview]);

  const tracking = useMemo(() => getCargoWaterwayTracking(cargo.id), [cargo.id]);

  const sheetViewModel = useMemo(
    () => buildMobileRouteSheetViewModel(cargo, model, runtime.progressPercent, tracking),
    [cargo, model, runtime.progressPercent, tracking],
  );

  const handleOpenRouteDetails = useCallback(() => {
    if (infoOpen) return;
    if (layerPresetPanelOpen) {
      handleCloseLayerPresetPanel();
    }
    setInfoOpen(true);
  }, [handleCloseLayerPresetPanel, infoOpen, layerPresetPanelOpen]);

  const handleInfoOpenChange = useCallback((open: boolean) => {
    if (open && layerPresetPanelOpen) {
      handleCloseLayerPresetPanel();
    }
    if (!open) {
      setRouteSheetSnap('partial');
    }
    setInfoOpen(open);
  }, [handleCloseLayerPresetPanel, layerPresetPanelOpen]);

  const handleToggleLayers = useCallback(() => {
    if (!layerPresetPanelOpen && infoOpen) {
      setInfoOpen(false);
    }
    handleToggleLayerPresetPanel();
  }, [handleToggleLayerPresetPanel, infoOpen, layerPresetPanelOpen]);

  return (
    <MobileHydrowayMapShell
      sheetOpen={infoOpen}
      routeOverviewAppliedCargoId={mobileRouteOverviewAppliedCargoId}
      cargoId={model.cargoId}
    >
      <div className={styles.mapHost}>
        <HydrowayMapStage
          runtime={runtime}
          stageClassName={styles.mapStage}
          stageTestId="hydroway-map-mobile-stage"
          stageAriaLabel={tMap('waterwayMap')}
        />

        <MobileMapFloatingBackButton cargoId={cargo.id} />
        <MobileMapControlStack
          runtime={runtime}
          routeDetailsOpen={infoOpen}
          routeSheetSnap={routeSheetSnap}
          onOpenRouteDetails={handleOpenRouteDetails}
          onToggleLayers={handleToggleLayers}
        />
        <MobileMapLayerPanel runtime={runtime} />
      </div>

      <MobileRouteSheet
        open={infoOpen}
        onOpenChange={handleInfoOpenChange}
        onSnapChange={setRouteSheetSnap}
        viewModel={sheetViewModel}
      />
    </MobileHydrowayMapShell>
  );
}

function MobileHydrowayMapFallback() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.loadingPulse} aria-hidden />
    </div>
  );
}

export function MobileHydrowayMapExperience(props: MobileHydrowayMapExperienceProps) {
  return (
    <Suspense fallback={<MobileHydrowayMapFallback />}>
      <MobileHydrowayMapExperienceInner {...props} />
    </Suspense>
  );
}
