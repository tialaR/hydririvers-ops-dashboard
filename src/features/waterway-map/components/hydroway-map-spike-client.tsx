'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { SPIKE_DEFAULT_MAP_SCENE } from '../data/spike-cargo-route.mock';
import { SvgSchematicHydrowayProvider } from '../providers/svg-schematic-hydroway-provider';
import { detectWebGLSupport } from '../utils/detect-webgl';
import {
  getHydrowayMapZoomPercent,
  HYDRO_MAP_VIEWBOX,
  resetHydrowayMapCamera,
  zoomHydrowayMapCameraIn,
  zoomHydrowayMapCameraOut,
} from '../utils/hydro-map-style';
import styles from './hydroway-map-spike.module.scss';

export function HydrowayMapSpikeClient() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const providerRef = useRef<SvgSchematicHydrowayProvider | null>(null);
  const [zoomPercent, setZoomPercent] = useState(100);
  const webglReady = useSyncExternalStore(
    () => () => {},
    () => detectWebGLSupport(),
    () => false,
  );

  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return undefined;

    const provider = new SvgSchematicHydrowayProvider();
    provider.mount({
      container,
      viewBox: HYDRO_MAP_VIEWBOX,
      scene: SPIKE_DEFAULT_MAP_SCENE,
    });
    providerRef.current = provider;
    setZoomPercent(getHydrowayMapZoomPercent(provider.getCamera()));

    return () => {
      provider.destroy();
      providerRef.current = null;
    };
  }, []);

  const syncZoomLabel = useCallback(() => {
    const provider = providerRef.current;
    if (!provider) return;
    setZoomPercent(getHydrowayMapZoomPercent(provider.getCamera()));
  }, []);

  const handleZoomIn = useCallback(() => {
    const provider = providerRef.current;
    if (!provider) return;
    provider.setCamera(zoomHydrowayMapCameraIn(provider.getCamera()));
    syncZoomLabel();
  }, [syncZoomLabel]);

  const handleZoomOut = useCallback(() => {
    const provider = providerRef.current;
    if (!provider) return;
    provider.setCamera(zoomHydrowayMapCameraOut(provider.getCamera()));
    syncZoomLabel();
  }, [syncZoomLabel]);

  const handleReset = useCallback(() => {
    const provider = providerRef.current;
    if (!provider) return;
    provider.setCamera(resetHydrowayMapCamera());
    syncZoomLabel();
  }, [syncZoomLabel]);

  const handleFitRoute = useCallback(() => {
    const provider = providerRef.current;
    if (!provider) return;
    const { route } = SPIKE_DEFAULT_MAP_SCENE;
    provider.fitBounds([route.origin, route.destination, route.vessel]);
    syncZoomLabel();
  }, [syncZoomLabel]);

  const progressPercent = Math.round(SPIKE_DEFAULT_MAP_SCENE.route.progress01 * 100);
  const routeLabel = `${SPIKE_DEFAULT_MAP_SCENE.route.originLabel} → ${SPIKE_DEFAULT_MAP_SCENE.route.destinationLabel}`;

  return (
    <section className={styles.stage} aria-label="Mapa hidroviário — spike V2.1b">
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
          <span className={styles.hudValue}>SVG schematic</span>
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

      <div ref={viewportRef} className={styles.viewport} />

      <p className={styles.statusBar}>
        Amazonas • {SPIKE_DEFAULT_MAP_SCENE.route.cargoId} • provider svg-schematic • zoom {zoomPercent}%
        {webglReady ? ' • WebGL ok' : ' • WebGL indisponível'}
      </p>
    </section>
  );
}
