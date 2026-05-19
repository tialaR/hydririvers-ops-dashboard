'use client';

import { Suspense, useState } from 'react';

import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import {
  HydrowayMapSpikeClient,
  type HydrowaySpikeProviderMode,
} from './hydroway-map-spike-client';
import styles from './hydroway-map-spike.module.scss';

type HydrowayMapSpikeShellClientProps = {
  model: HydrowayMapModel;
};

export function HydrowayMapSpikeShellClient({ model }: HydrowayMapSpikeShellClientProps) {
  const [preferredProvider, setPreferredProvider] = useState<HydrowaySpikeProviderMode>('maplibre');

  return (
    <div className={styles.shell} data-testid="hydroway-map-spike">
      <header className={styles.banner}>
        <div>
          <h1 className={styles.bannerTitle}>Hydroway Map Spike — V2.7 Visual Lift</h1>
          <p className={styles.bannerCopy}>
            Spike dev MapLibre-native sobre mocks hidroviários V2.6: rotas demo CARGO-001/002/004 via{' '}
            <code>?cargoId=</code>, camadas hidrográficas, progresso de rota e fallback SVG. Não altera produção{' '}
            <code>/[locale]/cargas/[id]/mapa</code>. Fallback SVG: <code>?forceSvgFallback=1</code>
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
        <HydrowayMapSpikeClient model={model} preferredProvider={preferredProvider} />
      </Suspense>
    </div>
  );
}
