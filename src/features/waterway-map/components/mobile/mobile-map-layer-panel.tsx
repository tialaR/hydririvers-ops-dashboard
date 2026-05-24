'use client';

import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';

import type { HydrowayMapRuntime } from '../../hooks/use-hydroway-map-runtime';
import { OperationalLayerModeLegend } from '../operational-layer-mode-legend';
import styles from './mobile-hydroway-map.module.scss';

type MobileMapLayerPanelProps = {
  runtime: HydrowayMapRuntime;
};

export function MobileMapLayerPanel({ runtime }: MobileMapLayerPanelProps) {
  const tModes = useTranslations('waterwayMap.operationalModes');
  const tMap = useTranslations('operationsBoard.map');
  const {
    layerPresetPanelOpen,
    activeOperationalLayerMode,
    operationalLayerModeOrder,
    layerPresetControlsEnabled,
    handleSelectOperationalLayerMode,
    handleCloseLayerPresetPanel,
    handleLayerPresetPanelPointerEnter,
    handleLayerPresetPanelPointerLeave,
  } = runtime;

  if (!layerPresetPanelOpen) return null;

  const stopEvent = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const activeModeLabel = tModes(`${activeOperationalLayerMode}.label`);
  const activeModeDescription = tModes(`${activeOperationalLayerMode}.description`);

  return (
    <aside
      className={styles.layerPanel}
      role="dialog"
      aria-label={tMap('layersPanelAria')}
      data-testid="hydroway-layer-panel"
      onPointerEnter={handleLayerPresetPanelPointerEnter}
      onPointerLeave={handleLayerPresetPanelPointerLeave}
    >
      <header className={styles.layerPanelHeader}>
        <div className={styles.layerPanelHeading}>
          <span className={styles.layerPanelTitle}>{tMap('mapLayers')}</span>
          <p className={styles.layerPanelCurrent} data-testid="hydroway-layer-current-mode">
            {tMap('layersCurrent', { mode: activeModeLabel })}
          </p>
          <p className={styles.layerPanelActiveDescription}>{activeModeDescription}</p>
          <OperationalLayerModeLegend
            mode={activeOperationalLayerMode}
            className={styles.layerPanelLegend}
            titleClassName={styles.layerPanelLegendTitle}
            listClassName={styles.layerPanelLegendList}
            itemClassName={styles.layerPanelLegendItem}
            swatchClassName={styles.layerPanelLegendSwatch}
            labelClassName={styles.layerPanelLegendLabel}
            maxItems={4}
          />
        </div>
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
        {operationalLayerModeOrder.map((modeId) => {
          const isActive = activeOperationalLayerMode === modeId;

          return (
            <li key={modeId} className={styles.layerPresetItem}>
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
                  handleSelectOperationalLayerMode(modeId);
                }}
                disabled={!layerPresetControlsEnabled}
                aria-pressed={isActive}
                aria-current={isActive ? 'true' : undefined}
                aria-label={tModes(`${modeId}.label`)}
                data-testid={`hydroway-layer-mode-${modeId}`}
              >
                <span className={styles.layerPresetButtonRow}>
                  <span className={styles.layerPresetLabel}>{tModes(`${modeId}.label`)}</span>
                  {isActive ? (
                    <span className={styles.layerPresetCheck} aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </span>
                <span className={styles.layerPresetDescription}>
                  {tModes(`${modeId}.description`)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
