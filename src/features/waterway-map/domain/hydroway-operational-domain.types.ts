/** Perfil de carga para priorização operacional em corredores e terminais. */
export type CargoProfile =
  | 'grains'
  | 'fuel'
  | 'containers'
  | 'ores'
  | 'general'
  | 'industrial'
  | 'vehicles'
  | 'refrigerated'
  | 'hazardous';

/** Modos de decisão para camadas operacionais (não presets cosméticos). */
export type HydrowayOperationalLayerMode =
  | 'operation'
  | 'navigation'
  | 'logistics'
  | 'risk'
  | 'government';

export type HydrowayOperationalAudience =
  | 'captain'
  | 'shipper'
  | 'operator'
  | 'government'
  | 'mixed';

export type HydrowayCognitiveLoad = 'low' | 'medium';

export type HydrowayOperationalFeatureKind =
  | 'corridor'
  | 'segment'
  | 'terminal'
  | 'alert'
  | 'signal'
  | 'planningArea'
  | 'checkpoint';

export type HydrowayCorridorPriority = 'main' | 'secondary' | 'support';

export type HydrowayConcessionStatus =
  | 'none'
  | 'study'
  | 'planned'
  | 'bidding'
  | 'active'
  | 'unknown';

export type HydrowaySourceContext = 'mock' | 'official-reference' | 'partner-reference';

export type HydrowayNavigabilityStatus = 'normal' | 'attention' | 'restricted';

export type HydrowayWaterLevelStatus = 'high' | 'normal' | 'low' | 'critical';

export type HydrowayDroughtRisk = 'low' | 'medium' | 'high';

export type HydrowayDredgingStatus = 'none' | 'scheduled' | 'active' | 'restricted';

export type HydrowaySpeedRecommendation =
  | 'normal'
  | 'reduce-speed'
  | 'assisted-navigation'
  | 'avoid';

export type HydrowayTerminalType =
  | 'public-port'
  | 'private-terminal'
  | 'ip4'
  | 'transshipment'
  | 'fuel'
  | 'maintenance'
  | 'checkpoint';

export type HydrowayTerminalOperationalStatus =
  | 'open'
  | 'restricted'
  | 'congested'
  | 'closed';

export type HydrowayQueueRisk = 'low' | 'medium' | 'high';

export type HydrowayEtaRelevance =
  | 'origin'
  | 'destination'
  | 'next-stop'
  | 'alternate'
  | 'support';

export type HydrowayTerminalImportance = 'national' | 'regional' | 'local';

export type HydrowayAlertType =
  | 'draft'
  | 'drought'
  | 'dredging'
  | 'signaling'
  | 'traffic'
  | 'visibility'
  | 'environmental'
  | 'regulatory'
  | 'port-window';

export type HydrowayAlertSeverity = 'info' | 'warning' | 'critical';

export type HydrowayAlertImpact = 'eta' | 'cost' | 'safety' | 'routing' | 'compliance';

export type HydrowaySignalType = 'buoy' | 'beacon' | 'light' | 'river-sign' | 'reference';

export type HydrowaySignalCondition = 'ok' | 'attention' | 'maintenance' | 'unknown';

export type HydrowayVisibilityPriority = 'low' | 'medium' | 'high';

export type HydrowayPlanningAreaType =
  | 'basin'
  | 'concession-study'
  | 'dredging-plan'
  | 'sensitive-area'
  | 'administration'
  | 'priority-corridor';

export type HydrowayPlanningAreaStatus =
  | 'active'
  | 'planned'
  | 'attention'
  | 'suspended'
  | 'unknown';

export type HydrowayPlanningConfidence = 'low' | 'medium' | 'high';

export type HydrowayCheckpointType =
  | 'origin'
  | 'destination'
  | 'current-cargo'
  | 'next-terminal'
  | 'inspection'
  | 'transshipment'
  | 'risk-point';

export type HydrowayCheckpointStatus =
  | 'completed'
  | 'current'
  | 'upcoming'
  | 'attention'
  | 'delayed';

export type HydrowayPositionConfidence = 'high' | 'medium' | 'low';

export type HydrowayCargoOperationalStatus = 'on-time' | 'attention' | 'delayed';

export type HydrowayLngLat = [number, number];

export type HydrowayCorridor = {
  id: string;
  name: string;
  officialCode?: string;
  region: string;
  mainRivers: string[];
  strategicRole: string;
  businessValue: string;
  cargoProfiles: CargoProfile[];
  priority: HydrowayCorridorPriority;
  concessionStatus: HydrowayConcessionStatus;
  coordinates: HydrowayLngLat[];
  sourceContext: HydrowaySourceContext;
};

export type HydrowaySegment = {
  id: string;
  corridorId: string;
  name: string;
  from: string;
  to: string;
  coordinates: HydrowayLngLat[];
  navigabilityStatus: HydrowayNavigabilityStatus;
  draftMeters?: number;
  requiredDraftMeters?: number;
  waterLevelStatus: HydrowayWaterLevelStatus;
  droughtRisk: HydrowayDroughtRisk;
  dredgingStatus: HydrowayDredgingStatus;
  restrictionReason?: string;
  speedRecommendation: HydrowaySpeedRecommendation;
  validUntil?: string;
  businessImpactSummary: string;
};

export type HydrowayTerminal = {
  id: string;
  name: string;
  type: HydrowayTerminalType;
  coordinates: HydrowayLngLat;
  corridorIds: string[];
  cargoProfiles: CargoProfile[];
  operationalStatus: HydrowayTerminalOperationalStatus;
  queueRisk: HydrowayQueueRisk;
  etaRelevance: HydrowayEtaRelevance;
  importance: HydrowayTerminalImportance;
  businessImpactSummary: string;
};

export type HydrowayAlert = {
  id: string;
  segmentId?: string;
  corridorId?: string;
  coordinates: HydrowayLngLat;
  type: HydrowayAlertType;
  severity: HydrowayAlertSeverity;
  title: string;
  shortMessage: string;
  impact: HydrowayAlertImpact;
  etaImpactMinutes?: number;
  recommendedAction: string;
  validFrom: string;
  validUntil?: string;
  audience: HydrowayOperationalAudience;
};

export type HydrowaySignal = {
  id: string;
  segmentId: string;
  coordinates: HydrowayLngLat;
  signalType: HydrowaySignalType;
  condition: HydrowaySignalCondition;
  visibilityPriority: HydrowayVisibilityPriority;
  lastInspectionAt?: string;
  captainHint: string;
};

export type HydrowayPlanningArea = {
  id: string;
  name: string;
  type: HydrowayPlanningAreaType;
  coordinates: HydrowayLngLat[][];
  status: HydrowayPlanningAreaStatus;
  authority?: string;
  sourceName: string;
  sourceDate?: string;
  confidence: HydrowayPlanningConfidence;
  institutionalSummary: string;
};

export type HydrowayCheckpoint = {
  id: string;
  name: string;
  type: HydrowayCheckpointType;
  coordinates: HydrowayLngLat;
  cargoId?: string;
  terminalId?: string;
  alertId?: string;
  status: HydrowayCheckpointStatus;
  label: string;
  shortMessage: string;
};

export type CargoWaterwayOperationalContext = {
  cargoId: string;
  corridorId: string;
  activeSegmentId: string;
  originTerminalId: string;
  destinationTerminalId: string;
  currentPosition: {
    coordinates: HydrowayLngLat;
    updatedAt: string;
    confidence: HydrowayPositionConfidence;
  };
  eta: string;
  progress01: number;
  operationalStatus: HydrowayCargoOperationalStatus;
  activeAlertIds: string[];
  nextTerminalId?: string;
  nextCheckpointId?: string;
  recommendedLayerMode: HydrowayOperationalLayerMode;
  businessSummary: string;
  captainSummary: string;
};

export type HydrowayOperationalDataset = {
  corridors: HydrowayCorridor[];
  segments: HydrowaySegment[];
  terminals: HydrowayTerminal[];
  alerts: HydrowayAlert[];
  signals: HydrowaySignal[];
  planningAreas: HydrowayPlanningArea[];
  checkpoints: HydrowayCheckpoint[];
  cargoContexts: CargoWaterwayOperationalContext[];
};

/** Recorte do dataset relevante para uma carga. */
export type HydrowayOperationalDatasetSlice = {
  cargoId: string;
  corridor: HydrowayCorridor;
  segments: HydrowaySegment[];
  terminals: HydrowayTerminal[];
  alerts: HydrowayAlert[];
  signals: HydrowaySignal[];
  planningAreas: HydrowayPlanningArea[];
  checkpoints: HydrowayCheckpoint[];
  context: CargoWaterwayOperationalContext;
};

export type HydrowayOperationalLayerModeConfig = {
  id: HydrowayOperationalLayerMode;
  labelKey: string;
  descriptionKey: string;
  businessGoal: string;
  primaryAudience: HydrowayOperationalAudience;
  cognitiveLoad: HydrowayCognitiveLoad;
  mapEmphasis: string;
  visibleFeatureKinds: HydrowayOperationalFeatureKind[];
  mutedFeatureKinds: HydrowayOperationalFeatureKind[];
  visualIntent: string;
};
