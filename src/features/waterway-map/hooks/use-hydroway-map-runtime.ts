'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { hydrowayModelToScene } from '../adapters/hydroway-model-to-scene';
import { HYDROWAY_OPERATIONAL_LAYER_MODE_ORDER } from '../constants/hydroway-operational-layer-order';
import { HYDROWAY_OPERATIONAL_LAYER_MODES } from '../constants/hydroway-operational-layer-modes';
import { resolveCargoOperationalWaterwayContext } from '../data/resolve-cargo-operational-waterway-context';
import type { HydrowayOperationalLayerMode } from '../domain/hydroway-operational-domain.types';
import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import type { HydrowayMapSpikeMaplibreViewportHandle } from '../components/hydroway-map-spike-maplibre-viewport';
import {
  getMapLibreZoomPercent,
  MapLibreHydrowayProvider,
  type HydrowayCameraChapterId,
} from '../providers/maplibre-hydroway-provider';
import { SvgSchematicHydrowayProvider } from '../providers/svg-schematic-hydroway-provider';
import type { HydrowayMapLayerId } from '../providers/map-provider.types';
import { detectWebGLSupport } from '../utils/detect-webgl';
import {
  getHydrowayMapZoomPercent,
  HYDRO_MAP_VIEWBOX,
  resetHydrowayMapCamera,
  zoomHydrowayMapCameraIn,
  zoomHydrowayMapCameraOut,
} from '../utils/hydro-map-style';
import {
  canApplyMobileInitialRouteOverview,
  markMobileInitialRouteOverviewApplied,
  resetMobileRouteOverviewInitialState,
  type MobileRouteOverviewInitialState,
} from '../utils/mobile-route-overview-camera';

const ALL_MAP_LAYERS: HydrowayMapLayerId[] = [
  'waterway-main',
  'waterway-tributary',
  'cargo-route',
  'ports',
  'vessel',
];

const MAP_CHAPTER_CONTROL_KEYS = new Set(['origin', 'current', 'destination']);

const MOBILE_ROUTE_OVERVIEW_PADDING = {
  top: 96,
  right: 92,
  bottom: 96,
  left: 56,
} as const;

const MOBILE_ROUTE_OVERVIEW_MAX_ZOOM = 10.5;
const MOBILE_POINT_FOCUS_ZOOM = 10;

export type HydrowaySpikeProviderMode = 'maplibre' | 'svg-schematic';

export type UseHydrowayMapRuntimeOptions = {
  model: HydrowayMapModel;
  preferredProvider: HydrowaySpikeProviderMode;
  /** Bloqueia tooltips hover (recomendado no mobile). */
  disableLayerTooltips?: boolean;
  /** Padding e enquadramento pensados para viewport mobile. */
  mobileCamera?: boolean;
};

export function useHydrowayMapRuntime({
  model,
  preferredProvider,
  disableLayerTooltips = false,
  mobileCamera = false,
}: UseHydrowayMapRuntimeOptions) {
  const searchParams = useSearchParams();
  const forceSvgFallback = searchParams.get('forceSvgFallback') === '1';

  const schematicScene = useMemo(() => hydrowayModelToScene(model), [model]);

  const svgViewportRef = useRef<HTMLDivElement | null>(null);
  const svgProviderRef = useRef<SvgSchematicHydrowayProvider | null>(null);
  const maplibreViewportRef = useRef<HydrowayMapSpikeMaplibreViewportHandle | null>(null);
  const maplibreProviderRef = useRef<MapLibreHydrowayProvider | null>(null);
  const [maplibreMountFailed, setMaplibreMountFailed] = useState(false);
  const [maplibreReadyCargoId, setMaplibreReadyCargoId] = useState<string | null>(null);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [layerPresetPanelOpen, setLayerPresetPanelOpen] = useState(false);
  const [activeOperationalLayerMode, setActiveOperationalLayerMode] =
    useState<HydrowayOperationalLayerMode>('operation');
  const [activeChapterByCargo, setActiveChapterByCargo] = useState<{
    cargoId: string;
    chapter: HydrowayCameraChapterId;
  } | null>(null);
  const cameraFlyRequestRef = useRef(0);
  const mobileRouteOverviewInitialRef = useRef<MobileRouteOverviewInitialState>({
    appliedCargoId: null,
    userInteracted: false,
  });
  const [mobileRouteOverviewAppliedCargoId, setMobileRouteOverviewAppliedCargoId] = useState<
    string | null
  >(null);
  const activeMapChapter =
    activeChapterByCargo?.cargoId === model.cargoId ? activeChapterByCargo.chapter : null;

  useEffect(() => {
    resetMobileRouteOverviewInitialState(mobileRouteOverviewInitialRef.current);
    maplibreProviderRef.current = null;
  }, [model.cargoId]);

  const webglReady = useSyncExternalStore(
    () => () => {},
    () => detectWebGLSupport(),
    () => false,
  );

  const wantsMapLibre =
    preferredProvider === 'maplibre' && webglReady && !forceSvgFallback && !maplibreMountFailed;
  const showMapLibre = wantsMapLibre;
  const maplibreReady = showMapLibre && maplibreReadyCargoId === model.cargoId;
  const activeProviderKind: HydrowaySpikeProviderMode = maplibreReady ? 'maplibre' : 'svg-schematic';

  const getMapLibreProvider = useCallback((): MapLibreHydrowayProvider | null => {
    const provider =
      maplibreViewportRef.current?.getProvider() ?? maplibreProviderRef.current;
    return provider?.kind === 'maplibre' ? (provider as MapLibreHydrowayProvider) : null;
  }, []);

  useEffect(() => {
    const context = resolveCargoOperationalWaterwayContext(model.cargoId);
    const recommendedMode = context?.recommendedLayerMode ?? 'operation';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- alinhar modo operacional ao trocar carga mock
    setActiveOperationalLayerMode(recommendedMode);
    getMapLibreProvider()?.setOperationalLayerMode(recommendedMode);
  }, [getMapLibreProvider, model.cargoId]);

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

    maplibreProviderRef.current = null;

    const container = svgViewportRef.current;
    if (!container) return undefined;

    const provider = new SvgSchematicHydrowayProvider();
    provider.mount({
      container,
      viewBox: HYDRO_MAP_VIEWBOX,
      model,
    });
    svgProviderRef.current = provider;
    provider.setLayers(ALL_MAP_LAYERS);
    setMaplibreReadyCargoId(null);
    syncZoomLabel();

    return () => {
      provider.destroy();
      svgProviderRef.current = null;
    };
  }, [model, showMapLibre, syncZoomLabel]);

  const fitRouteOverview = useCallback(() => {
      const mapProvider = getMapLibreProvider();
      if (mapProvider?.isReady()) {
        const fitted = mapProvider.fitRouteOverview(
          mobileCamera
            ? {
                padding: MOBILE_ROUTE_OVERVIEW_PADDING,
                maxZoom: MOBILE_ROUTE_OVERVIEW_MAX_ZOOM,
                includeRouteCoordinates: true,
              }
            : undefined,
        );
        if (fitted) {
          syncZoomLabel();
        }
        return fitted;
      }

      const provider = svgProviderRef.current;
      if (!provider) return false;
      const { origin, destination, vessel } = schematicScene.route;
      provider.fitBounds([origin, destination, vessel], mobileCamera ? 72 : 88);
      syncZoomLabel();
      return true;
    },
    [getMapLibreProvider, mobileCamera, schematicScene.route, syncZoomLabel],
  );

  const focusOrigin = useCallback(() => {
    setActiveChapterByCargo({ cargoId: model.cargoId, chapter: 'origin' });

    if (showMapLibre) {
      const mapProvider = getMapLibreProvider();
      if (!mapProvider?.isReady()) return;
      const focused = mapProvider.focusOrigin(
        mobileCamera ? { zoom: MOBILE_POINT_FOCUS_ZOOM } : undefined,
      );
      if (!focused) {
        fitRouteOverview();
        return;
      }
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    const { origin } = schematicScene.route;
    provider.fitBounds([origin], mobileCamera ? 96 : 120);
    syncZoomLabel();
  }, [
    fitRouteOverview,
    getMapLibreProvider,
    mobileCamera,
    model.cargoId,
    schematicScene.route,
    showMapLibre,
    syncZoomLabel,
  ]);

  const focusDestination = useCallback(() => {
    setActiveChapterByCargo({ cargoId: model.cargoId, chapter: 'destination' });

    if (showMapLibre) {
      const mapProvider = getMapLibreProvider();
      if (!mapProvider?.isReady()) return;
      const focused = mapProvider.focusDestination(
        mobileCamera ? { zoom: MOBILE_POINT_FOCUS_ZOOM } : undefined,
      );
      if (!focused) {
        fitRouteOverview();
        return;
      }
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    const { destination } = schematicScene.route;
    provider.fitBounds([destination], mobileCamera ? 96 : 120);
    syncZoomLabel();
  }, [
    fitRouteOverview,
    getMapLibreProvider,
    mobileCamera,
    model.cargoId,
    schematicScene.route,
    showMapLibre,
    syncZoomLabel,
  ]);

  const centerCurrentCargo = useCallback(() => {
    setActiveChapterByCargo({ cargoId: model.cargoId, chapter: 'current' });

    if (showMapLibre) {
      const mapProvider = getMapLibreProvider();
      if (!mapProvider?.isReady()) return;
      const centered = mapProvider.centerCurrentCargo(
        mobileCamera ? { zoom: MOBILE_POINT_FOCUS_ZOOM } : undefined,
      );
      if (!centered) {
        fitRouteOverview();
      } else {
        syncZoomLabel();
      }
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    const { vessel } = schematicScene.route;
    provider.fitBounds([vessel], mobileCamera ? 96 : 120);
    syncZoomLabel();
  }, [
    fitRouteOverview,
    getMapLibreProvider,
    mobileCamera,
    model.cargoId,
    schematicScene.route,
    showMapLibre,
    syncZoomLabel,
  ]);

  const markMobileRouteOverviewApplied = useCallback((cargoId: string) => {
    markMobileInitialRouteOverviewApplied(mobileRouteOverviewInitialRef.current, cargoId);
    setMobileRouteOverviewAppliedCargoId(cargoId);
  }, []);

  const applyRouteOverviewCamera = useCallback(() => {
    setActiveChapterByCargo(null);
    cameraFlyRequestRef.current += 1;
    const fitted = fitRouteOverview();
    if (mobileCamera && fitted) {
      markMobileRouteOverviewApplied(model.cargoId);
    }
    return fitted;
  }, [fitRouteOverview, markMobileRouteOverviewApplied, mobileCamera, model.cargoId]);

  const runMobileRouteOverviewFit = useCallback(
    (mapProvider?: MapLibreHydrowayProvider | null): boolean => {
      if (mapProvider?.isReady()) {
        mapProvider.ensureViewportSize();
      }

      return Boolean(applyRouteOverviewCamera());
    },
    [applyRouteOverviewCamera],
  );

  const tryApplyMobileInitialRouteOverview = useCallback(
    (mapProviderOverride?: MapLibreHydrowayProvider | null): void => {
      const mapProvider = mapProviderOverride ?? getMapLibreProvider();
      const mapReady = mapProvider?.isReady()
        ? true
        : Boolean(svgProviderRef.current);

      if (
        !canApplyMobileInitialRouteOverview(mobileRouteOverviewInitialRef.current, {
          mobileCamera,
          cargoId: model.cargoId,
          mapReady,
        })
      ) {
        return;
      }

      runMobileRouteOverviewFit(mapProvider);
    },
    [getMapLibreProvider, mobileCamera, model.cargoId, runMobileRouteOverviewFit],
  );

  const handleMaplibreReady = useCallback((mapProviderFromViewport: MapLibreHydrowayProvider) => {
    setMaplibreMountFailed(false);
    setMaplibreReadyCargoId(model.cargoId);
    maplibreProviderRef.current = mapProviderFromViewport;
    const mapProvider = mapProviderFromViewport;
    if (mapProvider.kind === 'maplibre') {
      const maplibreProvider = mapProvider;
      maplibreProvider.ensureViewportSize();
      maplibreProvider.setLayers(ALL_MAP_LAYERS);
      maplibreProvider.setOperationalLayerMode(activeOperationalLayerMode);
      setActiveOperationalLayerMode(maplibreProvider.getOperationalLayerMode());
      if (disableLayerTooltips) {
        maplibreProvider.setLayerTooltipUiBlocked(true);
      }
      if (mobileCamera) {
        const runInitialRouteOverview = () => {
          if (
            !canApplyMobileInitialRouteOverview(mobileRouteOverviewInitialRef.current, {
              mobileCamera: true,
              cargoId: model.cargoId,
              mapReady: maplibreProvider.isReady(),
            })
          ) {
            return;
          }

          setActiveChapterByCargo(null);
          cameraFlyRequestRef.current += 1;
          const fitted = maplibreProvider.fitRouteOverview({
            padding: MOBILE_ROUTE_OVERVIEW_PADDING,
            maxZoom: MOBILE_ROUTE_OVERVIEW_MAX_ZOOM,
            includeRouteCoordinates: true,
          });

          if (!fitted) return;

          syncZoomLabel();
          markMobileRouteOverviewApplied(model.cargoId);
        };

        runInitialRouteOverview();
        maplibreProvider.scheduleWhenIdle(runInitialRouteOverview);
      }
    }
    syncZoomLabel();
  }, [
    activeOperationalLayerMode,
    disableLayerTooltips,
    markMobileRouteOverviewApplied,
    mobileCamera,
    model.cargoId,
    syncZoomLabel,
  ]);

  useEffect(() => {
    if (!mobileCamera || !maplibreReady) return undefined;

    const frameId = requestAnimationFrame(() => {
      tryApplyMobileInitialRouteOverview();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [maplibreReady, mobileCamera, model.cargoId, tryApplyMobileInitialRouteOverview]);

  useEffect(() => {
    if (!mobileCamera || !maplibreReady) return undefined;
    if (mobileRouteOverviewInitialRef.current.appliedCargoId !== model.cargoId) return undefined;

    const mapProvider = getMapLibreProvider();
    if (!mapProvider?.isReady()) return undefined;

    return mapProvider.bindUserCameraInteractionListener(() => {
      mobileRouteOverviewInitialRef.current.userInteracted = true;
    });
  }, [getMapLibreProvider, maplibreReady, mobileCamera, mobileRouteOverviewAppliedCargoId, model.cargoId]);

  useEffect(() => {
    if (!mobileCamera || showMapLibre) return undefined;

    const frameId = requestAnimationFrame(() => {
      tryApplyMobileInitialRouteOverview();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [mobileCamera, model.cargoId, showMapLibre, tryApplyMobileInitialRouteOverview]);

  const handleMaplibreInitError = useCallback(() => {
    setMaplibreMountFailed(true);
    setMaplibreReadyCargoId(null);
    maplibreProviderRef.current = null;
  }, []);

  const handleZoomIn = useCallback(() => {
    if (showMapLibre) {
      const mapProvider = getMapLibreProvider();
      if (!mapProvider?.isReady()) return;
      if (mobileCamera) {
        mapProvider.zoomIn();
      } else {
        mapProvider.zoomInImmediate();
      }
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    provider.setCamera(zoomHydrowayMapCameraIn(provider.getCamera()));
    syncZoomLabel();
  }, [getMapLibreProvider, mobileCamera, showMapLibre, syncZoomLabel]);

  const handleZoomOut = useCallback(() => {
    if (showMapLibre) {
      const mapProvider = getMapLibreProvider();
      if (!mapProvider?.isReady()) return;
      if (mobileCamera) {
        mapProvider.zoomOut();
      } else {
        mapProvider.zoomOutImmediate();
      }
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    provider.setCamera(zoomHydrowayMapCameraOut(provider.getCamera()));
    syncZoomLabel();
  }, [getMapLibreProvider, mobileCamera, showMapLibre, syncZoomLabel]);

  const handleReset = useCallback(() => {
    setActiveChapterByCargo(null);
    cameraFlyRequestRef.current += 1;

    if (mobileCamera) {
      fitRouteOverview();
      return;
    }

    if (showMapLibre) {
      const mapProvider = getMapLibreProvider();
      if (!mapProvider?.isReady()) return;
      mapProvider.resetView();
      syncZoomLabel();
      return;
    }

    const provider = svgProviderRef.current;
    if (!provider) return;
    provider.setCamera(resetHydrowayMapCamera());
    syncZoomLabel();
  }, [fitRouteOverview, getMapLibreProvider, mobileCamera, showMapLibre, syncZoomLabel]);

  const handleFlyToChapter = useCallback(
    (chapterId: HydrowayCameraChapterId) => {
      const requestId = cameraFlyRequestRef.current + 1;
      cameraFlyRequestRef.current = requestId;

      if (MAP_CHAPTER_CONTROL_KEYS.has(chapterId)) {
        setActiveChapterByCargo({ cargoId: model.cargoId, chapter: chapterId });
      } else {
        setActiveChapterByCargo(null);
      }

      if (!showMapLibre) {
        const provider = svgProviderRef.current;
        if (!provider) return;
        const { origin, destination, vessel } = schematicScene.route;
        const point =
          chapterId === 'origin'
            ? origin
            : chapterId === 'destination'
              ? destination
              : chapterId === 'current'
                ? vessel
                : null;
        if (point) {
          provider.fitBounds([point], 120);
          syncZoomLabel();
        }
        return;
      }

      const mapProvider = getMapLibreProvider();
      if (!mapProvider?.isReady()) return;
      mapProvider.flyToChapter(chapterId);
      if (cameraFlyRequestRef.current === requestId) {
        syncZoomLabel();
      }
    },
    [getMapLibreProvider, model.cargoId, schematicScene.route, showMapLibre, syncZoomLabel],
  );

  const handleToggleLayerPresetPanel = useCallback(() => {
    setLayerPresetPanelOpen((open) => {
      const next = !open;
      if (disableLayerTooltips) {
        getMapLibreProvider()?.setLayerTooltipUiBlocked(true);
      } else {
        getMapLibreProvider()?.setLayerTooltipUiBlocked(next);
      }
      return next;
    });
  }, [disableLayerTooltips, getMapLibreProvider]);

  const handleSelectOperationalLayerMode = useCallback(
    (mode: HydrowayOperationalLayerMode) => {
      if (!showMapLibre) return;
      const mapProvider = getMapLibreProvider();
      if (!mapProvider?.isReady() || !mapProvider.canSetOperationalLayerMode(mode)) return;
      mapProvider.setOperationalLayerMode(mode);
      setActiveOperationalLayerMode(mapProvider.getOperationalLayerMode());
    },
    [getMapLibreProvider, showMapLibre],
  );

  const handleCloseLayerPresetPanel = useCallback(() => {
    setLayerPresetPanelOpen(false);
    if (disableLayerTooltips) {
      getMapLibreProvider()?.setLayerTooltipUiBlocked(true);
    } else {
      getMapLibreProvider()?.setLayerTooltipUiBlocked(false);
    }
  }, [disableLayerTooltips, getMapLibreProvider]);

  useEffect(() => {
    if (!layerPresetPanelOpen) {
      if (disableLayerTooltips) {
        getMapLibreProvider()?.setLayerTooltipUiBlocked(true);
      } else {
        getMapLibreProvider()?.setLayerTooltipUiBlocked(false);
      }
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseLayerPresetPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (disableLayerTooltips) {
        getMapLibreProvider()?.setLayerTooltipUiBlocked(true);
      } else {
        getMapLibreProvider()?.setLayerTooltipUiBlocked(false);
      }
    };
  }, [disableLayerTooltips, getMapLibreProvider, handleCloseLayerPresetPanel, layerPresetPanelOpen]);

  const handleLayerPresetPanelPointerEnter = useCallback(() => {
    getMapLibreProvider()?.setLayerTooltipUiBlocked(true);
  }, [getMapLibreProvider]);

  const handleLayerPresetPanelPointerLeave = useCallback(() => {
    if (disableLayerTooltips) {
      getMapLibreProvider()?.setLayerTooltipUiBlocked(true);
      return;
    }
    getMapLibreProvider()?.setLayerTooltipUiBlocked(false);
  }, [disableLayerTooltips, getMapLibreProvider]);

  const handleFitRoute = applyRouteOverviewCamera;

  const handleFocusOrigin = useCallback(() => {
    cameraFlyRequestRef.current += 1;
    focusOrigin();
  }, [focusOrigin]);

  const handleFocusDestination = useCallback(() => {
    cameraFlyRequestRef.current += 1;
    focusDestination();
  }, [focusDestination]);

  const handleCenterCurrentCargo = useCallback(() => {
    cameraFlyRequestRef.current += 1;
    centerCurrentCargo();
  }, [centerCurrentCargo]);

  const handleToggleWaterwayContext = useCallback(() => {
    if (!showMapLibre) return;
    const mapProvider = getMapLibreProvider();
    if (!mapProvider?.isReady()) return;

    const nextMode: HydrowayOperationalLayerMode =
      activeOperationalLayerMode === 'navigation' ? 'operation' : 'navigation';
    if (!mapProvider.canSetOperationalLayerMode(nextMode)) return;

    mapProvider.setOperationalLayerMode(nextMode);
    setActiveOperationalLayerMode(mapProvider.getOperationalLayerMode());
  }, [activeOperationalLayerMode, getMapLibreProvider, showMapLibre]);

  const progressPercent = Math.round(model.progress01 * 100);
  const routeLabel = model.metadata.routeName;

  const fallbackNote = forceSvgFallback
    ? 'fallback ?forceSvgFallback=1'
    : maplibreMountFailed
      ? 'fallback falha MapLibre'
      : !webglReady
        ? 'fallback sem WebGL'
        : null;

  const mapLibreControlsDisabled = showMapLibre && !maplibreReady;
  const layerPresetControlsEnabled = maplibreReady;

  return {
    model,
    schematicScene,
    svgViewportRef,
    maplibreViewportRef,
    showMapLibre,
    maplibreReady,
    mapLibreControlsDisabled,
    layerPresetControlsEnabled,
    zoomPercent,
    layerPresetPanelOpen,
    setLayerPresetPanelOpen,
    activeOperationalLayerMode,
    operationalLayerModes: HYDROWAY_OPERATIONAL_LAYER_MODES,
    operationalLayerModeOrder: HYDROWAY_OPERATIONAL_LAYER_MODE_ORDER,
    activeMapChapter,
    progressPercent,
    routeLabel,
    fallbackNote,
    activeProviderKind,
    forceSvgFallback,
    handleMaplibreReady,
    handleMaplibreInitError,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleFlyToChapter,
    handleToggleLayerPresetPanel,
    handleSelectOperationalLayerMode,
    handleCloseLayerPresetPanel,
    handleFitRoute,
    handleFocusOrigin,
    handleFocusDestination,
    handleCenterCurrentCargo,
    handleToggleWaterwayContext,
    fitRouteOverview,
    focusOrigin,
    focusDestination,
    centerCurrentCargo,
    handleLayerPresetPanelPointerEnter,
    handleLayerPresetPanelPointerLeave,
    getMapLibreProvider,
    mobileCamera,
    mobileRouteOverviewAppliedCargoId,
    applyRouteOverviewCamera,
    tryApplyMobileInitialRouteOverview,
  };
}

export type HydrowayMapRuntime = ReturnType<typeof useHydrowayMapRuntime>;
