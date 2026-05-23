'use client';

import { Suspense, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type { HydrowayMapModel } from '../../domain/hydroway-map-model.types';
import { HydrowayMapStage } from '../hydroway-map-stage';
import { useHydrowayMapRuntime } from '../../hooks/use-hydroway-map-runtime';

import { MobileHydrowayMapShell } from './mobile-hydroway-map-shell';
import { MobileMapBottomSheet } from './mobile-map-bottom-sheet';
import { MobileMapFloatingBackButton } from './mobile-map-floating-back-button';
import { MobileMapFloatingControls } from './mobile-map-floating-controls';
import { MobileMapLayerPanel } from './mobile-map-layer-panel';
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
    closeLayerPanelOnSelect: true,
    mobileCamera: true,
  });

  const { layerPresetPanelOpen, handleCloseLayerPresetPanel, handleToggleLayerPresetPanel } = runtime;

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
    <MobileHydrowayMapShell>
      <div className={styles.mapHost}>
        <HydrowayMapStage
          runtime={runtime}
          stageClassName={styles.mapStage}
          stageTestId="hydroway-map-mobile-stage"
          stageAriaLabel={tMap('waterwayMap')}
        />

        <MobileMapFloatingBackButton cargoId={cargo.id} />
        <MobileMapFloatingControls
          runtime={runtime}
          infoOpen={infoOpen}
          onToggleInfo={handleToggleInfo}
          onToggleLayers={handleToggleLayers}
        />
        <MobileMapLayerPanel runtime={runtime} />
      </div>

      <MobileMapBottomSheet
        open={infoOpen}
        onOpenChange={handleInfoOpenChange}
        cargo={cargo}
        model={model}
        progressPercent={runtime.progressPercent}
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
