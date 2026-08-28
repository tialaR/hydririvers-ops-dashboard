export type OwnedCargoRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type OwnedCargoStatus = 'open' | 'inTransit' | 'attention' | 'delivered' | 'blocked';
export type OwnedCargoFreshnessState = 'fresh' | 'stale' | 'offline';
export type CargoCorridorId = 'amazonas-solimoes' | 'madeira' | 'tapajos' | 'tocantins-araguaia';
export type CargoDocumentStatus = 'ok' | 'pending' | 'blocked' | 'expiring';

export type OwnedCargo = {
  id: string;
  code: string;
  corridorId: CargoCorridorId;
  origin: string;
  destination: string;
  status: OwnedCargoStatus;
  riskLevel: OwnedCargoRiskLevel;
  freshnessMinutes: number;
  freshnessState: OwnedCargoFreshnessState;
  etaHours: number;
  offersCount: number;
  pendingDocsCount: number;
};

export type CargoDocument = {
  id: string;
  nameKey: string;
  status: CargoDocumentStatus;
  dueLabelKey?: string;
};

export type CargoOffer = {
  id: string;
  labelKey: string;
  partnerKey: string;
  etaHours: number;
  pricePerTonLabel: string;
  recommended?: boolean;
};


export type OwnedCargoChartPoint = {
  label: string;
  value: number;
};

export type OwnedCargoCockpitMetric = {
  id: string;
  labelKey: string;
  value: string;
  hintKey: string;
};
