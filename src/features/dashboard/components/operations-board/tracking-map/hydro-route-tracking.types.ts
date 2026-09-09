/**
 * Contrato de dados para rastreamento hidroviário (esquemático no viewBox do mapa).
 * `coordinates` usam o mesmo espaço do SVG interno (ex.: 0–1000 × 0–470), não WGS84.
 * Em uma etapa futura, uma camada de projeção pode converter WGS84 → viewBox.
 */

export type TrackingStatus =
  | 'planned'
  | 'inTransit'
  | 'inOperation'
  | 'delayed'
  | 'completed';

export type TrackingPointType =
  | 'origin'
  | 'destination'
  | 'port'
  | 'checkpoint'
  | 'vessel';

export type TrackingPoint = {
  id: string;
  label: string;
  type: TrackingPointType;
  /** Par [x, y] no espaço esquemático do mapa (viewBox). */
  coordinates: [number, number];
  status?: TrackingStatus;
};

/** Referência a um ponto da rota para o resumo “próximo trecho” (sem texto livre). */
export type NextMonitoredEndpoint =
  | { kind: 'origin' }
  | { kind: 'destination' }
  | { kind: 'checkpoint'; index: 0 | 1 };

/**
 * Próximo trecho em foco após a posição atual (derivado de forma determinística).
 * A UI traduz `from`/`to` com i18n para checkpoints.
 */
export type NextMonitoredSegment = {
  /** Hidrovia / corredor exibido na linha principal. */
  primaryRiver: string;
  from: NextMonitoredEndpoint;
  to: NextMonitoredEndpoint;
};

export type TrackingRoute = {
  id: string;
  cargoId: string;
  cargoLabel: string;
  origin: TrackingPoint;
  destination: TrackingPoint;
  currentPosition: TrackingPoint;
  corridor: string;
  river: string;
  /** Progresso ao longo do trajeto, 0–100 (determinístico a partir do status mock). */
  progress: number;
  distanceKm?: number;
  eta?: string;
  status: TrackingStatus;
  checkpoints: TrackingPoint[];
  /** Polilinha densa ao longo da curva esquemática (amostragem fixa). */
  path: Array<[number, number]>;
  /** Orientação esquemática do ícone da embarcação (graus), derivada da tangente da rota. */
  vesselHeadingDeg?: number;
  /** Próximo trecho monitorado (par de waypoints após a embarcação ao longo do path). */
  nextMonitored: NextMonitoredSegment;
};
