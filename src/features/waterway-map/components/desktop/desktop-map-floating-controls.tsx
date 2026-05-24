'use client';

import { useTranslations } from 'next-intl';
import type { MouseEvent, PointerEvent } from 'react';

import { renderHydrowayMapFloatingControlIcon } from '../../constants/hydroway-map-floating-control-icons';
import type { HydrowayCameraChapterId } from '../../providers/maplibre-hydroway-provider';
import { HydrowayMapFloatingAction } from '../shared/hydroway-map-floating-action';
import styles from '../hydroway-map-spike.module.scss';

export type DesktopMapFloatingControlKey =
  | 'origin'
  | 'destination'
  | 'zoom-in'
  | 'zoom-out'
  | 'layers'
  | 'reset'
  | 'current'
  | 'fit-route';

type DesktopMapFloatingControlsProps = {
  activeMapChapter: HydrowayCameraChapterId | null;
  layerPresetPanelOpen: boolean;
  mapLibreControlsDisabled: boolean;
  onControlClick: (controlKey: DesktopMapFloatingControlKey) => void;
  onStopEvent: (event: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => void;
};

export function DesktopMapFloatingControls({
  activeMapChapter,
  layerPresetPanelOpen,
  mapLibreControlsDisabled,
  onControlClick,
  onStopEvent,
}: DesktopMapFloatingControlsProps) {
  const tMap = useTranslations('operationsBoard.map');

  const dockControls: Array<{
    key: DesktopMapFloatingControlKey;
    tooltip: string;
    ariaLabel: string;
    active?: boolean;
    ariaPressed?: boolean;
    disabled?: boolean;
  }> = [
    {
      key: 'origin',
      tooltip: tMap('focusOrigin'),
      ariaLabel: tMap('focusOriginAria'),
      disabled: mapLibreControlsDisabled,
      ariaPressed: activeMapChapter === 'origin',
      active: activeMapChapter === 'origin',
    },
    {
      key: 'destination',
      tooltip: tMap('focusDestination'),
      ariaLabel: tMap('focusDestinationAria'),
      disabled: mapLibreControlsDisabled,
      ariaPressed: activeMapChapter === 'destination',
      active: activeMapChapter === 'destination',
    },
    {
      key: 'zoom-in',
      tooltip: tMap('mapZoomIn'),
      ariaLabel: tMap('mapZoomIn'),
      disabled: mapLibreControlsDisabled,
    },
    {
      key: 'zoom-out',
      tooltip: tMap('mapZoomOut'),
      ariaLabel: tMap('mapZoomOut'),
      disabled: mapLibreControlsDisabled,
    },
    {
      key: 'layers',
      tooltip: tMap('layersTitle'),
      ariaLabel: tMap('layersPanelAria'),
      ariaPressed: layerPresetPanelOpen,
      active: layerPresetPanelOpen,
      disabled: mapLibreControlsDisabled,
    },
    {
      key: 'reset',
      tooltip: tMap('mapResetView'),
      ariaLabel: tMap('mapResetView'),
      disabled: mapLibreControlsDisabled,
    },
    {
      key: 'current',
      tooltip: tMap('focusCurrentCargo'),
      ariaLabel: tMap('focusCurrentCargoAria'),
      disabled: mapLibreControlsDisabled,
      ariaPressed: activeMapChapter === 'current',
      active: activeMapChapter === 'current',
    },
    {
      key: 'fit-route',
      tooltip: tMap('mapRouteOverview'),
      ariaLabel: tMap('mapRouteOverview'),
      disabled: mapLibreControlsDisabled,
    },
  ];

  const handleDockControlButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onStopEvent(event);
    if (event.currentTarget.disabled) return;
    const controlKey = event.currentTarget.dataset.controlKey as DesktopMapFloatingControlKey | undefined;
    if (!controlKey) return;
    onControlClick(controlKey);
  };

  return (
    <div className={styles.controlStack}>
      {dockControls.map((control) => (
        <HydrowayMapFloatingAction
          key={control.key}
          size="desktop"
          icon={renderHydrowayMapFloatingControlIcon(control.key, 'desktop')}
          ariaLabel={control.ariaLabel}
          active={control.active}
          disabled={Boolean(control.disabled)}
          ariaPressed={control.ariaPressed}
          data-tooltip={control.tooltip}
          data-control-key={control.key}
          onPointerDownCapture={onStopEvent}
          onMouseDownCapture={onStopEvent}
          onDoubleClick={onStopEvent}
          onClick={handleDockControlButtonClick}
        />
      ))}
    </div>
  );
}
