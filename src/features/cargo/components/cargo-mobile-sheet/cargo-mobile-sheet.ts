import { useEffect } from 'react';

import type { BottomSheetProps, BottomSheetSnapHeights } from '@/shared/components/bottom-sheet';

const cargoMobileSheetSnapOrder: string[] = ['collapsed', 'expanded'];

export const cargoMobileSheetSnapHeights = {
  collapsed: '40dvh',
  expanded: '98dvh',
} satisfies BottomSheetSnapHeights;

export const cargoMobileSheetDefaults = {
  viewportAnchor: 'flush',
  enableDrag: true,
  closeOnOverlayClick: true,
  variant: 'light',
  overlayVariant: 'light',
  snapOrder: cargoMobileSheetSnapOrder,
  initialSnap: 'collapsed',
} satisfies Partial<BottomSheetProps>;

export function useCargoMobileSheetPortal(
  open: boolean,
  panelModuleClass: string,
  extraAttributes?: Readonly<Record<string, string>>,
) {
  useEffect(() => {
    if (!open) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const panels = document.querySelectorAll<HTMLElement>('[data-testid="bottom-sheet-panel"]');
      panels.forEach((panel) => {
        if (!panel.classList.contains(panelModuleClass)) return;
        panel.setAttribute('data-theme', 'light');
        if (extraAttributes) {
          for (const [key, value] of Object.entries(extraAttributes)) panel.setAttribute(key, value);
        }
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, panelModuleClass, extraAttributes]);
}
