import type { ReactNode } from 'react';

import styles from './dev-routes-layout.module.scss';

type DevRoutesLayoutProps = {
  children: ReactNode;
};

/**
 * Dev/lab routes under `/[locale]/dev/*` — isolated from `(product-shell)` and AdminChrome.
 * Spacing and viewport are owned by each lab page (e.g. mobile-cargo-list-lab.module.scss).
 */
export default function DevRoutesLayout({ children }: DevRoutesLayoutProps) {
  return (
    <div className={styles.root} data-hydro-dev-route="true" data-testid="dev-routes-layout">
      {children}
    </div>
  );
}
