'use client';

import { useEffect, useRef, useState } from 'react';

import type { ShipperMapRouteData } from '@/features/waterway-map/domain/owned-cargo-operation-route';
import { createShipperOperationMapProvider } from '@/features/waterway-map/providers/shipper-operation-map-provider-factory';
import type { ShipperOperationMapProvider } from '@/features/waterway-map/providers/shipper-operation-map-provider';

import { ShipperOperationMapFallback } from './owned-cargo-operation-map-fallback';

import styles from './owned-cargo-operation-map.module.sass';

type ShipperOperationMapProps = {
  routeData: ShipperMapRouteData;
  ariaLabel: string;
  fallbackHintLabel?: string;
  presentation?: 'default' | 'desktop-foundation';
};

export function ShipperOperationMap({
  routeData,
  ariaLabel,
  fallbackHintLabel,
  presentation = 'default',
}: ShipperOperationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const providerRef = useRef<ShipperOperationMapProvider | null>(null);
  const [hasMapFailed, setHasMapFailed] = useState(false);
  const routeKey = `${routeData.corridorId}:${routeData.progressRatio}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasMapFailed) return undefined;

    if (!providerRef.current) {
      const provider = createShipperOperationMapProvider();
      providerRef.current = provider;
      provider.mount(container, routeData, () => setHasMapFailed(true));
    } else {
      providerRef.current.update(routeData);
    }

    return undefined;
  }, [hasMapFailed, routeData, routeKey]);

  useEffect(() => () => {
    providerRef.current?.destroy();
    providerRef.current = null;
  }, []);

  if (hasMapFailed) {
    return (
      <ShipperOperationMapFallback
        routeData={routeData}
        ariaLabel={ariaLabel}
        hintLabel={fallbackHintLabel}
        presentation={presentation}
      />
    );
  }

  return (
    <div className={styles.mapRoot} aria-label={ariaLabel}>
      <div ref={containerRef} className={styles.mapViewport} />
    </div>
  );
}
