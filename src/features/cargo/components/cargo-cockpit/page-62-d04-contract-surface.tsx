import { CargoQuickEvidencePanel } from './cargo-quick-evidence-panel';
import { CargoTelemetryContextPanel } from './cargo-telemetry-context-panel';
import styles from './page-62-contract-surfaces.module.sass';

export function Page62D04ContractSurface() {
  return (
    <div className={styles.d04} data-testid="page62-d04-contract">
      <CargoTelemetryContextPanel />
      <CargoQuickEvidencePanel />
    </div>
  );
}
