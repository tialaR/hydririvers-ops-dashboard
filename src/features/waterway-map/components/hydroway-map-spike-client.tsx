'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { SPIKE_DEFAULT_MAP_SCENE } from '../data/spike-cargo-route.mock';
import {
  getMapLibreZoomPercent,
  MapLibreHydrowayProvider,
} from '../providers/maplibre-hydroway-provider';
import { SvgSchematicHydrowayProvider } from '../providers/svg-schematic-hydroway-provider';
import { detectWebGLSupport } from '../utils/detect-webgl';
import {
  getHydrowayMapZoomPercent,
  HYDRO_MAP_VIEWBOX,
  resetHydrowayMapCamera,
  zoomHydrowayMapCameraIn,
  zoomHydrowayMapCameraOut,
} from '../utils/hydro-map-style';
import type { HydrowayMapSpikeMaplibreViewportHandle } from './hydroway-map-spike-maplibre-viewport';
import styles from './hydroway-map-spike.module.scss';

const HydrowayMapSpikeMaplibreViewport = dynamic(
  () =>
    import('./hydroway-map-spike-maplibre-viewport').then((module) => module.HydrowayMapSpikeMaplibreViewport),
  { ssr: false },
);

export type HydrowaySpikeProviderMode = 'maplibre' | 'svg-schematic';

type HydrowayMapSpikeClientProps = {
  preferredProvider: HydrowaySpikeProviderMode;
};

export function HydrowayMapSpikeClient({ preferredProvider }: HydrowayMapSpikeClientProps) {
  const searchParams = useSearchParams();
  const forceSvgFallback = searchParams.get('forceSvgFallback') === '1';

  const svgViewportRef = useRef<HTMLDivElement | null>(null);
  const svgProviderRef = useRef<SvgSchematicHydrowayProvider | null>(null);
  const maplibreViewportRef = useRef<HydrowayMapSpikeMaplibreViewportHandle | null>(null);

  const [maplibreMountFailed, setMaplibreMountFailed] = useState(false);
  const [maplibreReady, setMaplibreReady] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  const webglReady = useSyncExternalStore(
    () => () => {},
    () => detectWebGLSupport(),
    () => false,
  );

  const wantsMapLibre = preferredProvider === 'maplibre' && webglReady && !forceSvgFallback && !maplibreMountFailed;
  const showMapLibre = wantsMapLibre;
  const activeProviderKind: HydrowaySpikeProviderMode =
    showMapLibre && maplibreReady ? 'maplibre' : 'svg-schematic';

  const getMapLibreProvider = useCallback((): MapLibreHydrowayProvider | null => {
    const provider = maplibreViewportRef.current?.getProvider();
    return provider?.kind === 'maplibre' ? (provider as MapLibreHydrowayProvider) : null;
  }, []);

  const syncZoomLabel = useCallback(() => {
    if (showMapLibre) {
      const mapProvider = getMapLibreProvider();
      if (!mapProvider) return;
      setZoomPercent(getMapLibreZoomPercent(mapProvider.getMapZoom()));
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    setZoomPercent(getHydrowayMapZoomPercent(provider.getCamera()));
  }, [getMapLibreProvider, showMapLibre]);

  useEffect(() => {
    if (showMapLibre) {
      svgProviderRef.current?.destroy();
      svgProviderRef.current = null;
      return undefined;
    }

    const container = svgViewportRef.current;
    if (!container) return undefined;

    const provider = new SvgSchematicHydrowayProvider();
    provider.mount({
      container,
      viewBox: HYDRO_MAP_VIEWBOX,
      scene: SPIKE_DEFAULT_MAP_SCENE,
    });
    svgProviderRef.current = provider;
    setMaplibreReady(false);
    syncZoomLabel();

    return () => {
      provider.destroy();
      svgProviderRef.current = null;
    };
  }, [showMapLibre, syncZoomLabel]);

  const handleMaplibreReady = useCallback(() => {
    setMaplibreMountFailed(false);
    setMaplibreReady(true);
    syncZoomLabel();
  }, [syncZoomLabel]);

  const handleMaplibreInitError = useCallback(() => {
    setMaplibreMountFailed(true);
    setMaplibreReady(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (showMapLibre) {
      getMapLibreProvider()?.zoomIn();
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    provider.setCamera(zoomHydrowayMapCameraIn(provider.getCamera()));
    syncZoomLabel();
  }, [getMapLibreProvider, showMapLibre, syncZoomLabel]);

  const handleZoomOut = useCallback(() => {
    if (showMapLibre) {
      getMapLibreProvider()?.zoomOut();
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    provider.setCamera(zoomHydrowayMapCameraOut(provider.getCamera()));
    syncZoomLabel();
  }, [getMapLibreProvider, showMapLibre, syncZoomLabel]);

  const handleReset = useCallback(() => {
    if (showMapLibre) {
      getMapLibreProvider()?.resetView();
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    provider.setCamera(resetHydrowayMapCamera());
    syncZoomLabel();
  }, [getMapLibreProvider, showMapLibre, syncZoomLabel]);

  const handleFitRoute = useCallback(() => {
    const { route } = SPIKE_DEFAULT_MAP_SCENE;
    const points = [route.origin, route.destination, route.vessel];

    if (showMapLibre) {
      getMapLibreProvider()?.fitBounds(points);
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    provider.fitBounds(points);
    syncZoomLabel();
  }, [getMapLibreProvider, showMapLibre, syncZoomLabel]);

  const progressPercent = Math.round(SPIKE_DEFAULT_MAP_SCENE.route.progress01 * 100);
  const routeLabel = `${SPIKE_DEFAULT_MAP_SCENE.route.originLabel} → ${SPIKE_DEFAULT_MAP_SCENE.route.destinationLabel}`;

  const providerLabel = activeProviderKind === 'maplibre' ? 'MapLibre GL' : 'SVG schematic';

  const fallbackNote = forceSvgFallback
    ? ' • fallback forçado (?forceSvgFallback=1)'
    : maplibreMountFailed
      ? ' • fallback por falha MapLibre'
      : !webglReady
        ? ' • fallback sem WebGL'
        : '';

  return (
    <section className={styles.stage} aria-label="Mapa hidroviário — spike V2.1c">
      <div className={styles.hud}>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Progresso</span>
          <span className={styles.hudValue}>{progressPercent}%</span>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Rota</span>
          <span className={styles.hudValue}>{routeLabel}</span>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Provider</span>
          <span className={styles.hudValue}>{providerLabel}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.controlButton} onClick={handleFitRoute} aria-label="Ajustar à rota">
          ⊡
        </button>
        <button type="button" className={styles.controlButton} onClick={handleZoomIn} aria-label="Aumentar zoom">
          +
        </button>
        <button type="button" className={styles.controlButton} onClick={handleZoomOut} aria-label="Diminuir zoom">
          −
        </button>
        <button type="button" className={styles.controlButton} onClick={handleReset} aria-label="Redefinir visão">
          ⟲
        </button>
      </div>

      {showMapLibre ? (
        <HydrowayMapSpikeMaplibreViewport
          ref={maplibreViewportRef}
          onReady={handleMaplibreReady}
          onInitError={handleMaplibreInitError}
        />
      ) : (
        <div ref={svgViewportRef} className={styles.viewport} />
      )}

      <p className={styles.statusBar}>
        Amazonas • {SPIKE_DEFAULT_MAP_SCENE.route.cargoId} • provider {activeProviderKind} • zoom {zoomPercent}%
        {webglReady ? ' • WebGL ok' : ' • WebGL indisponível'}
        {fallbackNote}
      </p>
    </section>
  );
}
