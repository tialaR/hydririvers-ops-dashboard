'use client';

import { useCallback, useState } from 'react';

import type { OwnedCargoPreviewPanel } from '@/features/cargo/domain/derive-owned-cargo-detail';

/** Estado local — compatível com `?panel=map|timeline|documents|risks` na fase E. */
export function useOwnedCargoPanel() {
  const [panelTarget, setPanelTarget] = useState<OwnedCargoPreviewPanel | null>(null);

  const openPanel = useCallback((panel: OwnedCargoPreviewPanel) => {
    setPanelTarget(panel);
  }, []);

  const closePanel = useCallback(() => {
    setPanelTarget(null);
  }, []);

  const isPanelOpen = useCallback(
    (panel: OwnedCargoPreviewPanel) => panelTarget === panel,
    [panelTarget],
  );

  return {
    panelTarget,
    openPanel,
    closePanel,
    isPanelOpen,
  };
}
