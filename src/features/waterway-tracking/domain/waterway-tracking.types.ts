export type WaterwayCorridorId =
  | 'amazonas'
  | 'tapajos'
  | 'madeira'
  | 'tocantins-araguaia'
  | 'barra-norte';

export type WaterwayRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type WaterwayOperationalStatus =
  | 'on-time'
  | 'attention'
  | 'delayed'
  | 'restricted'
  | 'contingency';

export type WaterwayConstraintType =
  | 'drought'
  | 'draft'
  | 'dredging'
  | 'signaling'
  | 'traffic'
  | 'port-window'
  | 'documentation'
  | 'fuel'
  | 'security'
  | 'maintenance'
  | 'concession'
  | 'transshipment'
  | 'cold-chain'
  | 'hazmat';

export type WaterwayConstraint = {
  type: WaterwayConstraintType;
  severity: WaterwayRiskLevel;
  title: string;
  description: string;
};

export type WaterwayCorridor = {
  id: WaterwayCorridorId;
  name: string;
  region: string;
  mainRivers: string[];
  strategicRole: string;
  referenceLabels: string[];
  concessionStatus: 'none' | 'planned' | 'bidding' | 'active' | 'unknown';
};

export type WaterwayRoutePoint = {
  label: string;
  terminal: string;
  city: string;
  state: string;
  description: string;
};

export type WaterwayVessel = {
  name: string;
  kind: 'barge' | 'push-boat' | 'convoy' | 'fuel-barge' | 'reefer-barge';
  operator: string;
};

export type CargoWaterwayMetrics = {
  progressPercent: number;
  remainingPercent: number;
  etaLabel: string;
  distanceKm: number;
  signalPercent: number;
  documentsReadyPercent: number;
  estimatedCostBRL: number;
  co2SavingsPercent: number;
};

export type CargoWaterwayTrackingScenario = {
  id: string;
  cargoId: string;
  title: string;
  corridorId: WaterwayCorridorId;
  cargoType: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: WaterwayOperationalStatus;
  riskLevel: WaterwayRiskLevel;
  route: {
    origin: WaterwayRoutePoint;
    destination: WaterwayRoutePoint;
    currentDescription: string;
  };
  vessel: WaterwayVessel;
  metrics: CargoWaterwayMetrics;
  constraints: WaterwayConstraint[];
  map: {
    primaryRiverLabel: string;
    secondaryRiverLabel: string;
    placeLabels: string[];
  };
};
