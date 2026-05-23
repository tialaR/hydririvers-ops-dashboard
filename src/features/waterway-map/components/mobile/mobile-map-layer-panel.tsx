'use client';

import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';

import {
  HYDROWAY_MAP_LAYER_PRESET_ORDER,
  HYDROWAY_MAP_LAYER_PRESETS,
} from '../../constants/hydroway-map-layer-presets';
import type { HydrowayMapRuntime } from '../../hooks/use-hydroway-map-runtime';
import styles from './mobile-hydroway-map.module.scss';

type MobileMapLayerPanelProps = {
  runtime: HydrowayMapRuntime;
};

export function MobileMapLayerPanel({ runtime }: MobileMapLayerPanelProps) {
  const tMap = useTranslations('operationsBoard.map');
  const {
    layerPresetPanelOpen,
    activeLayerPreset,
    layerPresetControlsEnabled,
    handleSelectLayerPreset,
    handleCloseLayerPresetPanel,
    handleLayerPresetPanelPointerEnter,
    handleLayerPresetPanelPointerLeave,
  } = runtime;

  if (!layerPresetPanelOpen) return null;

  const stopEvent = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <aside
      className={styles.layerPanel}
      role="dialog"
      aria-label={tMap('layersPanelAria')}
      data-testid="hydroway-map-mobile-layer-panel"
      onPointerEnter={handleLayerPresetPanelPointerEnter}
      onPointerLeave={handleLayerPresetPanelPointerLeave}
    >
      <header className={styles.layerPanelHeader}>
        <span className={styles.layerPanelTitle}>{tMap('mapLayers')}</span>
        <button
          type="button"
          className={styles.layerPanelClose}
          onClick={handleCloseLayerPresetPanel}
          aria-label={tMap('mapCloseLayers')}
        >
          ×
        </button>
      </header>

      <ul className={styles.layerPresetList}>
        {HYDROWAY_MAP_LAYER_PRESET_ORDER.map((presetId) => {
          const preset = HYDROWAY_MAP_LAYER_PRESETS[presetId];
          const isActive = activeLayerPreset === presetId;

          return (
            <li key={presetId} className={styles.layerPresetItem}>
              <button
                type="button"
                className={[
                  styles.layerPresetButton,
                  isActive ? styles.layerPresetButtonActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={stopEvent}
                onClick={(event) => {
                  stopEvent(event);
                  handleSelectLayerPreset(presetId);
                }}
                disabled={!layerPresetControlsEnabled}
                aria-pressed={isActive}
                aria-label={tMap(preset.labelKey)}
              >
                <span className={styles.layerPresetLabel}>{tMap(preset.labelKey)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
