'use client';

import { Suspense } from 'react';

import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import { HydrowayMapSpikeClient } from './hydroway-map-spike-client';
import styles from './hydroway-map-product.module.scss';

type HydrowayMapProductShellProps = {
  model: HydrowayMapModel;
};

function HydrowayMapProductFallback() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.loadingPulse} aria-hidden />
    </div>
  );
}

export function HydrowayMapProductShell({ model }: HydrowayMapProductShellProps) {
  return (
    <div className={styles.host} data-testid="hydroway-map-product">
      <Suspense fallback={<HydrowayMapProductFallback />}>
        <HydrowayMapSpikeClient model={model} preferredProvider="maplibre" experience="product" />
      </Suspense>
    </div>
  );
}
