'use client';

import { Crosshair, Layers3, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DesktopMapLayerMode } from './desktop-cargo-map.helpers';
import styles from './desktop-cargo-map.module.scss';

type DesktopCargoMapFloatingControlsProps = {
  zoomPercent: number;
  layerMode: DesktopMapLayerMode;
  layerLabel: string;
  onToggleLayers: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFitRoute: () => void;
  onRecenterVessel: () => void;
};

export function DesktopCargoMapFloatingControls({
  zoomPercent,
  layerMode,
  layerLabel,
  onToggleLayers,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitRoute,
  onRecenterVessel,
}: DesktopCargoMapFloatingControlsProps) {
  const tBoard = useTranslations('operationsBoard');

  return (
    <div className={styles.floatingControlsRoot}>
      <span className={styles.zoomHudChip} aria-live="polite">
        {tBoard('map.cameraSummary', { zoom: zoomPercent })}
      </span>
      <div className={styles.canvasControls}>
        <button
          type="button"
          className={styles.canvasControlBtn}
          aria-label={tBoard('map.toggleLayers', { layer: layerLabel })}
          aria-pressed={layerMode !== 'all'}
          title={layerLabel}
          onClick={onToggleLayers}
        >
          <Layers3 size={17} strokeWidth={2.2} aria-hidden />
        </button>
        <button type="button" className={styles.canvasControlBtn} aria-label={tBoard('map.zoomIn')} onClick={onZoomIn}>
          <Plus size={18} strokeWidth={2.4} aria-hidden />
        </button>
        <button type="button" className={styles.canvasControlBtn} aria-label={tBoard('map.zoomOut')} onClick={onZoomOut}>
          <Minus size={18} strokeWidth={2.4} aria-hidden />
        </button>
        <button type="button" className={styles.canvasControlBtn} aria-label={tBoard('map.fitRoute')} onClick={onFitRoute}>
          <Maximize2 size={17} strokeWidth={2.2} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.canvasControlBtn}
          aria-label={tBoard('map.recenterVessel')}
          onClick={onRecenterVessel}
        >
          <Crosshair size={17} strokeWidth={2.2} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.canvasControlBtn}
          aria-label={tBoard('map.resetView')}
          onClick={onResetView}
        >
          <RotateCcw size={17} strokeWidth={2.2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
