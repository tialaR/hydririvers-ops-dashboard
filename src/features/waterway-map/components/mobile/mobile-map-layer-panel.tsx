'use client';

import { useTranslations } from 'next-intl';
import {
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type TransitionEvent,
} from 'react';

import type { HydrowayMapRuntime } from '../../hooks/use-hydroway-map-runtime';
import { OperationalLayerModeLegend } from '../operational-layer-mode-legend';
import styles from './mobile-hydroway-map.module.scss';
import panelShellStyles from './mobile-map-layer-panel.module.scss';

type MobileMapLayerPanelProps = {
  runtime: HydrowayMapRuntime;
};

type PanelMotionState = 'closed' | 'open' | 'closing';

const PANEL_MOTION_DURATION_MS = 300;
const PANEL_MOTION_UNMOUNT_FALLBACK_MS = PANEL_MOTION_DURATION_MS + 40;

export function MobileMapLayerPanel({ runtime }: MobileMapLayerPanelProps) {
  const tModes = useTranslations('waterwayMap.operationalModes');
  const tMap = useTranslations('operationsBoard.map');
  const {
    layerPresetPanelOpen,
    activeOperationalLayerMode,
    operationalLayerModeOrder,
    layerPresetControlsEnabled,
    handleSelectOperationalLayerMode,
    handleLayerPresetPanelPointerEnter,
    handleLayerPresetPanelPointerLeave,
  } = runtime;

  const [panelMounted, setPanelMounted] = useState(layerPresetPanelOpen);
  const [panelMotionState, setPanelMotionState] = useState<PanelMotionState>(
    layerPresetPanelOpen ? 'closed' : 'closing',
  );
  const [prevLayerPresetPanelOpen, setPrevLayerPresetPanelOpen] = useState(layerPresetPanelOpen);
  const panelUnmountScheduledRef = useRef(false);

  if (layerPresetPanelOpen !== prevLayerPresetPanelOpen) {
    setPrevLayerPresetPanelOpen(layerPresetPanelOpen);
    if (layerPresetPanelOpen) {
      setPanelMounted(true);
      setPanelMotionState('closed');
    } else if (panelMounted) {
      setPanelMotionState('closing');
    }
  }

  useLayoutEffect(() => {
    if (!layerPresetPanelOpen) return;
    panelUnmountScheduledRef.current = false;
  }, [layerPresetPanelOpen]);

  useLayoutEffect(() => {
    if (!panelMounted || !layerPresetPanelOpen || panelMotionState !== 'closed') return;

    let openFrameId = 0;
    const closedFrameId = requestAnimationFrame(() => {
      openFrameId = requestAnimationFrame(() => {
        setPanelMotionState('open');
      });
    });

    return () => {
      cancelAnimationFrame(closedFrameId);
      if (openFrameId) cancelAnimationFrame(openFrameId);
    };
  }, [layerPresetPanelOpen, panelMounted, panelMotionState]);

  useLayoutEffect(() => {
    if (panelMotionState !== 'closing') return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fallbackMs = prefersReducedMotion ? 1 : PANEL_MOTION_UNMOUNT_FALLBACK_MS;

    const timeoutId = window.setTimeout(() => {
      if (panelUnmountScheduledRef.current) return;
      panelUnmountScheduledRef.current = true;
      setPanelMounted(false);
    }, fallbackMs);

    return () => window.clearTimeout(timeoutId);
  }, [panelMotionState]);

  if (!panelMounted) return null;

  const unmountPanelAfterClose = () => {
    if (panelUnmountScheduledRef.current) return;
    panelUnmountScheduledRef.current = true;
    setPanelMounted(false);
  };

  const handlePanelTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (panelMotionState !== 'closing') return;
    if (event.propertyName !== 'opacity' && event.propertyName !== 'clip-path') return;
    unmountPanelAfterClose();
  };

  const stopEvent = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const activeModeLabel = tModes(`${activeOperationalLayerMode}.label`);
  const activeModeDescription = tModes(`${activeOperationalLayerMode}.description`);

  return (
    <aside
      className={`${styles.layerPanel} ${panelShellStyles.layerPanelShell}`}
      role="dialog"
      aria-label={tMap('layersPanelAria')}
      aria-hidden={panelMotionState === 'closing'}
      data-panel-state={panelMotionState}
      data-testid="hydroway-layer-panel"
      onTransitionEnd={handlePanelTransitionEnd}
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
