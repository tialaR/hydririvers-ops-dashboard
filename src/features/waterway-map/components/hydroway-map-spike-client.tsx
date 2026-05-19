'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type PointerEvent,
} from 'react';

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
  width: 12,
  height: 12,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
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

function formatCorridorLabel(corridorId: string): string {
  return corridorId
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' · ');
}

const CORRIDOR_BADGE_TOOLTIP = 'Corredor hidroviário monitorado';

const HUD_ICON_PROPS = {
  className: styles.hudIconSvg,
  viewBox: '0 0 24 24',
  width: 12,
  height: 12,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function HudIconCargo() {
  return (
    <svg {...HUD_ICON_PROPS}>
      <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7z" />
      <path d="M12 4v16M4 8.5l8 4.5 8-4.5" />
    </svg>
  );
}

function HudIconProgress() {
  return (
    <svg {...HUD_ICON_PROPS}>
      <path d="M4 18V6" />
      <path d="M10 18V10" />
      <path d="M16 18v-5" />
      <path d="M22 18V4" />
    </svg>
  );
}

function HudIconRoute() {
  return (
    <svg {...HUD_ICON_PROPS}>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 16.5C10.5 13 13.5 10.5 16 8" />
    </svg>
  );
}

function HudIconMotor() {
  return (
    <svg {...HUD_ICON_PROPS}>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3z" />
      <path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" />
    </svg>
  );
}

function HudIconMonitor() {
  return (
    <svg {...HUD_ICON_PROPS}>
      <rect x="4" y="5" width="16" height="12" rx="2" />
      <path d="M8 9h8M8 12.5h5" />
    </svg>
  );
}

function HudIconCorridor() {
  return (
    <svg {...HUD_ICON_PROPS}>
      <path d="M4 16c3-4 5-6 8-6s5 2 8 6" />
      <path d="M6 18h12" />
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

  const stopFloatingControlEvent = useCallback(
    (event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
    },
    [],
  );

  const runFloatingControlAction = useCallback(
    (action: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      action();
    },
    [],
  );

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

  const handleDockControlButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const controlKey = event.currentTarget.dataset.controlKey;
      if (!controlKey) return;
      runFloatingControlAction(() => handleDockControlClick(controlKey))(event);
    },
    [handleDockControlClick, runFloatingControlAction],
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
      active: !mapLayersExpanded,
    },
    {
      key: 'animation',
      tooltip: animationTooltip,
      ariaLabel: animationAriaLabel,
      icon: animationPaused ? <ControlIconPlay /> : <ControlIconPause />,
      disabled: animationDisabled,
      ariaPressed: animationPaused,
      active: animationPaused,
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
      <div className={styles.topOverlay}>
      <div className={styles.hud} role="group" aria-label="Resumo operacional da carga">
        <article className={`${styles.hudCard} ${styles.hudCardCompact}`}>
          <header className={styles.hudCardHeader}>
            <span className={styles.hudIcon} aria-hidden="true">
              <HudIconCargo />
            </span>
            <span className={styles.hudLabel}>Carga</span>
          </header>
          <span className={`${styles.hudValue} ${styles.hudValueMono}`} data-testid="hydroway-map-cargo-id">
            {model.cargoId}
          </span>
          <div
            className={styles.hudAccentBar}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso da carga ${progressPercent} por cento`}
          >
            <div className={styles.hudAccentBarFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </article>
        <article className={`${styles.hudCard} ${styles.hudCardCompact}`}>
          <header className={styles.hudCardHeader}>
            <span className={styles.hudIcon} aria-hidden="true">
              <HudIconProgress />
            </span>
            <span className={styles.hudLabel}>Progresso</span>
          </header>
          <span className={`${styles.hudValue} ${styles.hudValueAccent}`}>
            <span className={styles.hudMetric}>{progressPercent}%</span>
          </span>
          <div className={styles.hudProgressTrack} aria-hidden="true">
            <div className={styles.hudProgressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </article>
        <article className={`${styles.hudCard} ${styles.hudCardWide}`}>
          <header className={styles.hudCardHeader}>
            <span className={styles.hudIcon} aria-hidden="true">
              <HudIconRoute />
            </span>
            <span className={styles.hudLabel}>Rota</span>
          </header>
          <p className={styles.hudRouteValue} title={routeLabel}>
            {routeLabel}
          </p>
        </article>
        <article className={`${styles.hudCard} ${styles.hudCardCompact} ${styles.hudCardMotor}`}>
          <header className={styles.hudCardHeader}>
            <span className={styles.hudIcon} aria-hidden="true">
              <HudIconMotor />
            </span>
            <span className={styles.hudLabel}>Motor</span>
          </header>
          <span
            className={`${styles.hudProviderBadge} ${!isMapLibreActive ? styles.hudProviderBadgeFallback : ''}`}
            data-testid="hydroway-map-provider"
          >
            {isMapLibreActive ? 'MapLibre GL' : 'SVG schematic'}
          </span>
        </article>
      </div>

      <div className={styles.topOverlayAside}>
        <aside className={styles.cargoPanel} role="group" aria-label="Selecionar carga demo">
          <header className={styles.cargoPanelHeader}>
            <span className={styles.hudIcon} aria-hidden="true">
              <HudIconMonitor />
            </span>
            <span className={styles.cargoPanelTitle}>Cargas monitoradas</span>
          </header>
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
        </aside>

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
      </div>
      </div>

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

      <div
        className={styles.mapZoomBadge}
        aria-live="polite"
        aria-label={`Zoom ${zoomPercent} por cento`}
        data-testid="hydroway-map-zoom-badge"
      >
        <span className={styles.mapZoomBadgeValue}>{zoomPercent}%</span>
      </div>

      <nav className={styles.controlDock} aria-label="Controles do mapa">
        <div className={styles.controlDockInner}>
          <div className={styles.controlStack}>
            {dockControls.map((control) => (
              <button
                key={control.key}
                type="button"
                className={[
                  styles.controlIconButton,
                  control.disabled ? styles.controlIconButtonDisabled : '',
                  control.active ? styles.controlIconButtonActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onPointerDownCapture={stopFloatingControlEvent}
                onMouseDownCapture={stopFloatingControlEvent}
                onDoubleClick={stopFloatingControlEvent}
                onClick={handleDockControlButtonClick}
                data-control-key={control.key}
                disabled={Boolean(control.disabled)}
                aria-label={control.ariaLabel}
                {...(control.ariaPressed !== undefined ? { 'aria-pressed': control.ariaPressed } : {})}
                data-tooltip={control.tooltip}
              >
                <span className={styles.controlButtonSurface}>{control.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div
        className={styles.corridorBadge}
        tabIndex={0}
        data-tooltip={CORRIDOR_BADGE_TOOLTIP}
        aria-label={`${formatCorridorLabel(model.corridorId)} — ${CORRIDOR_BADGE_TOOLTIP}`}
      >
        <span className={styles.hudIcon} aria-hidden="true">
          <HudIconCorridor />
        </span>
        <span className={styles.corridorBadgeLabel}>{formatCorridorLabel(model.corridorId)}</span>
        {fallbackNote ? <span className={styles.corridorBadgeMeta}>{fallbackNote}</span> : null}
      </div>
    </section>
  );
}
