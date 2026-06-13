'use client';

import type { ReactNode } from 'react';
import styles from './owned-cargo-list-section.module.sass';

export function OwnedCargoListSection({
  children,
  testId = 'minhas-cargas-grid',
}: {
  children: ReactNode;
  testId?: string;
}) {
  return (
    <div className={styles.root} data-testid={testId}>
      {children}
    </div>
  );
}
