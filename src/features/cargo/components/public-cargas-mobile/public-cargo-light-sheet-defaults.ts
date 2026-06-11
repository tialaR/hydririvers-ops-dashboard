import { useEffect } from 'react';

import type { BottomSheetProps, BottomSheetSnapHeights } from '@/shared/components/bottom-sheet';

const publicCargoLightSheetSnapOrder: string[] = ['collapsed', 'expanded'];

/** Alturas de snap compartilhadas (filtro e ação/detalhe). */
export const publicCargoLightSheetSnapHeights = {
  collapsed: '40dvh',
  expanded: '98dvh',
} satisfies BottomSheetSnapHeights;

/** Props compartilhadas entre filter sheet e action sheet públicos (mesmo BottomSheet shared). */
export const publicCargoLightSheetDefaults = {
  viewportAnchor: 'flush',
  enableDrag: true,
  closeOnOverlayClick: true,
  variant: 'light',
  overlayVariant: 'light',
  snapOrder: publicCargoLightSheetSnapOrder,
  initialSnap: 'collapsed',
} satisfies Partial<BottomSheetProps>;

export const publicCargoActionSheetPortalAttributes = {
  'data-public-cargo-action-sheet': 'true',
} as const;

/**
 * Aplica `data-theme="light"` (e attrs extras) no painel portaled do BottomSheet shared.
 */
export function usePublicCargoLightSheetPortal(
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
