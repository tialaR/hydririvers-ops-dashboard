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
import { HydrowayMapFloatingAction } from '../shared/hydroway-map-floating-action';
import type { MobileRouteSheetSnap } from './mobile-route-sheet';
import styles from './mobile-map-control-stack.module.scss';

export type MobileMapControlStackProps = {
  runtime: HydrowayMapRuntime;
  routeDetailsOpen: boolean;
  routeSheetSnap?: MobileRouteSheetSnap;
  onOpenRouteDetails: () => void;
  onToggleLayers: () => void;
};

export function MobileMapControlStack({
  runtime,
  routeDetailsOpen,
  routeSheetSnap = 'partial',
  onOpenRouteDetails,
  onToggleLayers,
}: MobileMapControlStackProps) {
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

  const stackClassName = [
    styles.stack,
    routeDetailsOpen && routeSheetSnap === 'expanded' ? styles.stackAboveExpandedSheet : '',
    routeDetailsOpen && routeSheetSnap === 'partial' ? styles.stackAbovePartialSheet : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      className={stackClassName}
      aria-label={tMap('layersPanelAria')}
      data-sheet-open={routeDetailsOpen ? 'true' : 'false'}
      data-sheet-snap={routeDetailsOpen ? routeSheetSnap : undefined}
      data-testid="hydroway-map-mobile-control-stack"
    >
      <HydrowayMapFloatingAction
        size="mobile"
        icon={<Layers size={18} strokeWidth={2} />}
        ariaLabel={tMap('mapLayers')}
        active={layerPresetPanelOpen}
        ariaPressed={layerPresetPanelOpen}
        disabled={mapLibreControlsDisabled}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          onToggleLayers();
        }}
        data-testid="hydroway-map-mobile-layers-button"
      />

      <HydrowayMapFloatingAction
        size="mobile"
        icon={<MapPin size={18} strokeWidth={2} />}
        ariaLabel={tMap('mapFocusOrigin')}
        disabled={mapLibreControlsDisabled}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          handleFocusOrigin();
        }}
        data-testid="hydroway-map-mobile-focus-origin-button"
      />

      <HydrowayMapFloatingAction
        size="mobile"
        icon={<Crosshair size={18} strokeWidth={2} />}
        ariaLabel={tMap('mapCurrentCargoLocation')}
        disabled={mapLibreControlsDisabled}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          handleCenterCurrentCargo();
        }}
        data-testid="hydroway-map-mobile-center-cargo-button"
      />

      <HydrowayMapFloatingAction
        size="mobile"
        icon={<Flag size={18} strokeWidth={2} />}
        ariaLabel={tMap('mapFocusDestination')}
        disabled={mapLibreControlsDisabled}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          handleFocusDestination();
        }}
        data-testid="hydroway-map-mobile-focus-destination-button"
      />

      <HydrowayMapFloatingAction
        size="mobile"
        icon={<Route size={18} strokeWidth={2} />}
        ariaLabel={tMap('mapRouteOverview')}
        disabled={mapLibreControlsDisabled}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          handleFitRoute();
        }}
        data-testid="hydroway-map-mobile-route-overview-button"
      />

      <div className={styles.zoomGroup} role="group" aria-label={tMap('mapZoomControls')}>
        <HydrowayMapFloatingAction
          size="mobile"
          icon={<Plus size={18} strokeWidth={2} />}
          ariaLabel={tMap('mapZoomIn')}
          disabled={mapLibreControlsDisabled}
          onPointerDown={stopEvent}
          onClick={(event) => {
            stopEvent(event);
            handleZoomIn();
          }}
          data-testid="hydroway-map-mobile-zoom-in-button"
        />

        <HydrowayMapFloatingAction
          size="mobile"
          icon={<Minus size={18} strokeWidth={2} />}
          ariaLabel={tMap('mapZoomOut')}
          disabled={mapLibreControlsDisabled}
          onPointerDown={stopEvent}
          onClick={(event) => {
            stopEvent(event);
            handleZoomOut();
          }}
          data-testid="hydroway-map-mobile-zoom-out-button"
        />
      </div>

      <HydrowayMapFloatingAction
        size="mobile"
        icon={<List size={18} strokeWidth={2} />}
        ariaLabel={tMap('mobileRouteOpenDetailsAria')}
        active={routeDetailsOpen}
        ariaPressed={routeDetailsOpen}
        onPointerDown={stopEvent}
        onClick={(event) => {
          stopEvent(event);
          onOpenRouteDetails();
        }}
        data-testid="hydroway-map-mobile-route-details-button"
      />
    </nav>
  );
}
