import { CargoDocumentsEvidencePanel } from './cargo-documents-evidence-panel';
import { CargoOccurrenceSummary } from './cargo-occurrence-summary';
import styles from './documents-occurrence.module.sass';

export function Page62D06ContractSurface() {
  return (
    <div className={styles.d06Surface} data-testid="page62-d06-contract">
      <CargoDocumentsEvidencePanel />
    </div>
  );
}

export function Page62D07ContractSurface() {
  return (
    <div className={styles.d07Surface} data-testid="page62-d07-contract">
      <CargoOccurrenceSummary />
    </div>
  );
}
