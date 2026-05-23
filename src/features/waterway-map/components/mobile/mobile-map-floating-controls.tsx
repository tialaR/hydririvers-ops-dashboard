'use client';

import {
  Crosshair,
  Flag,
  Layers,
  List,
  MapPin,
  Minus,
  Plus,
  Route,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MouseEvent, PointerEvent } from 'react';

import type { HydrowayMapRuntime } from '../../hooks/use-hydroway-map-runtime';
import styles from './mobile-hydroway-map.module.scss';

type MobileMapFloatingControlsProps = {
  runtime: HydrowayMapRuntime;
  infoOpen: boolean;
  onToggleInfo: () => void;
  onToggleLayers: () => void;
};

export function MobileMapFloatingControls({
  runtime,
  infoOpen,
  onToggleInfo,
  onToggleLayers,
}: MobileMapFloatingControlsProps) {
  const tMap = useTranslations('operationsBoard.map');
  const {
    mapLibreControlsDisabled,
    layerPresetPanelOpen,
    handleCenterCurrentCargo,
    handleFitRoute,
    handleFocusDestination,
    handleFocusOrigin,
    handleZoomIn,
    handleZoomOut,
  } = runtime;

  const stopEvent = (event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <nav className={styles.floatingControls} aria-label={tMap('layersPanelAria')}>
      <button
        type="button"
        className={[
          styles.floatingButton,
          layerPresetPanelOpen ? styles.floatingButtonActive : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          onToggleLayers();
        }}
        disabled={mapLibreControlsDisabled}
        aria-label={tMap('mapLayers')}
        aria-pressed={layerPresetPanelOpen}
        data-testid="hydroway-map-mobile-layers-button"
      >
        <Layers size={18} strokeWidth={2} aria-hidden />
      </button>

      <button
        type="button"
        className={styles.floatingButton}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          handleFocusOrigin();
        }}
        disabled={mapLibreControlsDisabled}
        aria-label={tMap('mapFocusOrigin')}
        data-testid="hydroway-map-mobile-focus-origin-button"
      >
        <MapPin size={18} strokeWidth={2} aria-hidden />
      </button>

      <button
        type="button"
        className={styles.floatingButton}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          handleCenterCurrentCargo();
        }}
        disabled={mapLibreControlsDisabled}
        aria-label={tMap('mapCurrentCargoLocation')}
        data-testid="hydroway-map-mobile-center-cargo-button"
      >
        <Crosshair size={18} strokeWidth={2} aria-hidden />
      </button>

      <button
        type="button"
        className={styles.floatingButton}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          handleFocusDestination();
        }}
        disabled={mapLibreControlsDisabled}
        aria-label={tMap('mapFocusDestination')}
        data-testid="hydroway-map-mobile-focus-destination-button"
      >
        <Flag size={18} strokeWidth={2} aria-hidden />
      </button>

      <button
        type="button"
        className={styles.floatingButton}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          handleFitRoute();
        }}
        disabled={mapLibreControlsDisabled}
        aria-label={tMap('mapRouteOverview')}
        data-testid="hydroway-map-mobile-route-overview-button"
      >
        <Route size={18} strokeWidth={2} aria-hidden />
      </button>

      <div className={styles.floatingControlsGroup} role="group" aria-label={tMap('mapZoomControls')}>
        <button
          type="button"
          className={styles.floatingButton}
          onPointerDown={stopEvent}
          onClick={(event) => {
            stopEvent(event);
            handleZoomIn();
          }}
          disabled={mapLibreControlsDisabled}
          aria-label={tMap('mapZoomIn')}
          data-testid="hydroway-map-mobile-zoom-in-button"
        >
          <Plus size={18} strokeWidth={2} aria-hidden />
        </button>

        <button
          type="button"
          className={styles.floatingButton}
          onPointerDown={stopEvent}
          onClick={(event) => {
            stopEvent(event);
            handleZoomOut();
          }}
          disabled={mapLibreControlsDisabled}
          aria-label={tMap('mapZoomOut')}
          data-testid="hydroway-map-mobile-zoom-out-button"
        >
          <Minus size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <button
        type="button"
        className={[styles.floatingButton, infoOpen ? styles.floatingButtonActive : '']
          .filter(Boolean)
          .join(' ')}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          onToggleInfo();
        }}
        aria-label={tMap('mapOpenInfo')}
        aria-pressed={infoOpen}
        data-testid="hydroway-map-mobile-info-button"
      >
        <List size={18} strokeWidth={2} aria-hidden />
      </button>
    </nav>
  );
}
