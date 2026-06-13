import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import { resolveOwnedCargoProgress } from '@/features/cargo/domain/summarize-owned-cargoes';

export type OwnedCargoPreviewPanel = 'map' | 'timeline' | 'documents' | 'risks';

export type OwnedCargoPreviewState = 'available' | 'empty' | 'unavailable' | 'attention';

export type OwnedCargoOperationalMetricKey = 'window' | 'progress' | 'cargoType' | 'pending';

export type OwnedCargoOperationalMetric = {
  key: OwnedCargoOperationalMetricKey;
  value: string;
  /** Texto mock traduzível no componente (pendência/risco). */
  mockValue?: string;
};

export type OwnedCargoMapPreview = {
  state: 'available' | 'unavailable';
  routeLabel: string;
  progressPercent: number;
  checkpointLabel: string;
};

export type OwnedCargoTimelinePreview = {
  state: 'available' | 'empty';
  eventCount: number;
  nextEventMock: string | null;
};

export type OwnedCargoDocumentsPreview = {
  state: 'available' | 'empty';
  totalCount: number;
  pendingCount: number;
  readinessPercent: number;
  topPendingName: string | null;
};

export type OwnedCargoRisksPreview = {
  state: 'clear' | 'attention' | 'empty';
  count: number;
  primaryRiskMock: string | null;
};

export type OwnedCargoStatusCardData = {
  progressPercent: number;
  currentStepMock: string | null;
  primaryAlertMock: string | null;
  windowLabel: string;
  etaLabel: string | null;
};

export type OwnedCargoSupportCardKey = 'volume' | 'window' | 'corridor' | 'operation' | 'co2';

export type OwnedCargoSupportCard = {
  key: OwnedCargoSupportCardKey;
  value: string;
};

export type OwnedCargoTimelineEventPhase = 'done' | 'current' | 'upcoming';

export type OwnedCargoTimelineEvent = {
  id: string;
  labelMock: string;
  phase: OwnedCargoTimelineEventPhase;
};

export type OwnedCargoDocumentItem = {
  name: string;
  status: 'required' | 'conditional' | 'nextPhase' | 'ok';
  note?: string;
};

export type OwnedCargoRiskItem = {
  id: string;
  labelMock: string;
  severity: 'low' | 'medium' | 'high';
};

/** Valores estáveis para `?panel=` na fase E. */
export const OWNED_CARGO_PANEL_TARGETS = ['map', 'timeline', 'documents', 'risks'] as const;

export type OwnedCargoDetailDerivation = {
  progress: number;
  metrics: OwnedCargoOperationalMetric[];
  statusCard: OwnedCargoStatusCardData;
  supportCards: OwnedCargoSupportCard[];
  map: OwnedCargoMapPreview;
  timeline: OwnedCargoTimelinePreview;
  timelineEvents: OwnedCargoTimelineEvent[];
  documents: OwnedCargoDocumentsPreview;
  documentItems: OwnedCargoDocumentItem[];
  risks: OwnedCargoRisksPreview;
  riskItems: OwnedCargoRiskItem[];
  showTrackAction: boolean;
  showNegotiateAction: boolean;
  showUpdateStatusAction: boolean;
  showObservationAction: boolean;
  showOpenDocumentsAction: boolean;
};

/** Progresso de rota estimado por status operacional (mock determinístico). */
export const OWNED_CARGO_MAP_PROGRESS_BY_STATUS: Record<CargoStatus, number> = {
  open: 8,
  bidding: 18,
  contracting: 32,
  reserved: 48,
  boarded: 72,
  delivered: 100,
};

/** Contagem de eventos de timeline derivada por status (sem inventar feed completo). */
export const OWNED_CARGO_TIMELINE_EVENT_COUNT_BY_STATUS: Record<CargoStatus, number> = {
  open: 1,
  bidding: 2,
  contracting: 3,
  reserved: 4,
  boarded: 6,
  delivered: 8,
};

/** Rótulos mock determinísticos por marco operacional (traduzíveis via translateMock). */
export const OWNED_CARGO_TIMELINE_EVENT_MOCKS: readonly string[] = [
  'Carga registrada na operação',
  'Publicação ativa · aguardando propostas',
  'Negociação com transportadoras',
  'Reserva confirmada · preparando embarque',
  'Coleta confirmada na origem',
  'Embarque iniciado · em trânsito fluvial',
  'Checkpoint intermediário registrado',
  'Entrega concluída · documentos arquivados',
];

function resolveRouteLabel(cargo: Cargo): string {
  if (cargo.riverRoute?.trim()) return cargo.riverRoute.trim();
  if (cargo.corridor?.trim()) return cargo.corridor.trim();
  return `${cargo.origin} → ${cargo.destination}`;
}

function resolveCheckpointLabel(cargo: Cargo): string {
  if (cargo.status === 'delivered') return cargo.destination;
  if (cargo.status === 'boarded') return cargo.origin;
  if (cargo.status === 'reserved' || cargo.status === 'contracting') return cargo.origin;
  return cargo.origin;
}

function countDocuments(cargo: Cargo): { total: number; pending: number; topPending: string | null } {
  const docs = cargo.requiredDocuments ?? [];
  if (!docs.length) {
    return { total: 0, pending: 0, topPending: null };
  }

  const pending = docs.filter((doc) => doc.status === 'required' || doc.status === 'conditional');
  return {
    total: docs.length,
    pending: pending.length,
    topPending: pending[0]?.name ?? null,
  };
}

function resolvePendingMetric(cargo: Cargo): OwnedCargoOperationalMetric {
  const risks = cargo.operationalRisks ?? [];
  if (risks.length > 0) {
    return { key: 'pending', value: risks[0]!, mockValue: risks[0]! };
  }

  if (cargo.documentsStatusSummary?.trim()) {
    return { key: 'pending', value: cargo.documentsStatusSummary, mockValue: cargo.documentsStatusSummary };
  }

  if (typeof cargo.proposalsCount === 'number' && cargo.proposalsCount > 0) {
    return { key: 'pending', value: String(cargo.proposalsCount) };
  }

  return { key: 'pending', value: '—' };
}

export function deriveOwnedCargoMapPreview(cargo: Cargo): OwnedCargoMapPreview {
  const routeLabel = resolveRouteLabel(cargo);
  const hasRoute = Boolean(routeLabel.trim());

  if (!hasRoute) {
    return {
      state: 'unavailable',
      routeLabel: '',
      progressPercent: 0,
      checkpointLabel: cargo.origin,
    };
  }

  return {
    state: 'available',
    routeLabel,
    progressPercent: OWNED_CARGO_MAP_PROGRESS_BY_STATUS[cargo.status],
    checkpointLabel: resolveCheckpointLabel(cargo),
  };
}

export function deriveOwnedCargoTimelinePreview(cargo: Cargo): OwnedCargoTimelinePreview {
  const eventCount = OWNED_CARGO_TIMELINE_EVENT_COUNT_BY_STATUS[cargo.status];
  const nextEventMock = cargo.operationalNextStep?.trim() ? cargo.operationalNextStep : null;

  if (eventCount <= 0 && !nextEventMock) {
    return { state: 'empty', eventCount: 0, nextEventMock: null };
  }

  return {
    state: 'available',
    eventCount,
    nextEventMock,
  };
}

export function deriveOwnedCargoDocumentsPreview(cargo: Cargo): OwnedCargoDocumentsPreview {
  const { total, pending, topPending } = countDocuments(cargo);
  const readinessPercent = resolveOwnedCargoProgress(cargo);

  if (total === 0) {
    return {
      state: 'empty',
      totalCount: 0,
      pendingCount: 0,
      readinessPercent,
      topPendingName: null,
    };
  }

  return {
    state: 'available',
    totalCount: total,
    pendingCount: pending,
    readinessPercent,
    topPendingName: topPending,
  };
}

export function deriveOwnedCargoRisksPreview(cargo: Cargo): OwnedCargoRisksPreview {
  const risks = cargo.operationalRisks ?? [];

  if (!risks.length) {
    return { state: 'clear', count: 0, primaryRiskMock: null };
  }

  return {
    state: 'attention',
    count: risks.length,
    primaryRiskMock: risks[0] ?? null,
  };
}

function resolvePrimaryAlertMock(cargo: Cargo): string | null {
  const risks = cargo.operationalRisks ?? [];
  if (risks.length > 0) return risks[0]!;

  const pendingDoc = cargo.requiredDocuments?.find(
    (doc) => doc.status === 'required' || doc.status === 'conditional',
  );
  if (pendingDoc) return pendingDoc.name;

  if (cargo.documentsStatusSummary?.trim()) return cargo.documentsStatusSummary;

  return null;
}

export function deriveOwnedCargoStatusCard(cargo: Cargo): OwnedCargoStatusCardData {
  const progressPercent = resolveOwnedCargoProgress(cargo);

  return {
    progressPercent,
    currentStepMock: cargo.operationalNextStep?.trim() ? cargo.operationalNextStep : null,
    primaryAlertMock: resolvePrimaryAlertMock(cargo),
    windowLabel: cargo.window,
    etaLabel: cargo.etaConfidence?.trim() ? cargo.etaConfidence : null,
  };
}

export function deriveOwnedCargoSupportCards(cargo: Cargo): OwnedCargoSupportCard[] {
  const cards: OwnedCargoSupportCard[] = [{ key: 'volume', value: cargo.volume }];

  if (cargo.window.trim()) {
    cards.push({ key: 'window', value: cargo.window });
  }

  if (cargo.corridor?.trim()) {
    cards.push({ key: 'corridor', value: cargo.corridor });
  }

  const operationLabel = cargo.serviceType?.trim() || cargo.mainRiver?.trim();
  if (operationLabel) {
    cards.push({ key: 'operation', value: operationLabel });
  }

  if (cargo.co2Saving.trim()) {
    cards.push({ key: 'co2', value: cargo.co2Saving });
  }

  return cards;
}

export function deriveOwnedCargoTimelineEvents(cargo: Cargo): OwnedCargoTimelineEvent[] {
  const eventCount = OWNED_CARGO_TIMELINE_EVENT_COUNT_BY_STATUS[cargo.status];
  if (eventCount <= 0) return [];

  const labels = OWNED_CARGO_TIMELINE_EVENT_MOCKS.slice(0, eventCount);
  const currentIndex = cargo.status === 'delivered' ? labels.length : Math.max(0, labels.length - 1);

  return labels.map((labelMock, index) => ({
    id: `${cargo.id}-timeline-${index}`,
    labelMock,
    phase: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
  }));
}

export function deriveOwnedCargoDocumentItems(cargo: Cargo): OwnedCargoDocumentItem[] {
  return (cargo.requiredDocuments ?? []).map((doc) => ({
    name: doc.name,
    status: doc.status,
    note: doc.note,
  }));
}

export function deriveOwnedCargoRiskItems(cargo: Cargo): OwnedCargoRiskItem[] {
  return (cargo.operationalRisks ?? []).map((risk, index) => ({
    id: `${cargo.id}-risk-${index}`,
    labelMock: risk,
    severity: index === 0 ? 'high' : 'medium',
  }));
}

export function deriveOwnedCargoOperationalMetrics(cargo: Cargo): OwnedCargoOperationalMetric[] {
  const progress = resolveOwnedCargoProgress(cargo);
  const cargoTypeValue = cargo.temperature ? `${cargo.cargoType} · ${cargo.temperature}` : cargo.cargoType;

  return [
    { key: 'window', value: cargo.window },
    { key: 'progress', value: `${progress}%` },
    { key: 'cargoType', value: cargoTypeValue },
    resolvePendingMetric(cargo),
  ];
}

export function deriveOwnedCargoDetail(cargo: Cargo): OwnedCargoDetailDerivation {
  const progress = resolveOwnedCargoProgress(cargo);
  const documents = deriveOwnedCargoDocumentsPreview(cargo);

  return {
    progress,
    metrics: deriveOwnedCargoOperationalMetrics(cargo),
    statusCard: deriveOwnedCargoStatusCard(cargo),
    supportCards: deriveOwnedCargoSupportCards(cargo),
    map: deriveOwnedCargoMapPreview(cargo),
    timeline: deriveOwnedCargoTimelinePreview(cargo),
    timelineEvents: deriveOwnedCargoTimelineEvents(cargo),
    documents,
    documentItems: deriveOwnedCargoDocumentItems(cargo),
    risks: deriveOwnedCargoRisksPreview(cargo),
    riskItems: deriveOwnedCargoRiskItems(cargo),
    showTrackAction: cargo.status === 'boarded' || cargo.status === 'reserved' || cargo.myCargoesCta === 'track',
    showNegotiateAction:
      cargo.status === 'bidding'
      || cargo.status === 'contracting'
      || (typeof cargo.proposalsCount === 'number' && cargo.proposalsCount > 0),
    showUpdateStatusAction: cargo.status !== 'delivered',
    showObservationAction: true,
    showOpenDocumentsAction: documents.state !== 'empty',
  };
}
