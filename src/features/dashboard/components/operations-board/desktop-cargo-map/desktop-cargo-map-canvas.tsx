'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import {
  buildDesktopExpandedRouteGeometry,
  DESKTOP_MAP_VIEWBOX,
  type DesktopMapLayerMode,
} from './desktop-cargo-map.helpers';
import { DesktopCargoMapHud } from './desktop-cargo-map-hud';
import {
  createFitRouteCamera,
  createRecenterVesselCamera,
  createResetCamera,
  DESKTOP_MAP_INITIAL_CAMERA,
  getDesktopMapZoomPercent,
  mapPointerDeltaToCamera,
  type DesktopMapCamera,
  zoomDesktopMapCameraIn,
  zoomDesktopMapCameraOut,
} from './desktop-cargo-map-camera';
import { DesktopCargoMapFloatingControls } from './desktop-cargo-map-floating-controls';
import styles from './desktop-cargo-map.module.scss';

type DesktopCargoMapCanvasProps = {
  cargo: Cargo;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function DesktopCargoMapCanvas({ cargo }: DesktopCargoMapCanvasProps) {
  const tBoard = useTranslations('operationsBoard');
  const svgUid = useId().replace(/:/g, '');
  const geometry = useMemo(() => buildDesktopExpandedRouteGeometry(cargo), [cargo]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ active: false, startX: 0, startY: 0, camera: DESKTOP_MAP_INITIAL_CAMERA });
  const [camera, setCamera] = useState<DesktopMapCamera>(DESKTOP_MAP_INITIAL_CAMERA);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [layerMode, setLayerMode] = useState<DesktopMapLayerMode>('all');
  const [legendOpen, setLegendOpen] = useState(false);

  const showNetwork = layerMode !== 'route';
  const showRoute = layerMode !== 'network';

  useEffect(() => {
    const updateSize = () => {
      const element = viewportRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      setViewportSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    const timer = window.setTimeout(updateSize, 80);
    return () => {
      window.removeEventListener('resize', updateSize);
      window.clearTimeout(timer);
    };
  }, []);

  const zoomPercent = getDesktopMapZoomPercent(camera);
  const labelCities = geometry.contextCities.filter((city) => city.role === 'context');
  const progressPercent = Math.round(geometry.progress01 * 100);
  const viewBox = `${camera.x} ${camera.y} ${camera.width} ${camera.height}`;

  const handleZoomIn = useCallback(() => {
    setCamera((current) => zoomDesktopMapCameraIn(current));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCamera((current) => zoomDesktopMapCameraOut(current));
  }, []);

  const handleResetView = useCallback(() => {
    setCamera(createResetCamera());
  }, []);

  const handleFitRoute = useCallback(() => {
    setCamera(createFitRouteCamera(geometry));
  }, [geometry]);

  const handleRecenterVessel = useCallback(() => {
    setCamera(createRecenterVesselCamera(geometry));
  }, [geometry]);

  const layerLabel =
    layerMode === 'all'
      ? tBoard('map.layers.all')
      : layerMode === 'route'
        ? tBoard('map.layers.route')
        : tBoard('map.layers.network');

  const handleToggleLayers = useCallback(() => {
    setLayerMode((current) => {
      if (current === 'all') return 'route';
      if (current === 'route') return 'network';
      return 'all';
    });
  }, []);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;

    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      camera,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;

    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;

    setCamera(
      mapPointerDeltaToCamera(
        dragState.current.camera,
        viewportSize.width,
        viewportSize.height,
        deltaX,
        deltaY,
      ),
    );
  };

  const endDrag = () => {
    dragState.current.active = false;
    setIsDragging(false);
  };

  return (
    <section className={styles.canvas} aria-label={tBoard('map.radarSectionAria')}>
      <div
        ref={viewportRef}
        className={cx(
          styles.canvasViewport,
          styles.canvasViewportInteractive,
          isDragging && styles.canvasViewportDragging,
        )}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        <svg
          className={styles.canvasSvg}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={tBoard('map.vesselTransit', {
            origin: geometry.origin.label,
            destination: geometry.destination.label,
          })}
        >
          <defs>
            <linearGradient id={`${svgUid}-grid`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(120, 170, 210, 0.08)" />
              <stop offset="100%" stopColor="rgba(47, 224, 208, 0.04)" />
            </linearGradient>
            <linearGradient id={`${svgUid}-corridor`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(47, 120, 180, 0.08)" />
              <stop offset="50%" stopColor="rgba(47, 224, 208, 0.16)" />
              <stop offset="100%" stopColor="rgba(47, 120, 180, 0.08)" />
            </linearGradient>
            <linearGradient id={`${svgUid}-route`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(47, 224, 208, 0.35)" />
              <stop offset="100%" stopColor="rgba(120, 210, 255, 0.85)" />
            </linearGradient>
            <linearGradient id={`${svgUid}-progress`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(47, 224, 208, 0.55)" />
              <stop offset="100%" stopColor="rgba(170, 255, 240, 0.95)" />
            </linearGradient>
            <radialGradient id={`${svgUid}-vessel-halo`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(47, 224, 208, 0.42)" />
              <stop offset="70%" stopColor="rgba(47, 224, 208, 0.12)" />
              <stop offset="100%" stopColor="rgba(47, 224, 208, 0)" />
            </radialGradient>
            <filter id={`${svgUid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            x="0"
            y="0"
            width={DESKTOP_MAP_VIEWBOX.width}
            height={DESKTOP_MAP_VIEWBOX.height}
            className={styles.canvasBackdrop}
          />

          <g className={styles.canvasGrid} aria-hidden>
            {Array.from({ length: 21 }, (_, index) => (
              <line
                key={`v-${index}`}
                x1={index * 80}
                y1="0"
                x2={index * 80}
                y2={DESKTOP_MAP_VIEWBOX.height}
              />
            ))}
            {Array.from({ length: 12 }, (_, index) => (
              <line
                key={`h-${index}`}
                x1="0"
                y1={index * 80}
                x2={DESKTOP_MAP_VIEWBOX.width}
                y2={index * 80}
              />
            ))}
          </g>

          <rect
            x="0"
            y="0"
            width={DESKTOP_MAP_VIEWBOX.width}
            height={DESKTOP_MAP_VIEWBOX.height}
            fill={`url(#${svgUid}-grid)`}
            opacity="0.35"
            aria-hidden
          />

          {showNetwork
            ? geometry.backgroundCorridors.map((corridor) => (
            <g key={corridor.id} aria-hidden>
              <path
                d={corridor.d}
                className={styles.corridorRibbon}
                fill="none"
                stroke={`url(#${svgUid}-corridor)`}
              />
              <path d={corridor.d} className={styles.corridorRibbonGlow} fill="none" />
              {corridor.label ? (
                <text
                  x={corridor.labelPoint.x}
                  y={corridor.labelPoint.y}
                  className={styles.corridorLabel}
                >
                  {corridor.label}
                </text>
              ) : null}
            </g>
              ))
            : null}

          {showRoute ? (
            <>
              <path d={geometry.routePathD} className={styles.routeTrack} fill="none" aria-hidden />

              <path
                d={geometry.traveledPathD}
                className={cx(styles.routeProgress, styles.routeProgressLive)}
                fill="none"
                stroke={`url(#${svgUid}-progress)`}
                filter={`url(#${svgUid}-glow)`}
                pathLength={100}
                aria-hidden
              />

              <path
                d={geometry.traveledPathD}
                className={cx(styles.routeActive, styles.routeActiveLive)}
                fill="none"
                stroke={`url(#${svgUid}-route)`}
                pathLength={100}
                aria-hidden
              />
            </>
          ) : null}

          {showNetwork
            ? labelCities.map((city) => (
            <g key={city.name} className={styles.cityMarker} aria-hidden>
              <circle cx={city.point.x} cy={city.point.y} r="5" className={styles.cityMarkerDot} />
              <circle cx={city.point.x} cy={city.point.y} r="1.8" className={styles.cityMarkerCore} />
              <text x={city.point.x + 10} y={city.point.y - 10} className={styles.cityLabel}>
                {city.name}
              </text>
            </g>
              ))
            : null}

          {showRoute ? (
            <>
          <g
            className={cx(styles.endpointOrigin, styles.endpointOriginLive)}
            transform={`translate(${geometry.origin.x} ${geometry.origin.y})`}
            aria-label={tBoard('map.originTitle', { location: geometry.origin.label })}
          >
            <circle r="22" className={styles.endpointOriginPulse} aria-hidden />
            <circle r="16" className={styles.endpointOriginRing} />
            <circle r="6.5" className={styles.endpointOriginCore} />
            <text x="18" y="-14" className={styles.endpointLabel}>
              {geometry.origin.label}
            </text>
          </g>

          <g
            className={cx(styles.endpointDestination, styles.endpointDestinationLive)}
            transform={`translate(${geometry.destination.x} ${geometry.destination.y})`}
            aria-label={tBoard('map.destinationTitle', { location: geometry.destination.label })}
          >
            <circle cy="2" r="20" className={styles.endpointDestinationPulse} aria-hidden />
            <path
              d="M0 -18 C-7 -8 -10 0 -10 8 C-10 14 -5 18 0 18 C5 18 10 14 10 8 C10 0 7 -8 0 -18 Z"
              className={styles.destinationPin}
            />
            <circle cy="6" r="3.2" className={styles.destinationPinCore} />
            <text x="16" y="-6" className={styles.endpointLabel}>
              {geometry.destination.label}
            </text>
          </g>

          <g
            className={cx(styles.vesselMarker, styles.vesselMarkerLive)}
            transform={`translate(${geometry.vessel.x} ${geometry.vessel.y}) rotate(${geometry.vessel.heading})`}
            aria-label={tBoard('map.vesselTransit', {
              origin: geometry.origin.label,
              destination: geometry.destination.label,
            })}
          >
            <circle r="34" className={styles.vesselPulseRing} aria-hidden />
            <circle r="28" fill={`url(#${svgUid}-vessel-halo)`} className={styles.vesselHalo} />
            <path d="M -16 4 L -6 10 L 14 10 L 18 4 L 14 -2 L -6 -2 Z" className={styles.vesselHull} />
            <path d="M -4 -8 L 0 -14 L 4 -8 Z" className={styles.vesselCabin} />
          </g>
            </>
          ) : null}
        </svg>

        {isDragging ? <div className={styles.canvasDragOverlay} aria-hidden /> : null}

        <DesktopCargoMapHud
          cargo={cargo}
          progressPercent={progressPercent}
          riverLabel={geometry.riverLabel}
          legendOpen={legendOpen}
          onLegendToggle={() => setLegendOpen((open) => !open)}
        />

        <DesktopCargoMapFloatingControls
          zoomPercent={zoomPercent}
          layerMode={layerMode}
          layerLabel={layerLabel}
          onToggleLayers={handleToggleLayers}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onFitRoute={handleFitRoute}
          onRecenterVessel={handleRecenterVessel}
        />
      </div>
    </section>
  );
}
