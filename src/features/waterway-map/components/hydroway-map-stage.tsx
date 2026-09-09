'use client';

import dynamic from 'next/dynamic';

import type { HydrowayMapRuntime } from '../hooks/use-hydroway-map-runtime';
import spikeStyles from './hydroway-map-spike.module.scss';

const HydrowayMapSpikeMaplibreViewport = dynamic(
  () =>
    import('./hydroway-map-spike-maplibre-viewport').then((module) => module.HydrowayMapSpikeMaplibreViewport),
  { ssr: false },
);

type HydrowayMapStageProps = {
  runtime: HydrowayMapRuntime;
  stageClassName?: string;
  stageTestId?: string;
  stageAriaLabel: string;
};

export function HydrowayMapStage({
  runtime,
  stageClassName,
  stageTestId,
  stageAriaLabel,
}: HydrowayMapStageProps) {
  const {
    model,
    svgViewportRef,
    maplibreViewportRef,
    showMapLibre,
    fallbackNote,
    handleMaplibreReady,
    handleMaplibreInitError,
    mobileCamera,
    mobileRouteOverviewAppliedCargoId,
  } = runtime;

  return (
    <section
      className={[spikeStyles.stage, stageClassName].filter(Boolean).join(' ')}
      aria-label={stageAriaLabel}
      {...(stageTestId ? { 'data-testid': stageTestId } : {})}
      {...(mobileCamera && mobileRouteOverviewAppliedCargoId === model.cargoId
        ? { 'data-mobile-route-overview-applied-cargo': mobileRouteOverviewAppliedCargoId }
        : {})}
    >
      {fallbackNote ? (
        <span hidden data-testid="hydroway-map-fallback">
          {fallbackNote}
        </span>
      ) : null}

      {showMapLibre ? (
        <HydrowayMapSpikeMaplibreViewport
          key={model.cargoId}
          ref={maplibreViewportRef}
          model={model}
          onReady={handleMaplibreReady}
          onInitError={handleMaplibreInitError}
          skipInitialRouteCamera={mobileCamera}
        />
      ) : (
        <div ref={svgViewportRef} className={spikeStyles.viewport} />
      )}
    </section>
  );
}
