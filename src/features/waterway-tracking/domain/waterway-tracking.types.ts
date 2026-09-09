import type {
  WaterwayConstraint,
  WaterwayCorridor,
  WaterwayCorridorId,
  WaterwayConstraintSeverity,
  WaterwayConstraintType,
  WaterwayNavigabilityRisk,
  WaterwaySegment,
} from './waterway-corridor.types';

export type {
  WaterwayConstraint,
  WaterwayCorridor,
  WaterwayCorridorId,
  WaterwayConstraintSeverity,
  WaterwayConstraintType,
  WaterwayNavigabilityRisk,
  WaterwaySegment,
};

export type CargoLifecycleStatus =
  | 'open'
  | 'bidding'
  | 'contracting'
  | 'reserved'
  | 'boarded'
  | 'delivered';

export type WaterwayRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type WaterwayOperationalStatus =
  | 'on-time'
  | 'attention'
  | 'delayed'
  | 'restricted'
  | 'contingency';

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

export type CargoWaterwayTracking = {
  id: string;
  cargoId: string;
  cargoStatus: CargoLifecycleStatus;
  title: string;
  corridorId: WaterwayCorridorId;
  segmentId: string;
  cargoType: string;
  priorityLevel: 'low' | 'normal' | 'high' | 'critical';
  priority: 'low' | 'normal' | 'high' | 'critical';
  operationalStatus: WaterwayOperationalStatus;
  status: WaterwayOperationalStatus;
  riskLevel: WaterwayRiskLevel;
  originTerminal: string;
  destinationTerminal: string;
  vesselName: string;
  route: {
    origin: WaterwayRoutePoint;
    destination: WaterwayRoutePoint;
    currentDescription: string;
    segmentLabel: string;
  };
  vessel: WaterwayVessel;
  metrics: CargoWaterwayMetrics;
  progressPercent: number;
  remainingPercent: number;
  eta: string;
  signalPercent: number;
  documentsReadyPercent: number;
  estimatedCost: number;
  co2SavingsPercent: number;
  constraints: WaterwayConstraint[];
  map: {
    primaryRiverLabel: string;
    secondaryRiverLabel: string;
    placeLabels: string[];
  };
};

export type CargoWaterwayTrackingScenario = CargoWaterwayTracking;

export type WaterwayDomainSnapshot = {
  corridors: WaterwayCorridor[];
  segments: WaterwaySegment[];
  tracking: CargoWaterwayTracking[];
};
