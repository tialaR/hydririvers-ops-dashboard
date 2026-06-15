import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import { resolveOwnedCargoProgress } from '@/features/cargo/domain/summarize-owned-cargoes';

export type OwnedCargoPreviewPanel =
  | 'map'
  | 'timeline'
  | 'documents'
  | 'risks'
  | 'tracking'
  | 'process';

export type OwnedCargoPreviewState = 'available' | 'empty' | 'unavailable' | 'attention';

export type OwnedCargoOperationalMetricKey = 'window' | 'progress' | 'cargoType' | 'pending';

export type OwnedCargoOperationalMetric = {
  key: OwnedCargoOperationalMetricKey;
  value: string;
  /** Texto mock traduzível no componente (pendência/risco). */
  mockValue?: string;
};

export type OwnedCargoMapStatusKey =
  | 'open'
  | 'preparing'
  | 'inTransit'
  | 'delivered'
  | 'unavailable';

export type OwnedCargoMapPreview = {
  state: 'available' | 'unavailable';
  routeLabel: string;
  progressPercent: number;
  checkpointLabel: string;
  statusKey: OwnedCargoMapStatusKey;
};

export type OwnedCargoTimelineStatusKey =
  | 'inTransit'
  | 'open'
  | 'negotiating'
  | 'delivered'
  | 'preparing';

export type OwnedCargoTimelinePreview = {
  state: 'available' | 'empty';
  eventCount: number;
  nextEventMock: string | null;
  statusKey: OwnedCargoTimelineStatusKey;
  phaseDots: OwnedCargoTimelineEventPhase[];
};

export type OwnedCargoDocumentsPreview = {
  state: 'available' | 'empty';
  totalCount: number;
  pendingCount: number;
  readinessPercent: number;
  topPendingName: string | null;
};

export type OwnedCargoRiskSeverity = 'low' | 'medium' | 'high';

export type OwnedCargoRisksPreview = {
  state: 'clear' | 'attention' | 'empty';
  count: number;
  primaryRiskMock: string | null;
  topSeverity: OwnedCargoRiskSeverity | null;
};

export type OwnedCargoTrackingPreview = {
  state: 'available' | 'unavailable';
  channelLabel: string;
  progressPercent: number;
};

export type OwnedCargoTrackingDetail = {
  channelLabel: string;
  progressPercent: number;
  vesselLabelMock: string;
  convoyLabelMock: string;
  operatorLabelMock: string;
  checkpointLabel: string;
  nextStopLabel: string;
  etaLabel: string | null;
  isLive: boolean;
};

export type OwnedCargoProcessStatusKey = 'pending' | 'inProgress' | 'ready';

export type OwnedCargoProcessPreview = {
  state: 'available' | 'empty';
  actionLabelMock: string | null;
  statusKey: OwnedCargoProcessStatusKey;
  progressPercent: number;
  fullStepMock: string | null;
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
  timestampMock: string;
};

export type OwnedCargoDocumentDisplayStatus =
  | 'authorized'
  | 'checked'
  | 'valid'
  | 'pending'
  | 'nextPhase';

export type OwnedCargoDocumentItem = {
  name: string;
  status: 'required' | 'conditional' | 'nextPhase' | 'ok';
  displayStatus: OwnedCargoDocumentDisplayStatus;
  note?: string;
  needsAction: boolean;
};

export type OwnedCargoRiskItem = {
  id: string;
  labelMock: string;
  severity: 'low' | 'medium' | 'high';
  impactMock: string;
  recommendationMock: string;
  isCritical: boolean;
};

export type OwnedCargoProcessStep = {
  id: string;
  labelMock: string;
  phase: OwnedCargoTimelineEventPhase;
};

/** Valores estáveis para `?panel=` na fase E+. */
export const OWNED_CARGO_PANEL_TARGETS = [
  'map',
  'timeline',
  'documents',
  'risks',
  'tracking',
  'process',
] as const;

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
  tracking: OwnedCargoTrackingPreview;
  trackingDetail: OwnedCargoTrackingDetail | null;
  process: OwnedCargoProcessPreview;
  processSteps: OwnedCargoProcessStep[];
  showTrackingPreview: boolean;
  showProcessPreview: boolean;
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

/** Timestamps mock determinísticos por marco (sem Date.now). */
export const OWNED_CARGO_TIMELINE_TIMESTAMP_MOCKS: readonly string[] = [
  '01/05 · 08:00',
  '02/05 · 11:30',
  '04/05 · 09:15',
  '06/05 · 07:40',
  '08/05 · 14:20',
  '10/05 · 06:55',
  '12/05 · 18:10',
  '14/05 · 16:45',
];

const OWNED_CARGO_RISK_IMPACT_MOCKS: Record<OwnedCargoRiskSeverity, string> = {
  high: 'Pode atrasar atracação ou exigir desvio de rota.',
  medium: 'Monitorar condições e reforçar comunicação com a tripulação.',
  low: 'Sem impacto imediato na operação.',
};

const OWNED_CARGO_RISK_RECOMMENDATION_MOCKS: Record<OwnedCargoRiskSeverity, string> = {
  high: 'Acione a transportadora e revise janela de chegada.',
  medium: 'Acompanhe atualizações do corredor e confirme ETA.',
  low: 'Manter rotina de monitoramento.',
};

function resolveMapStatusKey(cargo: Cargo): OwnedCargoMapStatusKey {
  if (cargo.status === 'delivered') return 'delivered';
  if (cargo.status === 'boarded') return 'inTransit';
  if (cargo.status === 'contracting' || cargo.status === 'reserved' || cargo.status === 'bidding') {
    return 'preparing';
  }
  if (cargo.status === 'open') return 'open';
  return 'unavailable';
}

function resolveDocumentDisplayStatus(
  name: string,
  status: OwnedCargoDocumentItem['status'],
): OwnedCargoDocumentDisplayStatus {
  if (status === 'nextPhase') return 'nextPhase';
  if (status === 'required' || status === 'conditional') return 'pending';

  const normalized = name.toLowerCase();
  if (normalized.includes('nf')) return 'authorized';
  if (normalized.includes('romaneio')) return 'checked';
  if (normalized.includes('sanit') || normalized.includes('licen')) return 'valid';
  return 'authorized';
}

function resolveRiskSeverity(index: number, total: number): OwnedCargoRiskSeverity {
  if (index === 0) return 'high';
  if (index === 1 || total === 2) return 'medium';
  return 'low';
}

function resolveTrackingCheckpoint(cargo: Cargo, fallback: string): string {
  if (cargo.status === 'boarded') return 'Km 1.182 · trecho intermediário';
  if (cargo.status === 'reserved') return `${fallback} · preparando embarque`;
  return fallback;
}

function resolveTrackingVesselMock(cargo: Cargo): string {
  if (cargo.status === 'boarded') return 'M/V São Gabriel';
  if (cargo.serviceType?.trim()) return cargo.serviceType.trim();
  return 'Embarcação regional';
}

function resolveTrackingConvoyMock(cargo: Cargo): string {
  if (cargo.status === 'boarded') return 'HidroNave 12';
  if (cargo.corridor?.trim()) return `Comboio ${cargo.corridor.trim()}`;
  return 'Comboio regional';
}

function resolveTrackingOperatorMock(cargo: Cargo): string {
  if (cargo.status === 'boarded') return 'Operador hidroviário regional';
  if (cargo.carrierId) return `Operador ${cargo.carrierId}`;
  return 'Transportadora vinculada';
}

function resolveTrackingEtaLabel(cargo: Cargo): string | null {
  if (cargo.etaConfidence?.trim()) return cargo.etaConfidence.trim();
  if (cargo.status === 'boarded') return '28–36 h';
  if (cargo.status === 'reserved') return cargo.window.trim() || null;
  return null;
}

export function deriveOwnedCargoProcessSteps(cargo: Cargo): OwnedCargoProcessStep[] {
  const steps: OwnedCargoProcessStep[] = [];
  const pendingDocs = (cargo.requiredDocuments ?? []).filter(
    (doc) => doc.status === 'required' || doc.status === 'conditional',
  );

  if (pendingDocs.length > 0) {
    steps.push({
      id: `${cargo.id}-process-docs`,
      labelMock: 'Anexar documentos pendentes',
      phase: 'current',
    });
  }

  if (cargo.operationalNextStep?.trim()) {
    steps.push({
      id: `${cargo.id}-process-next`,
      labelMock: cargo.operationalNextStep.trim(),
      phase: pendingDocs.length > 0 ? 'upcoming' : 'current',
    });
  }

  if (cargo.status === 'boarded' || cargo.status === 'reserved') {
    steps.unshift({
      id: `${cargo.id}-process-confirm`,
      labelMock: 'Confirmar dados operacionais',
      phase: 'done',
    });
  }

  if ((cargo.documentReadiness ?? 0) >= 80 && pendingDocs.length === 0) {
    steps.unshift({
      id: `${cargo.id}-process-ready`,
      labelMock: 'Documentação conferida',
      phase: 'done',
    });
  }

  if (steps.length === 0) {
    return [
      {
        id: `${cargo.id}-process-idle`,
        labelMock: 'Operação em dia · nenhuma pendência crítica',
        phase: 'done',
      },
    ];
  }

  return steps;
}

function resolveTimelineStatusKey(status: CargoStatus): OwnedCargoTimelineStatusKey {
  if (status === 'boarded') return 'inTransit';
  if (status === 'delivered') return 'delivered';
  if (status === 'bidding') return 'negotiating';
  if (status === 'contracting' || status === 'reserved') return 'preparing';
  return 'open';
}

function resolveTimelinePhaseDots(cargo: Cargo): OwnedCargoTimelineEventPhase[] {
  const events = deriveOwnedCargoTimelineEvents(cargo);
  if (!events.length) return ['upcoming', 'upcoming', 'upcoming', 'upcoming'];

  const tailPhases = events.slice(-4).map((event) => event.phase);
  while (tailPhases.length < 4) {
    tailPhases.unshift('upcoming');
  }

  return tailPhases;
}

function resolveTrackingChannelLabel(cargo: Cargo): string {
  if (cargo.mainRiver?.trim()) return cargo.mainRiver.trim();
  if (cargo.corridor?.trim()) return cargo.corridor.trim();
  return resolveRouteLabel(cargo);
}

function resolveProcessActionLabel(cargo: Cargo): string | null {
  const pendingDoc = cargo.requiredDocuments?.find(
    (doc) => doc.status === 'required' || doc.status === 'conditional',
  );
  if (pendingDoc?.name) return pendingDoc.name;

  const nextStep = cargo.operationalNextStep?.trim();
  if (!nextStep) return null;

  const firstClause = nextStep.split(/[.·]/)[0]?.trim();
  return firstClause && firstClause.length <= 48 ? firstClause : null;
}

function resolveProcessStatusKey(cargo: Cargo): OwnedCargoProcessStatusKey {
  const pendingCount =
    cargo.requiredDocuments?.filter(
      (doc) => doc.status === 'required' || doc.status === 'conditional',
    ).length ?? 0;

  if (pendingCount > 0) return 'pending';
  if (cargo.operationalNextStep?.trim()) return 'inProgress';
  return 'ready';
}

function shouldShowTrackingPreview(cargo: Cargo): boolean {
  return (
    cargo.status === 'boarded'
    || cargo.status === 'reserved'
    || cargo.myCargoesCta === 'track'
  );
}

function shouldShowProcessPreview(cargo: Cargo): boolean {
  const hasNextStep = Boolean(cargo.operationalNextStep?.trim());
  const hasPendingDocs = (cargo.requiredDocuments ?? []).some(
    (doc) => doc.status === 'required' || doc.status === 'conditional',
  );
  return hasNextStep || hasPendingDocs;
}

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
      statusKey: 'unavailable',
    };
  }

  return {
    state: 'available',
    routeLabel,
    progressPercent: OWNED_CARGO_MAP_PROGRESS_BY_STATUS[cargo.status],
    checkpointLabel: resolveCheckpointLabel(cargo),
    statusKey: resolveMapStatusKey(cargo),
  };
}

export function deriveOwnedCargoTimelinePreview(cargo: Cargo): OwnedCargoTimelinePreview {
  const eventCount = OWNED_CARGO_TIMELINE_EVENT_COUNT_BY_STATUS[cargo.status];
  const nextEventMock = cargo.operationalNextStep?.trim() ? cargo.operationalNextStep : null;
  const statusKey = resolveTimelineStatusKey(cargo.status);
  const phaseDots = resolveTimelinePhaseDots(cargo);

  if (eventCount <= 0 && !nextEventMock) {
    return { state: 'empty', eventCount: 0, nextEventMock: null, statusKey, phaseDots };
  }

  return {
    state: 'available',
    eventCount,
    nextEventMock,
    statusKey,
    phaseDots,
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
    return { state: 'clear', count: 0, primaryRiskMock: null, topSeverity: null };
  }

  return {
    state: 'attention',
    count: risks.length,
    primaryRiskMock: risks[0] ?? null,
    topSeverity: 'high',
  };
}

export function deriveOwnedCargoTrackingPreview(cargo: Cargo): OwnedCargoTrackingPreview {
  const channelLabel = resolveTrackingChannelLabel(cargo);
  const progressPercent = OWNED_CARGO_MAP_PROGRESS_BY_STATUS[cargo.status];

  if (!shouldShowTrackingPreview(cargo) || !channelLabel.trim()) {
    return { state: 'unavailable', channelLabel: '', progressPercent: 0 };
  }

  return {
    state: 'available',
    channelLabel,
    progressPercent,
  };
}

export function deriveOwnedCargoTrackingDetail(cargo: Cargo): OwnedCargoTrackingDetail | null {
  const preview = deriveOwnedCargoTrackingPreview(cargo);
  if (preview.state === 'unavailable') return null;

  const map = deriveOwnedCargoMapPreview(cargo);
  const nextStop =
    cargo.status === 'boarded' || cargo.status === 'reserved'
      ? cargo.destination
      : cargo.origin;

  return {
    channelLabel: preview.channelLabel,
    progressPercent: preview.progressPercent,
    vesselLabelMock: resolveTrackingVesselMock(cargo),
    convoyLabelMock: resolveTrackingConvoyMock(cargo),
    operatorLabelMock: resolveTrackingOperatorMock(cargo),
    checkpointLabel: resolveTrackingCheckpoint(cargo, map.checkpointLabel),
    nextStopLabel: nextStop,
    etaLabel: resolveTrackingEtaLabel(cargo),
    isLive: cargo.status === 'boarded',
  };
}

export function deriveOwnedCargoProcessPreview(cargo: Cargo): OwnedCargoProcessPreview {
  const progressPercent = resolveOwnedCargoProgress(cargo);
  const fullStepMock = cargo.operationalNextStep?.trim() ? cargo.operationalNextStep : null;
  const actionLabelMock = resolveProcessActionLabel(cargo);
  const statusKey = resolveProcessStatusKey(cargo);

  if (!shouldShowProcessPreview(cargo)) {
    return { state: 'empty', actionLabelMock: null, statusKey: 'ready', progressPercent, fullStepMock: null };
  }

  return {
    state: 'available',
    actionLabelMock,
    statusKey,
    progressPercent,
    fullStepMock,
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
    timestampMock: OWNED_CARGO_TIMELINE_TIMESTAMP_MOCKS[index] ?? OWNED_CARGO_TIMELINE_TIMESTAMP_MOCKS.at(-1)!,
  }));
}

export function deriveOwnedCargoDocumentItems(cargo: Cargo): OwnedCargoDocumentItem[] {
  return (cargo.requiredDocuments ?? []).map((doc) => {
    const displayStatus = resolveDocumentDisplayStatus(doc.name, doc.status);
    return {
      name: doc.name,
      status: doc.status,
      displayStatus,
      note: doc.note,
      needsAction: doc.status === 'required' || doc.status === 'conditional',
    };
  });
}

export function deriveOwnedCargoRiskItems(cargo: Cargo): OwnedCargoRiskItem[] {
  const risks = cargo.operationalRisks ?? [];
  return risks.map((risk, index) => {
    const severity = resolveRiskSeverity(index, risks.length);
    return {
      id: `${cargo.id}-risk-${index}`,
      labelMock: risk,
      severity,
      impactMock: OWNED_CARGO_RISK_IMPACT_MOCKS[severity],
      recommendationMock: OWNED_CARGO_RISK_RECOMMENDATION_MOCKS[severity],
      isCritical: severity === 'high' && index === 0,
    };
  });
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
  const tracking = deriveOwnedCargoTrackingPreview(cargo);
  const process = deriveOwnedCargoProcessPreview(cargo);

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
    tracking,
    trackingDetail: deriveOwnedCargoTrackingDetail(cargo),
    process,
    processSteps: deriveOwnedCargoProcessSteps(cargo),
    showTrackingPreview: shouldShowTrackingPreview(cargo) && tracking.state === 'available',
    showProcessPreview: shouldShowProcessPreview(cargo) && process.state === 'available',
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
