'use client';

import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

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
  onReady: () => void;
  onInitError: () => void;
};

export const HydrowayMapSpikeMaplibreViewport = forwardRef<
  HydrowayMapSpikeMaplibreViewportHandle,
  HydrowayMapSpikeMaplibreViewportProps
>(function HydrowayMapSpikeMaplibreViewport({ model, onReady, onInitError }, ref) {
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
  }, [model.cargoId, model.progress01]);

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
        },
        {
          onReady: () => {
            if (cancelled) return;
            onReadyRef.current();
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
  }, [model.cargoId]);

  return (
    <div className={styles.maplibreWrap}>
      <div ref={viewportRef} className={styles.maplibreViewport} />
    </div>
  );
});
