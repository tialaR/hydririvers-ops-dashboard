import { CargoOperationalTimeline } from './cargo-operational-timeline';
import styles from './page-62-contract-surfaces.module.sass';

export function Page62D05ContractSurface() {
  return (
    <div className={styles.d05} data-testid="page62-d05-contract">
      <CargoOperationalTimeline />
    </div>
  );
}
