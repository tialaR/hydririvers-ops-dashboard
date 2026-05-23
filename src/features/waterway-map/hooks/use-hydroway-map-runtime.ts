'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { hydrowayModelToScene } from '../adapters/hydroway-model-to-scene';
import type { HydrowayMapLayerPresetId } from '../constants/hydroway-map-layer-presets';
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
const MOBILE_INITIAL_FIT_MAX_ATTEMPTS = 10;

export type HydrowaySpikeProviderMode = 'maplibre' | 'svg-schematic';

export type UseHydrowayMapRuntimeOptions = {
  model: HydrowayMapModel;
  preferredProvider: HydrowaySpikeProviderMode;
  /** Bloqueia tooltips hover (recomendado no mobile). */
  disableLayerTooltips?: boolean;
  /** Fecha o painel de presets após seleção (mobile). */
  closeLayerPanelOnSelect?: boolean;
  /** Padding e enquadramento pensados para viewport mobile. */
  mobileCamera?: boolean;
};

export function useHydrowayMapRuntime({
  model,
  preferredProvider,
  disableLayerTooltips = false,
  closeLayerPanelOnSelect = false,
  mobileCamera = false,
}: UseHydrowayMapRuntimeOptions) {
  const searchParams = useSearchParams();
  const forceSvgFallback = searchParams.get('forceSvgFallback') === '1';

  const schematicScene = useMemo(() => hydrowayModelToScene(model), [model]);

  const svgViewportRef = useRef<HTMLDivElement | null>(null);
  const svgProviderRef = useRef<SvgSchematicHydrowayProvider | null>(null);
  const maplibreViewportRef = useRef<HydrowayMapSpikeMaplibreViewportHandle | null>(null);
  const [maplibreMountFailed, setMaplibreMountFailed] = useState(false);
  const [maplibreReadyCargoId, setMaplibreReadyCargoId] = useState<string | null>(null);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [layerPresetPanelOpen, setLayerPresetPanelOpen] = useState(false);
  const [activeLayerPreset, setActiveLayerPreset] = useState<HydrowayMapLayerPresetId>('dark');
  const [activeChapterByCargo, setActiveChapterByCargo] = useState<{
    cargoId: string;
    chapter: HydrowayCameraChapterId;
  } | null>(null);
  const cameraFlyRequestRef = useRef(0);
  const userCameraInteractedRef = useRef(false);
  const mobileInitialFitCargoRef = useRef<string | null>(null);
  const activeMapChapter =
    activeChapterByCargo?.cargoId === model.cargoId ? activeChapterByCargo.chapter : null;

  useEffect(() => {
    userCameraInteractedRef.current = false;
    mobileInitialFitCargoRef.current = null;
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
    provider.setLayers(ALL_MAP_LAYERS);
    setMaplibreReadyCargoId(null);
    syncZoomLabel();

    return () => {
      provider.destroy();
      svgProviderRef.current = null;
    };
  }, [model, showMapLibre, syncZoomLabel]);

  const fitRouteOverview = useCallback(() => {
      if (showMapLibre) {
        const mapProvider = getMapLibreProvider();
        if (!mapProvider?.isReady()) return false;
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
    [getMapLibreProvider, mobileCamera, schematicScene.route, showMapLibre, syncZoomLabel],
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

  const runMobileInitialRouteFitRef = useRef<(attempt?: number) => void>(() => {});

  const runMobileInitialRouteFit = useCallback(
    (attempt = 0): void => {
      if (!mobileCamera) return;
      if (userCameraInteractedRef.current) return;
      if (mobileInitialFitCargoRef.current === model.cargoId) return;

      const scheduleRetry = (nextAttempt: number) => {
        if (nextAttempt >= MOBILE_INITIAL_FIT_MAX_ATTEMPTS) return;
        requestAnimationFrame(() => runMobileInitialRouteFitRef.current(nextAttempt));
      };

      if (showMapLibre) {
        const mapProvider = getMapLibreProvider();
        if (!mapProvider?.isReady()) {
          scheduleRetry(attempt + 1);
          return;
        }

        mapProvider.ensureViewportSize();
        const diagnostics = mapProvider.getRouteMarkerDiagnostics();
        const hasAnyMarker =
          diagnostics.hasOrigin || diagnostics.hasCurrentCargo || diagnostics.hasDestination;

        if (!hasAnyMarker) {
          scheduleRetry(attempt + 1);
          return;
        }

        const fitted = fitRouteOverview();
        if (!fitted) {
          scheduleRetry(attempt + 1);
          if (attempt + 1 >= MOBILE_INITIAL_FIT_MAX_ATTEMPTS) {
            centerCurrentCargo();
          }
          return;
        }

        mobileInitialFitCargoRef.current = model.cargoId;

        if (process.env.NODE_ENV === 'development') {
          console.info('[hydroway-map] mobile initial route fit', {
            cargoId: model.cargoId,
            hasOrigin: diagnostics.hasOrigin,
            hasCurrentCargo: diagnostics.hasCurrentCargo,
            hasDestination: diagnostics.hasDestination,
            routeCoordinatesLength: diagnostics.routeCoordinatesLength,
            padding: MOBILE_ROUTE_OVERVIEW_PADDING,
            maxZoom: MOBILE_ROUTE_OVERVIEW_MAX_ZOOM,
            mapReady: mapProvider.isReady(),
            fitted,
          });
        }
        return;
      }

      const provider = svgProviderRef.current;
      if (!provider) {
        scheduleRetry(attempt + 1);
        return;
      }

      fitRouteOverview();
      mobileInitialFitCargoRef.current = model.cargoId;

      if (process.env.NODE_ENV === 'development') {
        const routeFeature = model.geo.routeTrack.features[0];
        const routeCoordinatesLength =
          routeFeature?.geometry.type === 'LineString'
            ? routeFeature.geometry.coordinates.length
            : 0;

        console.info('[hydroway-map] mobile initial route fit', {
          cargoId: model.cargoId,
          hasOrigin: true,
          hasCurrentCargo: true,
          hasDestination: true,
          routeCoordinatesLength,
          padding: MOBILE_ROUTE_OVERVIEW_PADDING,
          maxZoom: MOBILE_ROUTE_OVERVIEW_MAX_ZOOM,
          mapReady: true,
          fitted: true,
          provider: 'svg-schematic',
        });
      }
    },
    [centerCurrentCargo, fitRouteOverview, getMapLibreProvider, mobileCamera, model, showMapLibre],
  );

  useEffect(() => {
    runMobileInitialRouteFitRef.current = runMobileInitialRouteFit;
  }, [runMobileInitialRouteFit]);

  const handleMaplibreReady = useCallback(() => {
    setMaplibreMountFailed(false);
    setMaplibreReadyCargoId(model.cargoId);
    const mapProvider = maplibreViewportRef.current?.getProvider();
    if (mapProvider?.kind === 'maplibre') {
      const maplibreProvider = mapProvider as MapLibreHydrowayProvider;
      maplibreProvider.ensureViewportSize();
      maplibreProvider.setLayers(ALL_MAP_LAYERS);
      setActiveLayerPreset(maplibreProvider.getLayerPreset());
      if (disableLayerTooltips) {
        maplibreProvider.setLayerTooltipUiBlocked(true);
      }
      if (mobileCamera) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            runMobileInitialRouteFit(0);
          });
        });
      }
    }
    syncZoomLabel();
  }, [
    disableLayerTooltips,
    mobileCamera,
    model.cargoId,
    runMobileInitialRouteFit,
    syncZoomLabel,
  ]);

  useEffect(() => {
    if (!mobileCamera || !maplibreReady) return undefined;

    const mapProvider = getMapLibreProvider();
    if (!mapProvider?.isReady()) return undefined;

    return mapProvider.bindUserCameraInteractionListener(() => {
      userCameraInteractedRef.current = true;
    });
  }, [getMapLibreProvider, maplibreReady, mobileCamera, model.cargoId]);

  useEffect(() => {
    if (!mobileCamera || showMapLibre) return undefined;

    const frameId = requestAnimationFrame(() => {
      runMobileInitialRouteFit(0);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [mobileCamera, model.cargoId, runMobileInitialRouteFit, showMapLibre]);

  const handleMaplibreInitError = useCallback(() => {
    setMaplibreMountFailed(true);
    setMaplibreReadyCargoId(null);
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

  const handleSelectLayerPreset = useCallback(
    (presetId: HydrowayMapLayerPresetId) => {
      if (!showMapLibre) return;
      const mapProvider = getMapLibreProvider();
      if (!mapProvider?.isReady() || !mapProvider.canSetLayerPreset(presetId)) return;
      mapProvider.setLayerPreset(presetId);
      setActiveLayerPreset(presetId);
      if (closeLayerPanelOnSelect) {
        setLayerPresetPanelOpen(false);
        if (disableLayerTooltips) {
          mapProvider.setLayerTooltipUiBlocked(true);
        } else {
          mapProvider.setLayerTooltipUiBlocked(false);
        }
      }
    },
    [closeLayerPanelOnSelect, disableLayerTooltips, getMapLibreProvider, showMapLibre],
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

  const handleFitRoute = useCallback(() => {
    setActiveChapterByCargo(null);
    cameraFlyRequestRef.current += 1;
    fitRouteOverview();
  }, [fitRouteOverview]);

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

    const nextPreset: HydrowayMapLayerPresetId =
      activeLayerPreset === 'waterways' ? 'dark' : 'waterways';
    if (!mapProvider.canSetLayerPreset(nextPreset)) return;

    mapProvider.setLayerPreset(nextPreset);
    setActiveLayerPreset(nextPreset);
  }, [activeLayerPreset, getMapLibreProvider, showMapLibre]);

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
    activeLayerPreset,
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
    handleSelectLayerPreset,
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
  };
}

export type HydrowayMapRuntime = ReturnType<typeof useHydrowayMapRuntime>;
