import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import type {
  CargoPriority,
  CargoPriorityAction,
  CargoPriorityChecklistItem,
  CargoPrioritySummaryItem,
  PriorityLevel
} from '@/features/cargo/types/cargo-priority.types';

const PRIORITY_BY_STATUS: Record<Cargo['status'], { score: number; level: PriorityLevel; badgeLabelKey: string; statusLabelKey: string; scoreNoteKey: string; riskLabel: string; windowLabel: string; trackingLabel: string; documentsLabel: string; }> = {
  open: {
    score: 72,
    level: 'medium',
    badgeLabelKey: 'priority.badges.monitoring',
    statusLabelKey: 'priority.status.monitoring',
    scoreNoteKey: 'priority.scoreNote',
    riskLabel: 'priority.cards.operationalRisk.medium',
    windowLabel: 'priority.cards.coldChain.normal',
    trackingLabel: 'priority.cards.trackingSignal.intermitent',
    documentsLabel: 'priority.cards.criticalDocuments.pending'
  },
  bidding: {
    score: 68,
    level: 'medium',
    badgeLabelKey: 'priority.badges.monitoring',
    statusLabelKey: 'priority.status.monitoring',
    scoreNoteKey: 'priority.scoreNote',
    riskLabel: 'priority.cards.operationalRisk.medium',
    windowLabel: 'priority.cards.coldChain.short',
    trackingLabel: 'priority.cards.trackingSignal.intermitent',
    documentsLabel: 'priority.cards.criticalDocuments.pending'
  },
  contracting: {
    score: 78,
    level: 'medium',
    badgeLabelKey: 'priority.badges.attention',
    statusLabelKey: 'priority.status.inReview',
    scoreNoteKey: 'priority.scoreNote',
    riskLabel: 'priority.cards.operationalRisk.medium',
    windowLabel: 'priority.cards.coldChain.short',
    trackingLabel: 'priority.cards.trackingSignal.delayed',
    documentsLabel: 'priority.cards.criticalDocuments.pending'
  },
  reserved: {
    score: 84,
    level: 'high',
    badgeLabelKey: 'priority.badges.high',
    statusLabelKey: 'priority.status.monitoring',
    scoreNoteKey: 'priority.scoreNote',
    riskLabel: 'priority.cards.operationalRisk.high',
    windowLabel: 'priority.cards.coldChain.short',
    trackingLabel: 'priority.cards.trackingSignal.delayed',
    documentsLabel: 'priority.cards.criticalDocuments.pending'
  },
  boarded: {
    score: 88,
    level: 'high',
    badgeLabelKey: 'priority.badges.high',
    statusLabelKey: 'priority.status.inProgress',
    scoreNoteKey: 'priority.scoreNote',
    riskLabel: 'priority.cards.operationalRisk.high',
    windowLabel: 'priority.cards.coldChain.short',
    trackingLabel: 'priority.cards.trackingSignal.intermitent',
    documentsLabel: 'priority.cards.criticalDocuments.review'
  },
  delivered: {
    score: 42,
    level: 'monitoring',
    badgeLabelKey: 'priority.badges.monitoring',
    statusLabelKey: 'priority.status.done',
    scoreNoteKey: 'priority.scoreNoteLow',
    riskLabel: 'priority.cards.operationalRisk.low',
    windowLabel: 'priority.cards.coldChain.normal',
    trackingLabel: 'priority.cards.trackingSignal.stable',
    documentsLabel: 'priority.cards.criticalDocuments.ready'
  }
};

function createSummaryItems(config: (typeof PRIORITY_BY_STATUS)[Cargo['status']], cargo: Cargo): CargoPrioritySummaryItem[] {
  return [
    {
      id: 'risk',
      titleKey: 'priority.cards.operationalRisk.title',
      valueKey: cargo.status === 'delivered' ? 'priority.cards.operationalRisk.low' : cargo.status === 'reserved' || cargo.status === 'boarded' ? 'priority.cards.operationalRisk.high' : 'priority.cards.operationalRisk.medium',
      descriptionKey: config.riskLabel,
      icon: 'alert'
    },
    {
      id: 'window',
      titleKey: 'priority.cards.coldChain.title',
      valueKey: cargo.status === 'open' ? 'priority.cards.coldChain.windowOpen' : cargo.status === 'bidding' ? 'priority.cards.coldChain.windowBidding' : 'priority.cards.coldChain.windowTight',
      descriptionKey: config.windowLabel,
      icon: 'clock'
    },
    {
      id: 'tracking',
      titleKey: 'priority.cards.trackingSignal.title',
      valueKey: cargo.connectivity === 'lowSignal' ? 'priority.cards.trackingSignal.intermitent' : cargo.connectivity === 'delayedSync' ? 'priority.cards.trackingSignal.delayed' : 'priority.cards.trackingSignal.stable',
      descriptionKey: config.trackingLabel,
      icon: 'route'
    },
    {
      id: 'documents',
      titleKey: 'priority.cards.criticalDocuments.title',
      valueKey: cargo.requiredDocuments?.filter((document) => document.status !== 'ok').length ? 'priority.cards.criticalDocuments.pending' : 'priority.cards.criticalDocuments.ready',
      descriptionKey: config.documentsLabel,
      icon: 'document'
    }
  ];
}

function createActions(cargo: Cargo): CargoPriorityAction[] {
  const pendingDocuments = cargo.requiredDocuments?.filter((document) => document.status !== 'ok').length ?? 0;

  return [
    {
      id: 'cold-chain-window',
      categoryKey: 'priority.actions.coldChain.category',
      titleKey: 'priority.actions.coldChain.title',
      descriptionKey: 'priority.actions.coldChain.description',
      severity: 'high',
      status: 'monitoring',
      recommendationKey: 'priority.actions.coldChain.recommendation',
      icon: 'temperature'
    },
    {
      id: 'tracking-signal',
      categoryKey: 'priority.actions.tracking.category',
      titleKey: 'priority.actions.tracking.title',
      descriptionKey: 'priority.actions.tracking.description',
      severity: 'medium',
      status: 'inReview',
      recommendationKey: 'priority.actions.tracking.recommendation',
      icon: 'signal'
    },
    {
      id: 'documents-critical',
      categoryKey: 'priority.actions.documents.category',
      titleKey: 'priority.actions.documents.title',
      descriptionKey: pendingDocuments ? 'priority.actions.documents.descriptionWithPending' : 'priority.actions.documents.descriptionFallback',
      severity: pendingDocuments ? 'medium' : 'low',
      status: pendingDocuments ? 'pending' : 'stable',
      recommendationKey: 'priority.actions.documents.recommendation',
      icon: 'document'
    }
  ];
}

function createChecklist(cargo: Cargo): CargoPriorityChecklistItem[] {
  const pendingDocuments = cargo.requiredDocuments?.filter((document) => document.status !== 'ok').length ?? 0;
  return [
    { id: 'confirm-dock-window', labelKey: 'priority.checklist.confirmDockWindow', status: cargo.status === 'boarded' || cargo.status === 'delivered' ? 'done' : 'pending' },
    { id: 'validate-documents', labelKey: 'priority.checklist.validateDocuments', status: pendingDocuments ? 'inProgress' : 'done' },
    { id: 'confirm-operator', labelKey: 'priority.checklist.confirmOperator', status: cargo.carrierId ? 'done' : 'pending' },
    { id: 'monitor-signal', labelKey: 'priority.checklist.monitorSignal', status: cargo.connectivity === 'online' ? 'done' : 'inProgress' },
    { id: 'update-delay', labelKey: 'priority.checklist.updateDelay', status: cargo.status === 'delivered' ? 'done' : 'pending' }
  ];
}

export function getCargoPriority(cargo: Cargo): CargoPriority {
  const config = PRIORITY_BY_STATUS[cargo.status];
  const summary = createSummaryItems(config, cargo);
  const actions = createActions(cargo);
  const checklist = createChecklist(cargo);

  return {
    score: config.score,
    level: config.level,
    badgeLabelKey: config.badgeLabelKey,
    statusLabelKey: config.statusLabelKey,
    summary,
    actions,
    checklist,
    impacts: [
      'priority.impacts.dockingDelay',
      'priority.impacts.coldChainLoss',
      'priority.impacts.documentRevalidation'
    ],
    scoreNoteKey: config.scoreNoteKey,
    emptyTitleKey: 'priority.empty.title',
    emptyDescriptionKey: 'priority.empty.description',
    emptyCtaLabelKey: 'priority.empty.cta'
  };
}
