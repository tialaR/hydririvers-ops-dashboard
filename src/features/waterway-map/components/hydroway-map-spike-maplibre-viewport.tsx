'use client';

import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';

import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import { MapLibreHydrowayProvider } from '../providers/maplibre-hydroway-provider';
import type { HydrowayMapProvider } from '../providers/map-provider.types';
import { HYDRO_MAP_VIEWBOX } from '../utils/hydro-map-style';
import styles from './hydroway-map-spike.module.scss';

export type HydrowayMapSpikeMaplibreViewportHandle = {
  getProvider: () => HydrowayMapProvider | null;
};

type HydrowayMapSpikeMaplibreViewportProps = {
  model: HydrowayMapModel;
  onReady: (provider: MapLibreHydrowayProvider) => void;
  onInitError: () => void;
  skipInitialRouteCamera?: boolean;
};

export const HydrowayMapSpikeMaplibreViewport = forwardRef<
  HydrowayMapSpikeMaplibreViewportHandle,
  HydrowayMapSpikeMaplibreViewportProps
>(function HydrowayMapSpikeMaplibreViewport(
  { model, onReady, onInitError, skipInitialRouteCamera = false },
  ref,
) {
  const tBoard = useTranslations('operationsBoard.map');
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const providerRef = useRef<MapLibreHydrowayProvider | null>(null);
  const modelRef = useRef(model);
  const onReadyRef = useRef(onReady);
  const onInitErrorRef = useRef(onInitError);
  const routeMarkerAriaLabelsRef = useRef({
    origin: '',
    destination: '',
    vessel: '',
  });

  modelRef.current = model;
  onReadyRef.current = onReady;
  onInitErrorRef.current = onInitError;
  routeMarkerAriaLabelsRef.current = {
    origin: tBoard('routeMarkerOrigin'),
    destination: tBoard('routeMarkerDestination'),
    vessel: tBoard('currentCargoLocation'),
  };

  useImperativeHandle(ref, () => ({
    getProvider: () => providerRef.current,
  }));

  useEffect(() => {
    const provider = providerRef.current;
    if (!provider?.isReady()) return;
    provider.updateModel(modelRef.current);
    provider.ensureViewportSize();
  }, [model.cargoId, model.progress01]);

  useLayoutEffect(() => {
    const container = viewportRef.current;
    if (!container) return undefined;

    let raf1 = 0;
    let raf2 = 0;

    const logStageMount = () => {
      if (process.env.NODE_ENV !== 'development') return;
      const rect = container.getBoundingClientRect();
      const forceSvgFallback =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('forceSvgFallback') === '1';
      console.info('[hydroway-map] product map stage mounted', {
        containerWidth: Math.round(rect.width),
        containerHeight: Math.round(rect.height),
        preferredProvider: 'maplibre',
        forceSvgFallback,
      });
    };

    const syncViewport = () => {
      providerRef.current?.ensureViewportSize();
    };

    logStageMount();
    raf1 = requestAnimationFrame(() => {
      syncViewport();
      raf2 = requestAnimationFrame(syncViewport);
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [model.cargoId]);

  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return undefined;

    let cancelled = false;
    const provider = new MapLibreHydrowayProvider();

    try {
      provider.mount(
        {
          container,
          viewBox: HYDRO_MAP_VIEWBOX,
          model: modelRef.current,
          currentCargoMarkerAriaLabel: routeMarkerAriaLabelsRef.current.vessel,
          originMarkerAriaLabel: routeMarkerAriaLabelsRef.current.origin,
          destinationMarkerAriaLabel: routeMarkerAriaLabelsRef.current.destination,
          skipInitialRouteCamera,
        },
        {
          onReady: () => {
            if (cancelled) return;
            provider.ensureViewportSize();
            onReadyRef.current(provider);
          },
        },
      );
      if (cancelled) {
        provider.destroy();
        return undefined;
      }
      providerRef.current = provider;
    } catch {
      provider.destroy();
      providerRef.current = null;
      if (!cancelled) {
        onInitErrorRef.current();
      }
    }

    return () => {
      cancelled = true;
      providerRef.current = null;
      provider.destroy();
    };
  }, [model.cargoId, skipInitialRouteCamera]);

  return (
    <div className={styles.maplibreWrap}>
      <div ref={viewportRef} className={styles.maplibreViewport} />
    </div>
  );
});
