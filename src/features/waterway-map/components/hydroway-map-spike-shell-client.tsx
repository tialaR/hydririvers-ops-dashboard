'use client';

import { Suspense, useState } from 'react';

import {
  HydrowayMapSpikeClient,
  type HydrowaySpikeProviderMode,
} from './hydroway-map-spike-client';
import styles from './hydroway-map-spike.module.scss';

export function HydrowayMapSpikeShellClient() {
  const [preferredProvider, setPreferredProvider] = useState<HydrowaySpikeProviderMode>('maplibre');

  return (
    <div className={styles.shell}>
      <header className={styles.banner}>
        <div>
          <h1 className={styles.bannerTitle}>Hydroway Map Spike — V2.1c</h1>
          <p className={styles.bannerCopy}>
            Superfície dev isolada para validar MapLibre GL, fallback SVG, câmera e mocks geográficos fictícios.
            Não altera a rota de produção <code>/[locale]/cargas/[id]/mapa</code>, cockpit nem mobile. Fallback:{' '}
            <code>?forceSvgFallback=1</code>
          </p>
        </div>
        <div className={styles.badges} role="group" aria-label="Selecionar provider do mapa">
          <button
            type="button"
            className={`${styles.badge} ${styles.badgeButton} ${preferredProvider === 'svg-schematic' ? styles.badgeActive : styles.badgeMuted}`}
            onClick={() => setPreferredProvider('svg-schematic')}
          >
            SVG schematic
          </button>
          <button
            type="button"
            className={`${styles.badge} ${styles.badgeButton} ${preferredProvider === 'maplibre' ? styles.badgeActive : styles.badgeMuted}`}
            onClick={() => setPreferredProvider('maplibre')}
          >
            MapLibre GL
          </button>
        </div>
      </header>
      <Suspense fallback={<p className={styles.bannerCopy}>Carregando mapa…</p>}>
        <HydrowayMapSpikeClient preferredProvider={preferredProvider} />
      </Suspense>
    </div>
  );
}
