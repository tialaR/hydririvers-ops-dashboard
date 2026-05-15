export type WaterwayCorridorId =
  | 'amazonas'
  | 'madeira'
  | 'tapajos-teles-pires'
  | 'tocantins-araguaia'
  | 'barra-norte';

export type WaterwayConcessionStatus = 'none' | 'planned' | 'bidding' | 'active' | 'unknown';

export type WaterwayConstraintType =
  | 'drought'
  | 'draft'
  | 'dredging'
  | 'signaling'
  | 'traffic'
  | 'port-window'
  | 'document'
  | 'sla'
  | 'institutional';

export type WaterwayConstraintSeverity = 'info' | 'warning' | 'critical';

export type WaterwayNavigabilityRisk = 'low' | 'medium' | 'high' | 'critical';

export type WaterwayConstraint = {
  id: string;
  type: WaterwayConstraintType;
  severity: WaterwayConstraintSeverity;
  title: string;
  description: string;
};

export type WaterwaySegment = {
  id: string;
  corridorId: WaterwayCorridorId;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  navigabilityRisk: WaterwayNavigabilityRisk;
  constraints: WaterwayConstraint[];
};

export type WaterwayCorridor = {
  id: WaterwayCorridorId;
  name: string;
  region: string;
  mainRivers: string[];
  strategicRole: string;
  concessionStatus: WaterwayConcessionStatus;
  referenceLabels: string[];
  segments: WaterwaySegment[];
};
