'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Anchor,
  ArrowLeft,
  Clock3,
  DollarSign,
  FileText,
  Leaf,
  MapPinned,
  Radio,
  Waves,
  X,
} from 'lucide-react';

import type { CargoWaterwayTrackingScenario } from '@/features/waterway-tracking';
import {
  formatCurrencyBRL,
  getOperationalStatusLabel,
  getRemainingProgressLabel,
  getRiskLabel,
} from '@/features/waterway-tracking';
import { useScreenTransitionNavigation } from '@/shared/ui/screen-transition';

import styles from './rastreio-cargo-detail.module.scss';

type Props = {
  locale: string;
  cargoId: string;
  trackingScenario: CargoWaterwayTrackingScenario;
};

type LayerId = 'eta' | 'waterway' | 'documents' | 'costs' | 'impact' | 'signal';
type PointId = 'origin' | 'vessel' | 'destination';

type LayerItem = {
  id: LayerId;
  label: string;
  value: string;
  description: string;
  Icon: LucideIcon;
};

type MapPoint = {
  id: PointId;
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
  ariaLabel: string;
  eyebrow: string;
  title: string;
  description: string;
};

const SVG_VIEWBOX_WIDTH = 430;
const SVG_VIEWBOX_HEIGHT = 932;

const BASE_MAP_POINTS = {
  origin: {
    x: 54,
    y: 622,
    xPercent: 12.56,
    yPercent: 66.74,
  },
  vessel: {
    x: 218,
    y: 430,
    xPercent: 50.7,
    yPercent: 46.14,
  },
  destination: {
    x: 362,
    y: 312,
    xPercent: 84.19,
    yPercent: 33.48,
  },
} as const;

const INTRO_POINT_SEQUENCE: ReadonlyArray<PointId> = ['origin', 'vessel', 'destination'];
const INTRO_INITIAL_DELAY_MS = 680;
const INTRO_STEP_DELAY_MS = 980;

const ROUTE_TRAVELLED_PATH =
  'M 54 622 C 90 590 122 560 150 524 C 176 490 194 452 218 430';

const ROUTE_REMAINING_PATH =
  'M 218 430 C 252 398 286 366 318 338 C 338 320 352 312 362 312';

const ROUTE_FULL_PATH =
  ROUTE_TRAVELLED_PATH + ' ' + ROUTE_REMAINING_PATH.replace('M 218 430', '');

const WATERWAY_PRIMARY_PATH =
  'M 38 728 C 86 692 132 662 168 620 C 206 574 230 504 280 452 C 320 410 350 394 392 366';

const WATERWAY_SECONDARY_PATH =
  'M 104 812 C 152 760 190 720 226 660 C 260 604 292 548 344 505';

const WATERWAY_TERTIARY_PATH =
  'M 42 248 C 92 302 156 304 218 274 C 276 244 326 172 386 104';

const WATERWAY_DASHED_PATH =
  'M 116 832 C 168 794 212 742 248 674 C 286 604 328 554 384 526';

const ROUTE_PATH_LENGTH = 100;

function clampPercent(value: number): number {
  return Math.max(0, Math.min(ROUTE_PATH_LENGTH, value));
}

function buildMapPoints(scenario: CargoWaterwayTrackingScenario): Record<PointId, MapPoint> {
  return {
    origin: {
      id: 'origin',
      ...BASE_MAP_POINTS.origin,
      ariaLabel: `Alternar descricao da origem ${scenario.route.origin.city}`,
      eyebrow: 'ORIGEM',
      title: `${scenario.route.origin.city}, ${scenario.route.origin.state}`,
      description: scenario.route.origin.description,
    },
    vessel: {
      id: 'vessel',
      ...BASE_MAP_POINTS.vessel,
      ariaLabel: `Alternar descricao da embarcacao ${scenario.vessel.name}`,
      eyebrow: 'EM TRANSITO',
      title: scenario.vessel.name,
      description: scenario.route.currentDescription,
    },
    destination: {
      id: 'destination',
      ...BASE_MAP_POINTS.destination,
      ariaLabel: `Alternar descricao do destino ${scenario.route.destination.city}`,
      eyebrow: 'DESTINO',
      title: `${scenario.route.destination.city}, ${scenario.route.destination.state}`,
      description: scenario.route.destination.description,
    },
  };
}

function buildLayerItems(scenario: CargoWaterwayTrackingScenario): LayerItem[] {
  const primaryConstraint = scenario.constraints[0];

  return [
    {
      id: 'eta',
      label: 'ETA',
      value: scenario.metrics.etaLabel,
      description: `${getOperationalStatusLabel(scenario.status)} · risco ${getRiskLabel(scenario.riskLevel).toLowerCase()}.`,
      Icon: Clock3,
    },
    {
     id: 'waterway',
      label: 'Hidrovia',
      value: scenario.map.secondaryRiverLabel,
      description: primaryConstraint
        ? `${primaryConstraint.title}: ${primaryConstraint.description}`
        : 'Corredor fluvial monitorado com referencias discretas.',
      Icon: Waves,
    },
    {
      id: 'documents',
      label: 'Documentos',
      value: `${scenario.metrics.documentsReadyPercent}%`,
      description: `Conferencia documental para ${scenario.cargoType}.`,
      Icon: FileText,
    },
    {
      id: 'costs',
      label: 'Custos',
      value: formatCurrencyBRL(scenario.metrics.estimatedCostBRL),
      description: `Prioridade ${scenario.priority} no corredor monitorado.`,
      Icon: DollarSign,
    },
    {
      id: 'impact',
      label: 'Impacto',
      value: `-${scenario.metrics.co2SavingsPercent}% CO2`,
      description: 'Estimativa comparativa de menor emissao pelo uso hidroviario.',
      Icon: Leaf,
    },
    {
      id: 'signal',
      label: 'Sinal',
      value: `${scenario.metrics.signalPercent}%`,
      description: 'Telemetria operacional da embarcacao durante o trecho.',
      Icon: Radio,
    },
  ];
}

export default function CargoMapImmersiveClient({
  locale,
  trackingScenario,
}: Props) {
  const { navigateWithTransition, prefetchScreen } = useScreenTransitionNavigation();
  const [activeLayer, setActiveLayer] = useState<LayerId>('eta');
  const [visiblePoints, setVisiblePoints] = useState<ReadonlyArray<PointId>>([]);

  useEffect(() => {
    document.documentElement.classList.add('hx-rastreio-immersive');
    document.body.classList.add('hx-rastreio-immersive');

    return () => {
      document.documentElement.classList.remove('hx-rastreio-immersive');
      document.body.classList.remove('hx-rastreio-immersive');
    };
  }, []);

  useEffect(() => {
    const introTimers = INTRO_POINT_SEQUENCE.map((pointId, index) => {
      return window.setTimeout(() => {
        setVisiblePoints((currentPoints) => {
          if (currentPoints.includes(pointId)) {
            return currentPoints;
          }

          return [...currentPoints, pointId];
        });
      }, INTRO_INITIAL_DELAY_MS + index * INTRO_STEP_DELAY_MS);
    });

    return () => {
      introTimers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [trackingScenario.cargoId]);

  const backHref = '/' + locale + '/cargas';
  const closeHref = '/' + locale + '/cargas';
  const routeProgressPercent = clampPercent(trackingScenario.metrics.progressPercent);
  const routeRemainingPercent = clampPercent(ROUTE_PATH_LENGTH - routeProgressPercent);
  const travelledDashArray = `${routeProgressPercent} ${ROUTE_PATH_LENGTH}`;
  const remainingDashArray = `${routeRemainingPercent} ${ROUTE_PATH_LENGTH}`;

  const mapPoints = useMemo(() => buildMapPoints(trackingScenario), [trackingScenario]);
  const layers = useMemo(() => buildLayerItems(trackingScenario), [trackingScenario]);

  const activeLayerData = useMemo(() => {
    return layers.find((layer) => layer.id === activeLayer) ?? layers[0];
  }, [activeLayer, layers]);

  const pointTagClassNames: Record<PointId, string> = {
    origin: [styles.mapTag, styles.originTag].join(' '),
    vessel: [styles.mapTag, styles.vesselTag].join(' '),
    destination: [styles.mapTag, styles.destinationTag].join(' '),
  };

  const togglePoint = (pointId: PointId) => {
    setVisiblePoints((currentPoints) => {
      if (currentPoints.includes(pointId)) {
        return currentPoints.filter((currentPoint) => currentPoint !== pointId);
      }

      return [...currentPoints, pointId];
    });
  };

  const remainingLabel = getRemainingProgressLabel(trackingScenario);
  const placeLabels = trackingScenario.map.placeLabels;

  useEffect(() => {
    prefetchScreen(backHref);
  }, [backHref, prefetchScreen]);

  return (
    <main
      className={styles.page}
      aria-label="Mapa imersivo de rastreio"
      data-remaining-label={remainingLabel}
    >
      <div className={styles.viewport}>
        <svg
          className={styles.routeCanvas}
          viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
          role="img"
          aria-label={`Mapa hidroviario da rota ${trackingScenario.route.origin.city} para ${trackingScenario.route.destination.city}`}
        >
          <defs>
            <linearGradient id="travelledRouteGradient" x1="54" y1="622" x2="218" y2="430">
              <stop offset="0%" stopColor="#7ff4e8" stopOpacity="0.9" />
              <stop offset="62%" stopColor="#d9fffa" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#82f3e8" stopOpacity="0.98" />
            </linearGradient>

            <linearGradient id="remainingRouteGradient" x1="218" y1="430" x2="362" y2="312">
              <stop offset="0%" stopColor="#7ff4e8" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#ffcc6a" stopOpacity="0.48" />
            </linearGradient>

            <filter id="routeSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect className={styles.svgBackground} x="0" y="0" width="430" height="932" />

          <path d={WATERWAY_TERTIARY_PATH} className={styles.waterwayTertiaryPath} />
          <path d={WATERWAY_PRIMARY_PATH} className={styles.waterwaySecondaryPath} />
          <path d={WATERWAY_SECONDARY_PATH} className={styles.waterwaySecondaryPathMuted} />
          <path d={WATERWAY_DASHED_PATH} className={styles.waterwayDashedPath} />

          <text x="232" y="384" className={styles.mapLabelStrong}>
            {trackingScenario.map.primaryRiverLabel}
          </text>
          <text x="178" y="594" className={styles.mapLabelStrong}>
            {trackingScenario.map.secondaryRiverLabel}
          </text>
          <text x="70" y="724" className={styles.mapLabel}>
            {placeLabels[0] ?? 'ORIGEM'}
          </text>
          <text x="302" y="392" className={styles.mapLabel}>
            {placeLabels[1] ?? 'DESTINO'}
          </text>
          <text x="232" y="506" className={styles.mapLabel}>
            {placeLabels[2] ?? 'CHECKPOINT'}
          </text>
          <text x="278" y="350" className={styles.mapLabel}>
            {placeLabels[3] ?? 'TERMINAL'}
          </text>
          <text x="178" y="654" className={styles.mapLabel}>
            {placeLabels[4] ?? 'CORREDOR'}
          </text>
          <text x="110" y="808" className={styles.mapLabelRotated}>
            {trackingScenario.title}
          </text>

          <circle cx="246" cy="842" r="3" className={styles.portDot} />
          <circle cx="322" cy="384" r="2.6" className={styles.portDotMuted} />
          <circle cx="224" cy="506" r="2.4" className={styles.portDotMuted} />

          <path d={ROUTE_FULL_PATH} className={styles.routeUnderlayPath} />
          <path
            d={ROUTE_FULL_PATH}
            className={styles.routeRemainingPath}
            pathLength={ROUTE_PATH_LENGTH}
            style={{
              strokeDasharray: remainingDashArray,
              strokeDashoffset: `${-routeProgressPercent}`,
            }}
          />
          <path
            d={ROUTE_FULL_PATH}
            className={styles.routeTravelledPath}
            pathLength={ROUTE_PATH_LENGTH}
            style={{ strokeDasharray: travelledDashArray }}
          />
          <path
            d={ROUTE_FULL_PATH}
            className={styles.routeFlowPath}
            pathLength={ROUTE_PATH_LENGTH}
            style={{ strokeDasharray: travelledDashArray }}
          />

          <g className={styles.originMarker} transform={`translate(${mapPoints.origin.x} ${mapPoints.origin.y})`}>
            <circle r="17" className={styles.originPulse} />
            <circle r="9" className={styles.originRing} />
            <circle r="5.5" className={styles.originCore} />
          </g>

          <g
            className={styles.destinationMarker}
            transform={`translate(${mapPoints.destination.x} ${mapPoints.destination.y})`}
          >
            <circle r="17" className={styles.destinationPulse} />
            <circle r="9" className={styles.destinationRing} />
            <circle r="5.5" className={styles.destinationCore} />
          </g>

          <g className={styles.vesselMarker} transform={`translate(${mapPoints.vessel.x} ${mapPoints.vessel.y}) rotate(-42)`}>
            <circle r="44" className={styles.vesselRadarHalo} />
            <circle r="32" className={styles.vesselRadarRing} />
            <circle r="22" className={styles.vesselMarkerCore} />
            <g className={styles.vesselIcon}>
              <path d="M -12 4 L -7 13 H 8 L 13 4 Z" />
              <path d="M -5 4 V -10 H 4 L 9 4" />
              <path d="M -10 16 C -6 14 -1 18 3 16 C 7 14 10 16 13 15" />
              <path d="M -2 -4 H 5" />
            </g>
          </g>
        </svg>

        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Voltar para lista de cargas"
            onClick={() => navigateWithTransition(backHref)}
          >
            <ArrowLeft aria-hidden />
          </button>

          <div className={styles.statusCapsule}>
            <span>{getOperationalStatusLabel(trackingScenario.status).toUpperCase()}</span>
            <strong>{trackingScenario.cargoId}</strong>
          </div>

          <button
            type="button"
            className={styles.iconButton}
            aria-label="Fechar mapa e voltar para lista de cargas"
            onClick={() => navigateWithTransition(closeHref)}
          >
            <X aria-hidden />
          </button>
        </div>

        <aside className={styles.activeHud} role="status" aria-live="polite">
          <span className={styles.hudEyebrow}>{activeLayerData.label}</span>
          <strong className={styles.hudValue}>{activeLayerData.value}</strong>
          <p className={styles.hudDescription}>{activeLayerData.description}</p>
        </aside>

        <nav className={styles.sideRail} aria-label="Acoes do mapa">
          {layers.map((layer) => {
            const Icon = layer.Icon;
            const isActive = layer.id === activeLayer;
            const buttonClassName = [
              styles.railButton,
              isActive ? styles.railButtonActive : '',
            ]
              .filter(Boolean)
              .join(' ');
            const label = layer.label + ': ' + layer.value;

            return (
              <button
                key={layer.id}
                type="button"
                className={buttonClassName}
                onClick={() => setActiveLayer(layer.id)}
                aria-pressed={isActive}
                aria-label={label}
                title={label}
              >
                <Icon aria-hidden />
              </button>
            );
          })}
        </nav>

        {Object.values(mapPoints).map((point) => {
          return (
            <button
              key={point.id}
              type="button"
              className={styles.mapHitbox}
              style={{ left: `${point.xPercent}%`, top: `${point.yPercent}%` }}
              onClick={() => togglePoint(point.id)}
              aria-label={point.ariaLabel}
            />
          );
        })}

        {visiblePoints.map((pointId) => {
          const pointData = mapPoints[pointId];

          return (
            <div key={pointId} className={pointTagClassNames[pointId]}>
              <span>{pointData.eyebrow}</span>
              <strong>{pointData.title}</strong>
              <small className={styles.mapTagDescription}>{pointData.description}</small>
            </div>
          );
        })}

        <footer className={styles.bottomHud} aria-label="Resumo da rota">
          <div className={styles.bottomHeader}>
            <span className={styles.bottomEyebrow}>VISAO GERAL</span>
            <strong className={styles.bottomTitle}>
              {trackingScenario.route.origin.city} para {trackingScenario.route.destination.city}
            </strong>
          </div>

          <div className={styles.bottomMeta}>
            <span className={styles.metaItem}>
              <Anchor aria-hidden />
              ETA {trackingScenario.metrics.etaLabel}
            </span>

            <span className={styles.metaItem}>
              <MapPinned aria-hidden />
              {trackingScenario.metrics.distanceKm} km via hidrovia
            </span>

            <span className={styles.metaItem}>
              <Radio aria-hidden />
              Sinal {trackingScenario.metrics.signalPercent}%
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
