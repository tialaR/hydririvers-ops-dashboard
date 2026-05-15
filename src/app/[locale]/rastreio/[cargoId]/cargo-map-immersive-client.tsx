'use client';

import Link from 'next/link';
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

import styles from './rastreio-cargo-detail.module.scss';

type Props = {
  locale: string;
  cargoId: string;
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

const MAP_POINTS: Record<PointId, MapPoint> = {
  origin: {
    id: 'origin',
    x: 54,
    y: 622,
    xPercent: 12.56,
    yPercent: 66.74,
    ariaLabel: 'Alternar descricao da origem Belem',
    eyebrow: 'ORIGEM',
    title: 'Belem, PA',
    description: 'Coleta confirmada no terminal de origem.',
  },
  vessel: {
    id: 'vessel',
    x: 218,
    y: 430,
    xPercent: 50.7,
    yPercent: 46.14,
    ariaLabel: 'Alternar descricao da embarcacao em transito',
    eyebrow: 'EM TRANSITO',
    title: 'Barcaca Hydro-27',
    description: 'Barcaca em navegacao com telemetria ativa.',
  },
  destination: {
    id: 'destination',
    x: 362,
    y: 312,
    xPercent: 84.19,
    yPercent: 33.48,
    ariaLabel: 'Alternar descricao do destino Santarem',
    eyebrow: 'DESTINO',
    title: 'Santarem, PA',
    description: 'Atracacao prevista no terminal de Santarem.',
  },
};

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

const LAYERS: LayerItem[] = [
  {
    id: 'eta',
    label: 'ETA',
    value: '06h40',
    description: 'Janela estimada de atracacao dentro do previsto.',
    Icon: Clock3,
  },
  {
    id: 'waterway',
    label: 'Hidrovia',
    value: 'Amazonas + Tapajos',
    description: 'Corredor fluvial monitorado com referencias discretas.',
    Icon: Waves,
  },
  {
    id: 'documents',
    label: 'Documentos',
    value: '4 / 18',
    description: 'Pendencias operacionais sob controle.',
    Icon: FileText,
  },
  {
    id: 'costs',
    label: 'Custos',
    value: 'R$ 13.050',
    description: 'Margem estimada em 18% para a operacao.',
    Icon: DollarSign,
  },
  {
    id: 'impact',
    label: 'Impacto',
    value: '-60% CO2',
    description: 'Operacao fluvial com menor emissao versus rodoviario.',
    Icon: Leaf,
  },
  {
    id: 'signal',
    label: 'Sinal',
    value: '97%',
    description: 'Telemetria estavel e baixa perda de pacote.',
    Icon: Radio,
  },
];

export default function CargoMapImmersiveClient({ locale, cargoId }: Props) {
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
  }, []);

  const safeCargoId = cargoId || 'CARGO-001';
  const backHref = '/' + locale + '/cargas/' + encodeURIComponent(safeCargoId);
  const closeHref = '/' + locale + '/rastreio';

  const activeLayerData = useMemo(() => {
    return LAYERS.find((layer) => layer.id === activeLayer) ?? LAYERS[0];
  }, [activeLayer]);

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

  return (
    <main className={styles.page} aria-label="Mapa imersivo de rastreio">
      <div className={styles.viewport}>
        <svg
          className={styles.routeCanvas}
          viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
          role="img"
          aria-label="Mapa hidroviario da rota Belem para Santarem"
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
            RIO TAPAJOS
          </text>
          <text x="178" y="594" className={styles.mapLabelStrong}>
            RIO AMAZONAS
          </text>
          <text x="70" y="724" className={styles.mapLabel}>
            BELEM
          </text>
          <text x="302" y="392" className={styles.mapLabel}>
            SANTAREM
          </text>
          <text x="232" y="506" className={styles.mapLabel}>
            OBIDOS
          </text>
          <text x="278" y="350" className={styles.mapLabel}>
            ALMEIRIM
          </text>
          <text x="178" y="654" className={styles.mapLabel}>
            MONTE ALEGRE
          </text>
          <text x="110" y="808" className={styles.mapLabelRotated}>
            CANAL NORTE
          </text>
          <text x="82" y="842" className={styles.mapLabel}>
            PORTO HIDROVIARIO
          </text>
          <text x="266" y="682" className={styles.mapLabel}>
            CORREDOR NORTE
          </text>

          <circle cx="246" cy="842" r="3" className={styles.portDot} />
          <circle cx="322" cy="384" r="2.6" className={styles.portDotMuted} />
          <circle cx="224" cy="506" r="2.4" className={styles.portDotMuted} />

          <path d={ROUTE_FULL_PATH} className={styles.routeUnderlayPath} />
          <path d={ROUTE_REMAINING_PATH} className={styles.routeRemainingPath} pathLength={100} />
          <path d={ROUTE_TRAVELLED_PATH} className={styles.routeTravelledPath} pathLength={100} />
          <path d={ROUTE_FULL_PATH} className={styles.routeFlowPath} pathLength={100} />

          <g className={styles.originMarker} transform={`translate(${MAP_POINTS.origin.x} ${MAP_POINTS.origin.y})`}>
            <circle r="17" className={styles.originPulse} />
            <circle r="9" className={styles.originRing} />
            <circle r="5.5" className={styles.originCore} />
          </g>

          <g
            className={styles.destinationMarker}
            transform={`translate(${MAP_POINTS.destination.x} ${MAP_POINTS.destination.y})`}
          >
            <circle r="17" className={styles.destinationPulse} />
            <circle r="9" className={styles.destinationRing} />
            <circle r="5.5" className={styles.destinationCore} />
          </g>

          <g className={styles.vesselMarker} transform={`translate(${MAP_POINTS.vessel.x} ${MAP_POINTS.vessel.y}) rotate(-42)`}>
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
          <Link href={backHref} className={styles.iconButton} aria-label="Voltar para a carga">
            <ArrowLeft aria-hidden />
          </Link>

          <div className={styles.statusCapsule}>
            <span>EM TRANSITO</span>
            <strong>{safeCargoId}</strong>
          </div>

          <Link href={closeHref} className={styles.iconButton} aria-label="Fechar mapa">
            <X aria-hidden />
          </Link>
        </div>

        <aside className={styles.activeHud} role="status" aria-live="polite">
          <span className={styles.hudEyebrow}>{activeLayerData.label}</span>
          <strong className={styles.hudValue}>{activeLayerData.value}</strong>
          <p className={styles.hudDescription}>{activeLayerData.description}</p>
        </aside>

        <nav className={styles.sideRail} aria-label="Acoes do mapa">
          {LAYERS.map((layer) => {
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

        {Object.values(MAP_POINTS).map((point) => {
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
          const pointData = MAP_POINTS[pointId];

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
            <strong className={styles.bottomTitle}>Belem para Santarem</strong>
          </div>

          <div className={styles.bottomMeta}>
            <span className={styles.metaItem}>
              <Anchor aria-hidden />
              ETA 06h40
            </span>

            <span className={styles.metaItem}>
              <MapPinned aria-hidden />
              804 km via Amazonas
            </span>

            <span className={styles.metaItem}>
              <Radio aria-hidden />
              Sinal 97%
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
