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
  type HydrowayCameraChapterId,
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
import type { HydrowayMapLayerId } from '../providers/map-provider.types';
import type { HydrowayMapSpikeMaplibreViewportHandle } from './hydroway-map-spike-maplibre-viewport';
import styles from './hydroway-map-spike.module.scss';

const ALL_MAP_LAYERS: HydrowayMapLayerId[] = [
  'waterway-main',
  'waterway-tributary',
  'cargo-route',
  'ports',
  'vessel',
];

const MINIMAL_MAP_LAYERS: HydrowayMapLayerId[] = ['cargo-route', 'vessel'];

const CONTROL_ICON_PROPS = {
  className: styles.controlIconSvg,
  viewBox: '0 0 24 24',
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function ControlIconOrigin() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ControlIconDestination() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <path d="M8 4v16" />
      <path d="M8 4h9.5a.9.9 0 0 1 .7 1.5L13.5 11l4.7 4.2a.9.9 0 0 1-.7 1.5H8" />
    </svg>
  );
}

function ControlIconZoomIn() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <path d="M12 7v10M7 12h10" />
    </svg>
  );
}

function ControlIconZoomOut() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <path d="M7 12h10" />
    </svg>
  );
}

function ControlIconLayers() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <path d="M12 4 4 8l8 4 8-4-8-4z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 16l8 4 8-4" />
    </svg>
  );
}

function ControlIconPause() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <path d="M9 7v10M15 7v10" />
    </svg>
  );
}

function ControlIconPlay() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <path d="M9 7.5v9l8-4.5-8-4.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ControlIconReset() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <path d="M4 12a8 8 0 0 1 13.5-5.7" />
      <path d="M20 5v5h-5" />
    </svg>
  );
}

function ControlIconCurrent() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ControlIconRouteOverview() {
  return (
    <svg {...CONTROL_ICON_PROPS}>
      <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
      <path d="M8 12h8" />
    </svg>
  );
}

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
  const [mapLayersExpanded, setMapLayersExpanded] = useState(true);

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

  const handleFlyToChapter = useCallback(
    (chapterId: HydrowayCameraChapterId) => {
      if (!showMapLibre) return;
      getMapLibreProvider()?.flyToChapter(chapterId);
      syncZoomLabel();
    },
    [getMapLibreProvider, showMapLibre, syncZoomLabel],
  );

  const handleToggleLayers = useCallback(() => {
    const nextExpanded = !mapLayersExpanded;
    const layers = nextExpanded ? ALL_MAP_LAYERS : MINIMAL_MAP_LAYERS;

    if (showMapLibre) {
      getMapLibreProvider()?.setLayers(layers);
    } else {
      svgProviderRef.current?.setLayers(layers);
    }

    setMapLayersExpanded(nextExpanded);
  }, [getMapLibreProvider, mapLayersExpanded, showMapLibre]);

  const handleFitRoute = useCallback(() => {
    if (showMapLibre) {
      handleFlyToChapter('overview');
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    const { origin, destination, vessel } = schematicScene.route;
    provider.fitBounds([origin, destination, vessel]);
    syncZoomLabel();
  }, [handleFlyToChapter, schematicScene.route, showMapLibre, syncZoomLabel]);

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

  const mapChapterDisabled = !showMapLibre || !maplibreReady;
  const animationDisabled = mapChapterDisabled;
  const animationTooltip = animationPaused ? 'Retomar animação' : 'Pausar animação';
  const animationAriaLabel = animationPaused ? 'Retomar animação' : 'Pausar animação';

  const handleDockControlClick = useCallback(
    (controlKey: string) => {
      switch (controlKey) {
        case 'origin':
          handleFlyToChapter('origin');
          break;
        case 'destination':
          handleFlyToChapter('destination');
          break;
        case 'zoom-in':
          handleZoomIn();
          break;
        case 'zoom-out':
          handleZoomOut();
          break;
        case 'layers':
          handleToggleLayers();
          break;
        case 'animation':
          handleToggleAnimation();
          break;
        case 'reset':
          handleReset();
          break;
        case 'current':
          handleFlyToChapter('current');
          break;
        case 'fit-route':
          handleFitRoute();
          break;
        default:
          break;
      }
    },
    [
      handleFitRoute,
      handleFlyToChapter,
      handleReset,
      handleToggleAnimation,
      handleToggleLayers,
      handleZoomIn,
      handleZoomOut,
    ],
  );

  const dockControls = [
    {
      key: 'origin',
      tooltip: 'Origem da viagem',
      ariaLabel: 'Focar origem da viagem',
      icon: <ControlIconOrigin />,
      disabled: mapChapterDisabled,
    },
    {
      key: 'destination',
      tooltip: 'Destino da viagem',
      ariaLabel: 'Focar destino da viagem',
      icon: <ControlIconDestination />,
      disabled: mapChapterDisabled,
    },
    {
      key: 'zoom-in',
      tooltip: 'Ampliar mapa',
      ariaLabel: 'Ampliar mapa',
      icon: <ControlIconZoomIn />,
    },
    {
      key: 'zoom-out',
      tooltip: 'Diminuir mapa',
      ariaLabel: 'Diminuir mapa',
      icon: <ControlIconZoomOut />,
    },
    {
      key: 'layers',
      tooltip: 'Camadas',
      ariaLabel: 'Alternar camadas do mapa',
      icon: <ControlIconLayers />,
      ariaPressed: mapLayersExpanded,
      active: mapLayersExpanded,
    },
    {
      key: 'animation',
      tooltip: animationTooltip,
      ariaLabel: animationAriaLabel,
      icon: animationPaused ? <ControlIconPlay /> : <ControlIconPause />,
      disabled: animationDisabled,
      ariaPressed: !animationPaused,
      muted: animationPaused,
    },
    {
      key: 'reset',
      tooltip: 'Voltar para posição inicial',
      ariaLabel: 'Voltar para posição inicial',
      icon: <ControlIconReset />,
    },
    {
      key: 'current',
      tooltip: 'Focar carga no percurso',
      ariaLabel: 'Focar carga no percurso',
      icon: <ControlIconCurrent />,
      disabled: mapChapterDisabled,
    },
    {
      key: 'fit-route',
      tooltip: 'Visualizar rota completa',
      ariaLabel: 'Visualizar rota completa',
      icon: <ControlIconRouteOverview />,
    },
  ];

  return (
    <section className={styles.stage} aria-label="Mapa hidroviário — spike V2.8">
      <div className={styles.hud}>
        <div className={`${styles.hudCard} ${styles.hudCardWide}`}>
          <span className={styles.hudLabel}>Carga</span>
          <span className={`${styles.hudValue} ${styles.hudValueMono}`} data-testid="hydroway-map-cargo-id">
            {model.cargoId}
          </span>
          <div className={styles.progressTrack} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Progresso</span>
          <span className={`${styles.hudValue} ${styles.hudValueAccent}`}>{progressPercent}%</span>
        </div>
        <div className={`${styles.hudCard} ${styles.hudCardRoute}`}>
          <span className={styles.hudLabel}>Rota</span>
          <p className={styles.hudRouteValue} title={routeLabel}>
            {routeLabel}
          </p>
        </div>
        <div className={styles.hudCard}>
          <span className={styles.hudLabel}>Motor</span>
          <span
            className={`${styles.providerBadge} ${!isMapLibreActive ? styles.providerBadgeFallback : ''}`}
            data-testid="hydroway-map-provider"
          >
            {isMapLibreActive ? 'MapLibre GL' : 'SVG schematic'}
          </span>
        </div>
      </div>

      <div className={styles.cargoChips} role="group" aria-label="Selecionar carga demo">
        <p className={styles.cargoPanelHeader}>Cargas monitoradas</p>
        <ul className={styles.cargoPanelList}>
          {HYDROWAY_DEMO_CARGO_IDS.map((cargoId) => {
            const isActive = model.cargoId === cargoId;
            return (
              <li key={cargoId} className={styles.cargoPanelItem}>
                <button
                  type="button"
                  className={`${styles.cargoRow} ${isActive ? styles.cargoRowActive : ''}`}
                  onClick={() => selectCargo(cargoId)}
                  aria-pressed={isActive}
                >
                  <span
                    className={`${styles.cargoStatusDot} ${isActive ? styles.cargoStatusDotActive : ''}`}
                    aria-hidden="true"
                  />
                  <span className={styles.cargoRowBody}>
                    <span className={styles.cargoRowId}>{cargoId}</span>
                    {isActive ? (
                      <span className={styles.cargoRowMeta}>{progressPercent}% percorrido</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
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
        <div className={styles.controlStack}>
          <div
            className={styles.controlZoomBadge}
            aria-live="polite"
            aria-label={`Zoom ${zoomPercent} por cento`}
          >
            <span className={styles.controlZoomValue}>{zoomPercent}%</span>
          </div>
          {dockControls.map((control) => (
            <button
              key={control.key}
              type="button"
              className={[
                styles.controlIconButton,
                control.disabled ? styles.controlIconButtonDisabled : '',
                control.active ? styles.controlIconButtonActive : '',
                control.muted ? styles.controlIconButtonMuted : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleDockControlClick(control.key)}
              disabled={Boolean(control.disabled)}
              aria-label={control.ariaLabel}
              {...(control.ariaPressed !== undefined ? { 'aria-pressed': control.ariaPressed } : {})}
              data-tooltip={control.tooltip}
            >
              {control.icon}
            </button>
          ))}
        </div>
      </nav>

      {fallbackNote ? (
        <span hidden data-testid="hydroway-map-fallback">
          {fallbackNote}
        </span>
      ) : null}

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
        {model.corridorId}
        {fallbackNote ? ` • ${fallbackNote}` : ''}
      </p>
    </section>
  );
}
