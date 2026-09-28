'use client';

import { Suspense } from 'react';

import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import {
  HydrowayMapSpikeClient,
  type HydrowayMapExperience,
} from './hydroway-map-spike-client';
import styles from './hydroway-map-product.module.scss';

type HydrowayMapProductShellProps = {
  model: HydrowayMapModel;
  experience?: Extract<HydrowayMapExperience, 'product' | 'overview'>;
};

function HydrowayMapProductFallback() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.loadingPulse} aria-hidden />
    </div>
  );
}

export function HydrowayMapProductShell({
  model,
  experience = 'product',
}: HydrowayMapProductShellProps) {
  return (
    <div className={styles.host} data-testid="hydroway-map-product">
      <Suspense fallback={<HydrowayMapProductFallback />}>
        <HydrowayMapSpikeClient model={model} preferredProvider="maplibre" experience={experience} />
      </Suspense>
    </div>
  );
}
