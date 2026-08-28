'use client';

import type { ReactNode } from 'react';
import styles from './owned-cargo-list-section.module.sass';

export function OwnedCargoListSection({
  children,
  testId = 'minhas-cargas-grid',
  className,
}: {
  children: ReactNode;
  testId?: string;
  className?: string;
}) {
  return (
    <div className={className ?? styles.root} data-testid={testId}>
      {children}
    </div>
  );
}
