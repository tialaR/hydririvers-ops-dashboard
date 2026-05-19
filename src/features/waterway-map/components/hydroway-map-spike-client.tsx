'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { hydrowayModelToScene } from '../adapters/hydroway-model-to-scene';
import { HYDROWAY_DEMO_CARGO_IDS } from '../domain/hydroway-entities.types';
import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
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
  model: HydrowayMapModel;
  preferredProvider: HydrowaySpikeProviderMode;
};

export function HydrowayMapSpikeClient({ model, preferredProvider }: HydrowayMapSpikeClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const forceSvgFallback = searchParams.get('forceSvgFallback') === '1';

  const schematicScene = useMemo(() => hydrowayModelToScene(model), [model]);

  const svgViewportRef = useRef<HTMLDivElement | null>(null);
  const svgProviderRef = useRef<SvgSchematicHydrowayProvider | null>(null);
  const maplibreViewportRef = useRef<HydrowayMapSpikeMaplibreViewportHandle | null>(null);

  const [maplibreMountFailed, setMaplibreMountFailed] = useState(false);
  const [maplibreReady, setMaplibreReady] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [animationPaused, setAnimationPaused] = useState(false);

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
      model,
    });
    svgProviderRef.current = provider;
    setMaplibreReady(false);
    syncZoomLabel();

    return () => {
      provider.destroy();
      svgProviderRef.current = null;
    };
  }, [model, showMapLibre, syncZoomLabel]);

  const handleMaplibreReady = useCallback(() => {
    setMaplibreMountFailed(false);
    setMaplibreReady(true);
    const mapProvider = maplibreViewportRef.current?.getProvider();
    if (mapProvider?.kind === 'maplibre') {
      setAnimationPaused((mapProvider as MapLibreHydrowayProvider).isAnimationPaused());
    }
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

  const handleToggleAnimation = useCallback(() => {
    const mapProvider = getMapLibreProvider();
    if (!mapProvider) return;
    const paused = mapProvider.toggleAnimationPause();
    setAnimationPaused(paused);
  }, [getMapLibreProvider]);

  const handleFitRoute = useCallback(() => {
    if (showMapLibre) {
      getMapLibreProvider()?.resetView();
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    const { origin, destination, vessel } = schematicScene.route;
    provider.fitBounds([origin, destination, vessel]);
    syncZoomLabel();
  }, [getMapLibreProvider, schematicScene.route, showMapLibre, syncZoomLabel]);

  const selectCargo = useCallback(
    (cargoId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('cargoId', cargoId);
      if (forceSvgFallback) {
        params.set('forceSvgFallback', '1');
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [forceSvgFallback, pathname, router, searchParams],
  );

  const progressPercent = Math.round(model.progress01 * 100);
  const routeLabel = model.metadata.routeName;
  const isMapLibreActive = activeProviderKind === 'maplibre';

  const fallbackNote = forceSvgFallback
    ? 'fallback ?forceSvgFallback=1'
    : maplibreMountFailed
      ? 'fallback falha MapLibre'
      : !webglReady
        ? 'fallback sem WebGL'
        : null;

  return (
    <section className={styles.stage} aria-label="Mapa hidroviário — spike V2.3zzz">
      <div className={styles.hud}>
        <div className={`${styles.hudCard} ${styles.hudCardWide}`}>
          <span className={styles.hudLabel}>Carga</span>
          <span className={`${styles.hudValue} ${styles.hudValueMono}`}>{model.cargoId}</span>
          <div className={styles.progressTrack} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Progresso</span>
          <span className={styles.hudValue}>{progressPercent}%</span>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Rota</span>
          <span className={styles.hudValue}>{routeLabel}</span>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Motor</span>
          <span
            className={`${styles.providerBadge} ${!isMapLibreActive ? styles.providerBadgeFallback : ''}`}
          >
            {isMapLibreActive ? 'MapLibre GL' : 'SVG schematic'}
          </span>
        </div>
      </div>

      <div className={styles.cargoChips} role="group" aria-label="Selecionar carga demo">
        {HYDROWAY_DEMO_CARGO_IDS.map((cargoId) => (
          <button
            key={cargoId}
            type="button"
            className={`${styles.cargoChip} ${model.cargoId === cargoId ? styles.cargoChipActive : ''}`}
            onClick={() => selectCargo(cargoId)}
            aria-pressed={model.cargoId === cargoId}
          >
            {cargoId}
          </button>
        ))}
      </div>

      <aside className={styles.legend} aria-label="Legenda do mapa">
        <div className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendSwatchTraveled}`} aria-hidden="true" />
          Percorrido
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendSwatchPending}`} aria-hidden="true" />
          Restante
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendSwatchRiver}`} aria-hidden="true" />
          Hidrovia
        </div>
      </aside>

      <nav className={styles.controlDock} aria-label="Controles do mapa">
        <div className={styles.controlGroup} aria-label="Zoom e enquadramento">
          <button type="button" className={styles.controlBtn} onClick={handleZoomIn} aria-label="Aumentar zoom">
            <span className={styles.controlIcon} aria-hidden="true">+</span>
            <span className={styles.controlCaption}>Zoom</span>
          </button>
          <button type="button" className={styles.controlBtn} onClick={handleZoomOut} aria-label="Diminuir zoom">
            <span className={styles.controlIcon} aria-hidden="true">−</span>
            <span className={styles.controlCaption}>Zoom</span>
          </button>
          <span className={styles.controlDivider} aria-hidden="true" />
          <button type="button" className={styles.controlBtn} onClick={handleFitRoute} aria-label="Ajustar à rota completa">
            <span className={styles.controlIcon} aria-hidden="true">⊡</span>
            <span className={styles.controlCaption}>Rota</span>
          </button>
          <button type="button" className={styles.controlBtn} onClick={handleReset} aria-label="Redefinir câmera">
            <span className={styles.controlIcon} aria-hidden="true">⟲</span>
            <span className={styles.controlCaption}>Reset</span>
          </button>
        </div>
        {showMapLibre && maplibreReady ? (
          <div className={styles.controlGroup} aria-label="Animação operacional">
            <button
              type="button"
              className={`${styles.controlBtn} ${animationPaused ? styles.controlBtnMuted : ''}`}
              onClick={handleToggleAnimation}
              aria-label={animationPaused ? 'Retomar animação da rota' : 'Pausar animação da rota'}
              aria-pressed={!animationPaused}
            >
              <span className={styles.controlIcon} aria-hidden="true">
                {animationPaused ? '▶' : '❚❚'}
              </span>
              <span className={styles.controlCaption}>{animationPaused ? 'Play' : 'Pausa'}</span>
            </button>
          </div>
        ) : null}
        <div className={styles.controlProvider} title={isMapLibreActive ? 'MapLibre GL' : 'Fallback SVG'}>
          <span
            className={`${styles.controlProviderDot} ${!isMapLibreActive ? styles.controlProviderDotFallback : ''}`}
            aria-hidden="true"
          />
          <span className={styles.controlProviderLabel}>{isMapLibreActive ? 'MapLibre' : 'SVG'}</span>
        </div>
      </nav>

      {showMapLibre ? (
        <HydrowayMapSpikeMaplibreViewport
          ref={maplibreViewportRef}
          model={model}
          onReady={handleMaplibreReady}
          onInitError={handleMaplibreInitError}
        />
      ) : (
        <div ref={svgViewportRef} className={styles.viewport} />
      )}

      <p className={styles.statusBar}>
        {model.corridorId} • zoom {zoomPercent}%
        {fallbackNote ? ` • ${fallbackNote}` : ''}
      </p>
    </section>
  );
}
