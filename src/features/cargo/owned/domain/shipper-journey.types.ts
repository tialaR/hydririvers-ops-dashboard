export type ShipperJourneyExperience =
  | 'discovery'
  | 'cockpit'
  | 'documentsRisk'
  | 'negotiation'
  | 'review'
  | 'feedback'
  | 'correction'
  | 'monitoring';

export type OperationalDataMode = 'live' | 'cache' | 'demo';
export type OperationalFreshnessState = 'fresh' | 'stale' | 'offline';
export type OperationalSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type OperationalSourceRef = {
  id: string;
  authority: 'DNIT' | 'ANA' | 'ANTAQ' | 'CHM' | 'RECEITA' | 'HYDRORIVERS';
  label: string;
  url?: string;
  observedAt?: string;
  retrievedAt?: string;
  mode: OperationalDataMode;
  freshnessState: OperationalFreshnessState;
};

export type HydroCondition = {
  corridorId: string;
  segmentId: string;
  riverLabel: string;
  status: 'normal' | 'attention' | 'restricted' | 'critical';
  levelMeters?: number;
  trend?: 'rising' | 'stable' | 'falling';
  draftMarginMeters?: number;
  constraints: Array<{
    id: string;
    type: 'lowWater' | 'sandbank' | 'rock' | 'dredging' | 'signaling' | 'weather' | 'navigationNotice';
    severity: OperationalSeverity;
    title: string;
    impact: string;
    validUntil?: string;
    sourceId: string;
  }>;
  sourceId: string;
};

export type ShipperDocumentKind =
  | 'nfe'
  | 'cte'
  | 'mdfe'
  | 'packingList'
  | 'collectionProof'
  | 'insurance'
  | 'license'
  | 'other';

export type ShipperDocumentState = 'ready' | 'review' | 'pending' | 'divergent' | 'blocked' | 'notApplicable';

export type ShipperDocumentEvidence = {
  id: string;
  kind: ShipperDocumentKind;
  label: string;
  state: ShipperDocumentState;
  applicability: 'required' | 'conditional' | 'informational';
  ownerRole: 'shipper' | 'carrier' | 'operator' | 'system';
  deadlineAt?: string;
  observedValue?: string;
  expectedValue?: string;
  evidenceIds: string[];
};

export type ShipperOccurrence = {
  id: string;
  type: 'documentDivergence' | 'hydroRestriction' | 'delay' | 'signalLoss' | 'commercial';
  severity: OperationalSeverity;
  title: string;
  cause: string;
  impact: string;
  affectedObjectIds: string[];
  evidenceIds: string[];
  mitigationSteps: string[];
  deadlineAt?: string;
  status: 'open' | 'mitigating' | 'resolved';
};

export type ShipperProposal = {
  id: string;
  counterparty: string;
  vesselLabel: string;
  priceBRL: number;
  etaHours: number;
  validityAt: string;
  demurrage?: {
    valueBRLPerDay: number;
    contractual: boolean;
  };
  compatibility: {
    cargo: 'compatible' | 'attention' | 'incompatible';
    draft: 'compatible' | 'attention' | 'incompatible' | 'unknown';
    documents: 'ready' | 'attention' | 'blocked';
  };
  operationalRisk: OperationalSeverity;
};

export type ShipperDecision = {
  id: string;
  cargoId: string;
  type: 'selectProposal' | 'correctDocument' | 'acknowledgeRisk' | 'reschedule';
  status: 'draft' | 'confirmed' | 'applied' | 'rejected';
  before: Record<string, string | number | boolean | null>;
  after: Record<string, string | number | boolean | null>;
  consequence: string;
  evidenceIds: string[];
  createdAt: string;
  confirmedAt?: string;
};

export type ShipperJourneyEvent = {
  id: string;
  cargoId: string;
  type:
    | 'cargoSelected'
    | 'hydroConstraintRaised'
    | 'documentDivergenceFound'
    | 'proposalSelected'
    | 'reviewConfirmed'
    | 'documentRejected'
    | 'correctionSubmitted'
    | 'followUpRequired';
  occurredAt: string;
  recordedAt: string;
  actor: 'shipper' | 'carrier' | 'operator' | 'system';
  evidenceIds: string[];
  nextExperience: ShipperJourneyExperience;
};

export type ShipperJourneySnapshot = {
  schemaVersion: '1.0';
  mode: OperationalDataMode;
  generatedAt: string;
  cargoId: string;
  experience: ShipperJourneyExperience;
  hydro: HydroCondition;
  documents: ShipperDocumentEvidence[];
  occurrences: ShipperOccurrence[];
  proposals: ShipperProposal[];
  decisions: ShipperDecision[];
  events: ShipperJourneyEvent[];
  sources: OperationalSourceRef[];
};

export type ShipperPortfolioFilters = {
  query: string;
  status: string[];
  actionRequired: string[];
  corridor: string[];
  origin: string[];
  destination: string[];
  cargoType: string[];
  risk: OperationalSeverity[];
  navigability: HydroCondition['status'][];
  documentState: ShipperDocumentState[];
  freshness: OperationalFreshnessState[];
  etaWindow: Array<'lt12h' | '12to24h' | '24to72h' | 'gt72h'>;
  openOccurrence: boolean | null;
  carrier: string[];
};
