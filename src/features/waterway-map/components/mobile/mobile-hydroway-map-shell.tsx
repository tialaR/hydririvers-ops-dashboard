'use client';

import { createPortal } from 'react-dom';
import { useLayoutEffect, type ReactNode } from 'react';

import { useLockBodyScroll } from '@/shared/hooks/use-lock-body-scroll';

import styles from './mobile-hydroway-map.module.scss';

const MOBILE_MAP_IMMERSIVE_CLASS = 'hx-hydroway-map-mobile-immersive';

type MobileHydrowayMapShellProps = {
  children: ReactNode;
  sheetOpen?: boolean;
};

function applyImmersiveDocumentClass(active: boolean) {
  const html = document.documentElement;
  const body = document.body;

  if (active) {
    html.classList.add(MOBILE_MAP_IMMERSIVE_CLASS);
    body.classList.add(MOBILE_MAP_IMMERSIVE_CLASS);
    return;
  }

  html.classList.remove(MOBILE_MAP_IMMERSIVE_CLASS);
  body.classList.remove(MOBILE_MAP_IMMERSIVE_CLASS);
}

export function MobileHydrowayMapShell({ children, sheetOpen = false }: MobileHydrowayMapShellProps) {
  useLockBodyScroll(true);

  useLayoutEffect(() => {
    applyImmersiveDocumentClass(true);

    return () => {
      applyImmersiveDocumentClass(false);
    };
  }, []);

  const shell = (
    <div
      className={styles.shell}
      data-testid="hydroway-map-mobile-experience"
      data-sheet-open={sheetOpen ? 'true' : 'false'}
    >
      {children}
    </div>
  );

  if (typeof document === 'undefined') {
    return shell;
  }

  return createPortal(shell, document.body);
}
