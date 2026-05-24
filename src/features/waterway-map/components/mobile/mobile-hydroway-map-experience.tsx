'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { HydrowayMapModel } from '../../domain/hydroway-map-model.types';
import { HydrowayMapStage } from '../hydroway-map-stage';
import { useHydrowayMapRuntime } from '../../hooks/use-hydroway-map-runtime';
import { cargoWaterwayTrackingByCargoId } from '@/features/waterway-tracking/waterway-compat';

import {
  buildMobileRouteDockViewModel,
  buildMobileRouteSheetViewModel,
} from '../../utils/mobile-route-view-model';

import { MobileHydrowayMapShell } from './mobile-hydroway-map-shell';
import { MobileMapControlStack } from './mobile-map-control-stack';
import { MobileMapLayerPanel } from './mobile-map-layer-panel';
import { MobileMapFloatingBackButton } from './mobile-map-floating-back-button';
import { MobileRouteDock } from './mobile-route-dock';
import { MobileRouteSheet } from './mobile-route-sheet';
import styles from './mobile-hydroway-map.module.scss';

type MobileHydrowayMapExperienceProps = {
  cargo: Cargo;
  model: HydrowayMapModel;
};

function MobileHydrowayMapExperienceInner({ cargo, model }: MobileHydrowayMapExperienceProps) {
  const tMap = useTranslations('operationsBoard.map');
  const [infoOpen, setInfoOpen] = useState(false);
  const runtime = useHydrowayMapRuntime({
    model,
    preferredProvider: 'maplibre',
    disableLayerTooltips: true,
    closeLayerPanelOnSelect: false,
    mobileCamera: true,
  });

  const { layerPresetPanelOpen, handleCloseLayerPresetPanel, handleToggleLayerPresetPanel } = runtime;

  const tracking = useMemo(
    () => cargoWaterwayTrackingByCargoId.get(cargo.id),
    [cargo.id],
  );

  const dockViewModel = useMemo(
    () => buildMobileRouteDockViewModel(cargo, model, runtime.progressPercent, tracking),
    [cargo, model, runtime.progressPercent, tracking],
  );

  const sheetViewModel = useMemo(
    () => buildMobileRouteSheetViewModel(cargo, model, runtime.progressPercent, tracking),
    [cargo, model, runtime.progressPercent, tracking],
  );

  const handleOpenDetails = useCallback(() => {
    if (layerPresetPanelOpen) {
      handleCloseLayerPresetPanel();
    }
    setInfoOpen(true);
  }, [handleCloseLayerPresetPanel, layerPresetPanelOpen]);

  const handleToggleInfo = useCallback(() => {
    if (!infoOpen && layerPresetPanelOpen) {
      handleCloseLayerPresetPanel();
    }
    setInfoOpen((open) => !open);
  }, [handleCloseLayerPresetPanel, infoOpen, layerPresetPanelOpen]);

  const handleInfoOpenChange = useCallback((open: boolean) => {
    if (open && layerPresetPanelOpen) {
      handleCloseLayerPresetPanel();
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
    <MobileHydrowayMapShell sheetOpen={infoOpen}>
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
          isSuppressed={infoOpen}
          infoOpen={infoOpen}
          onToggleInfo={handleToggleInfo}
          onToggleLayers={handleToggleLayers}
        />
        <MobileMapLayerPanel runtime={runtime} />
      </div>

      <MobileRouteDock
        viewModel={dockViewModel}
        sheetOpen={infoOpen}
        onOpenDetails={handleOpenDetails}
      />

      <MobileRouteSheet
        open={infoOpen}
        onOpenChange={handleInfoOpenChange}
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
