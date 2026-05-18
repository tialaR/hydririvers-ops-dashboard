import { HydrowayMapSpikeClient } from './hydroway-map-spike-client';
import styles from './hydroway-map-spike.module.scss';

export function HydrowayMapSpikeShell() {
  return (
    <div className={styles.shell}>
      <header className={styles.banner}>
        <div>
          <h1 className={styles.bannerTitle}>Hydroway Map Spike — V2.1b</h1>
          <p className={styles.bannerCopy}>
            Superfície dev isolada para validar provider, câmera e mocks geográficos fictícios antes de instalar
            MapLibre (V2.1c). Não altera a rota de produção{' '}
            <code>/[locale]/cargas/[id]/mapa</code> nem o cockpit.
          </p>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>SVG schematic</span>
          <span className={`${styles.badge} ${styles.badgeMuted}`}>MapLibre pendente</span>
        </div>
      </header>
      <HydrowayMapSpikeClient />
    </div>
  );
}
