'use client';

import type { ReactNode } from 'react';
import { ProductShellFrame } from '@/shared/layout/product-shell-frame/product-shell-frame';
import { useTheme } from '@/shared/providers/theme-provider';

import styles from './auth-shell.module.sass';

type AuthShellProps = {
  children: ReactNode;
};

/** Auth-owned shell. Authentication routes intentionally render without product header/navigation. */
export function AuthShell({ children }: AuthShellProps) {
  const { theme } = useTheme();

  return (
    <ProductShellFrame
      rootClassName={styles.root}
      mainClassName={styles.main}
      contentClassName={styles.content}
      rootAttributes={{ 'data-theme': theme, 'data-auth-shell': '' }}
    >
      {children}
    </ProductShellFrame>
  );
}
