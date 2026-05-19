'use client';

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
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const providerRef = useRef<MapLibreHydrowayProvider | null>(null);

  useImperativeHandle(ref, () => ({
    getProvider: () => providerRef.current,
  }));

  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return undefined;

    const provider = new MapLibreHydrowayProvider();
    try {
      provider.mount(
        {
          container,
          viewBox: HYDRO_MAP_VIEWBOX,
          model,
        },
        { onReady },
      );
      providerRef.current = provider;
    } catch {
      provider.destroy();
      providerRef.current = null;
      onInitError();
    }

    return () => {
      provider.destroy();
      providerRef.current = null;
    };
  }, [model, onInitError, onReady]);

  return <div ref={viewportRef} className={styles.maplibreViewport} />;
});
