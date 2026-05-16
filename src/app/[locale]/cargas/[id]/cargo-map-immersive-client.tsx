'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { appRoutes } from '@/shared/routing/app-routes';
import type { AppLocale } from '@/shared/routing/route-types';
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

const INTRO_POINT_SEQUENCE: ReadonlyArray<PointId> = ['origin', 'vessel', 'destination'];
const INTRO_INITIAL_DELAY_MS = 680;
const INTRO_STEP_DELAY_MS = 980;

const ROUTE_PATH_LENGTH = 100;

type RouteLayout = {
  destinationLabel: { x: number; y: number };
  originLabel: { x: number; y: number };
  points: Record<PointId, Omit<MapPoint, 'ariaLabel' | 'description' | 'eyebrow' | 'id' | 'title'>>;
  routeFullPath: string;
  routeTitle: { x: number; y: number };
  waterwayDashedPath: string;
  waterwayPrimaryPath: string;
  waterwaySecondaryPath: string;
  waterwayTertiaryPath: string;
};

const ROUTE_LAYOUTS: Record<string, RouteLayout> = {
  amazonas: {
    points: {
      origin: { x: 54, y: 622, xPercent: 12.56, yPercent: 66.74 },
      vessel: { x: 218, y: 430, xPercent: 50.7, yPercent: 46.14 },
      destination: { x: 362, y: 312, xPercent: 84.19, yPercent: 33.48 },
    },
    routeFullPath:
      'M 54 622 C 90 590 122 560 150 524 C 176 490 194 452 218 430 C 252 398 286 366 318 338 C 338 320 352 312 362 312',
    waterwayPrimaryPath:
      'M 38 728 C 86 692 132 662 168 620 C 206 574 230 504 280 452 C 320 410 350 394 392 366',
    waterwaySecondaryPath:
      'M 104 812 C 152 760 190 720 226 660 C 260 604 292 548 344 505',
    waterwayTertiaryPath:
      'M 42 248 C 92 302 156 304 218 274 C 276 244 326 172 386 104',
    waterwayDashedPath:
      'M 116 832 C 168 794 212 742 248 674 C 286 604 328 554 384 526',
    originLabel: { x: 70, y: 724 },
    destinationLabel: { x: 302, y: 392 },
    routeTitle: { x: 110, y: 808 },
  },
  madeira: {
    points: {
      origin: { x: 78, y: 728, xPercent: 18.14, yPercent: 78.11 },
      vessel: { x: 176, y: 506, xPercent: 40.93, yPercent: 54.29 },
      destination: { x: 330, y: 278, xPercent: 76.74, yPercent: 29.83 },
    },
    routeFullPath:
      'M 78 728 C 96 680 124 620 150 564 C 164 536 170 522 176 506 C 206 454 242 398 276 350 C 300 316 318 292 330 278',
    waterwayPrimaryPath:
      'M 70 832 C 96 774 118 704 136 632 C 154 560 170 520 204 466 C 230 422 270 360 330 278',
    waterwaySecondaryPath:
      'M 34 684 C 74 650 108 604 136 548 C 160 500 188 438 236 376',
    waterwayTertiaryPath:
      'M 188 814 C 220 760 250 700 286 644 C 320 592 350 542 392 498',
    waterwayDashedPath:
      'M 44 606 C 96 580 136 526 160 470 C 192 398 236 332 310 254',
    originLabel: { x: 46, y: 812 },
    destinationLabel: { x: 276, y: 338 },
    routeTitle: { x: 164, y: 842 },
  },
  'tapajos-teles-pires': {
    points: {
      origin: { x: 84, y: 666, xPercent: 19.53, yPercent: 71.46 },
      vessel: { x: 222, y: 488, xPercent: 51.63, yPercent: 52.36 },
      destination: { x: 350, y: 244, xPercent: 81.4, yPercent: 26.18 },
    },
    routeFullPath:
      'M 84 666 C 128 642 162 604 188 552 C 204 520 212 504 222 488 C 248 438 280 382 312 326 C 330 292 342 262 350 244',
    waterwayPrimaryPath:
      'M 44 716 C 94 682 132 630 174 572 C 212 522 244 456 292 390 C 320 352 340 306 366 218',
    waterwaySecondaryPath:
      'M 126 842 C 170 780 202 724 230 654 C 256 588 286 526 340 432',
    waterwayTertiaryPath:
      'M 34 286 C 88 320 144 322 202 304 C 258 286 310 238 382 136',
    waterwayDashedPath:
      'M 72 784 C 132 744 178 692 214 622 C 246 558 284 500 352 402',
    originLabel: { x: 68, y: 758 },
    destinationLabel: { x: 288, y: 306 },
    routeTitle: { x: 112, y: 828 },
  },
  'tocantins-araguaia': {
    points: {
      origin: { x: 86, y: 694, xPercent: 20, yPercent: 74.46 },
      vessel: { x: 246, y: 476, xPercent: 57.21, yPercent: 51.07 },
      destination: { x: 356, y: 226, xPercent: 82.79, yPercent: 24.25 },
    },
    routeFullPath:
      'M 86 694 C 120 654 154 610 190 566 C 214 536 230 504 246 476 C 278 422 306 366 330 306 C 342 276 350 248 356 226',
    waterwayPrimaryPath:
      'M 58 776 C 108 734 154 690 192 634 C 228 584 264 516 300 438 C 332 370 352 308 372 190',
    waterwaySecondaryPath:
      'M 118 840 C 164 782 206 724 244 658 C 286 586 320 506 372 394',
    waterwayTertiaryPath:
      'M 32 326 C 98 330 154 312 210 270 C 268 230 322 168 392 66',
    waterwayDashedPath:
      'M 84 748 C 132 710 174 658 214 596 C 254 532 294 466 352 356',
    originLabel: { x: 58, y: 784 },
    destinationLabel: { x: 290, y: 274 },
    routeTitle: { x: 108, y: 842 },
  },
  'barra-norte': {
    points: {
      origin: { x: 58, y: 564, xPercent: 13.49, yPercent: 60.51 },
      vessel: { x: 210, y: 392, xPercent: 48.84, yPercent: 42.06 },
      destination: { x: 360, y: 282, xPercent: 83.72, yPercent: 30.26 },
    },
    routeFullPath:
      'M 58 564 C 98 540 132 508 164 462 C 184 434 198 412 210 392 C 250 360 286 332 320 308 C 340 294 352 286 360 282',
    waterwayPrimaryPath:
      'M 30 646 C 90 610 140 570 182 522 C 224 474 270 408 330 338 C 350 314 368 286 394 248',
    waterwaySecondaryPath:
      'M 86 742 C 134 700 176 648 214 594 C 248 544 286 486 350 396',
    waterwayTertiaryPath:
      'M 42 202 C 106 242 168 250 228 232 C 290 214 340 176 392 106',
    waterwayDashedPath:
      'M 124 812 C 172 770 220 712 258 650 C 300 582 338 526 390 468',
    originLabel: { x: 66, y: 658 },
    destinationLabel: { x: 300, y: 350 },
    routeTitle: { x: 94, y: 760 },
  },
};

function clampPercent(value: number): number {
  return Math.max(0, Math.min(ROUTE_PATH_LENGTH, value));
}

function getRouteLayout(scenario: CargoWaterwayTrackingScenario): RouteLayout {
  return ROUTE_LAYOUTS[scenario.corridorId] ?? ROUTE_LAYOUTS.amazonas;
}

function buildMapPoints(
  scenario: CargoWaterwayTrackingScenario,
  layout: RouteLayout,
): Record<PointId, MapPoint> {
  return {
    origin: {
      id: 'origin',
      ...layout.points.origin,
      ariaLabel: `Alternar descricao da origem ${scenario.route.origin.city}`,
      eyebrow: 'ORIGEM',
      title: `${scenario.route.origin.city}, ${scenario.route.origin.state}`,
      description: scenario.route.origin.description,
    },
    vessel: {
      id: 'vessel',
      ...layout.points.vessel,
      ariaLabel: `Alternar descricao da embarcacao ${scenario.vessel.name}`,
      eyebrow: 'EM TRANSITO',
      title: scenario.vessel.name,
      description: scenario.route.currentDescription,
    },
    destination: {
      id: 'destination',
      ...layout.points.destination,
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
  const router = useRouter();
  const { prefetchScreen } = useScreenTransitionNavigation();
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

  const cargoesHref = `/${locale}/cargas`;
  const routeProgressPercent = clampPercent(trackingScenario.metrics.progressPercent);
  const routeRemainingPercent = clampPercent(ROUTE_PATH_LENGTH - routeProgressPercent);
  const travelledDashArray = `${routeProgressPercent} ${ROUTE_PATH_LENGTH}`;
  const remainingDashArray = `${routeRemainingPercent} ${ROUTE_PATH_LENGTH}`;
  const routeLayout = useMemo(() => getRouteLayout(trackingScenario), [trackingScenario]);
  const mapPoints = useMemo(
    () => buildMapPoints(trackingScenario, routeLayout),
    [routeLayout, trackingScenario],
  );
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
  const operationalStatusLabel = getOperationalStatusLabel(
    trackingScenario.operationalStatus ?? trackingScenario.status,
  );
  const placeLabels = trackingScenario.map.placeLabels ?? [];

  const handleReturnToCargoes = () => {
    router.replace(cargoesHref);
  };

  useEffect(() => {
    prefetchScreen(cargoesHref);
  }, [cargoesHref, prefetchScreen]);

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

          <path d={routeLayout.waterwayTertiaryPath} className={styles.waterwayTertiaryPath} />
          <path d={routeLayout.waterwayPrimaryPath} className={styles.waterwaySecondaryPath} />
          <path d={routeLayout.waterwaySecondaryPath} className={styles.waterwaySecondaryPathMuted} />
          <path d={routeLayout.waterwayDashedPath} className={styles.waterwayDashedPath} />

          <text x="232" y="384" className={styles.mapLabelStrong}>
            {trackingScenario.map.primaryRiverLabel}
          </text>
          <text x="178" y="594" className={styles.mapLabelStrong}>
            {trackingScenario.map.secondaryRiverLabel}
          </text>
          <text x={routeLayout.originLabel.x} y={routeLayout.originLabel.y} className={styles.mapLabel}>
            {placeLabels[0] ?? 'ORIGEM'}
          </text>
          <text x={routeLayout.destinationLabel.x} y={routeLayout.destinationLabel.y} className={styles.mapLabel}>
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
          <text x={routeLayout.routeTitle.x} y={routeLayout.routeTitle.y} className={styles.mapLabelRotated}>
            {trackingScenario.title}
          </text>

          <circle cx="246" cy="842" r="3" className={styles.portDot} />
          <circle cx="322" cy="384" r="2.6" className={styles.portDotMuted} />
          <circle cx="224" cy="506" r="2.4" className={styles.portDotMuted} />

          <path d={routeLayout.routeFullPath} className={styles.routeUnderlayPath} />
          <path
            d={routeLayout.routeFullPath}
            className={styles.routeRemainingPath}
            pathLength={ROUTE_PATH_LENGTH}
            style={{
              strokeDasharray: remainingDashArray,
              strokeDashoffset: `${-routeProgressPercent}`,
            }}
          />
          <path
            d={routeLayout.routeFullPath}
            className={styles.routeTravelledPath}
            pathLength={ROUTE_PATH_LENGTH}
            style={{ strokeDasharray: travelledDashArray }}
          />
          <path
            d={routeLayout.routeFullPath}
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
            onClick={handleReturnToCargoes}
          >
            <ArrowLeft aria-hidden />
          </button>

          <div className={styles.statusCapsule}>
            <span>{operationalStatusLabel.toUpperCase()}</span>
            <strong>{trackingScenario.cargoId}</strong>
          </div>

          <button
            type="button"
            className={styles.iconButton}
            aria-label="Fechar mapa e voltar para lista de cargas"
            onClick={handleReturnToCargoes}
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
