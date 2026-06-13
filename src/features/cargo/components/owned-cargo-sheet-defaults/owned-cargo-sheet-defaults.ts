import { useEffect } from 'react';

import type { BottomSheetProps, BottomSheetSnapHeights } from '@/shared/components/bottom-sheet';

const ownedCargoSheetSnapOrder: string[] = ['expanded'];

/** Alturas de snap premium compartilhadas entre sheets owned-cargo. */
export const ownedCargoSheetSnapHeights = {
  expanded: '88dvh',
} satisfies BottomSheetSnapHeights;

/** Props compartilhadas — BottomSheet global, superfície premium owned. */
export const ownedCargoSheetDefaults = {
  viewportAnchor: 'flush',
  enableDrag: true,
  closeOnOverlayClick: true,
  variant: 'strong',
  overlayVariant: 'strong',
  snapOrder: ownedCargoSheetSnapOrder,
  initialSnap: 'expanded',
} satisfies Partial<BottomSheetProps>;

export const ownedCargoSheetPortalAttributes = {
  'data-owned-cargo-sheet': 'true',
} as const;

/**
 * Marca painel portaled do BottomSheet shared com tema claro premium.
 */
export function useOwnedCargoSheetPortal(
  open: boolean,
  panelModuleClass: string,
  extraAttributes?: Readonly<Record<string, string>>,
) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const panels = document.querySelectorAll<HTMLElement>('[data-testid="bottom-sheet-panel"]');

      panels.forEach((panel) => {
        if (!panel.classList.contains(panelModuleClass)) {
          return;
        }

        panel.setAttribute('data-theme', 'light');

        if (extraAttributes) {
          for (const [key, value] of Object.entries(extraAttributes)) {
            panel.setAttribute(key, value);
          }
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open, panelModuleClass, extraAttributes]);
}
