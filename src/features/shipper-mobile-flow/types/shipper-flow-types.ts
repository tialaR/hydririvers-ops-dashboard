export type ShipperRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ShipperCargoStatus = 'open' | 'inTransit' | 'attention' | 'delivered' | 'blocked';

export type ShipperFreshnessState = 'fresh' | 'stale' | 'offline';

export type ShipperCorridorId = 'amazonas-solimoes' | 'madeira' | 'tapajos' | 'tocantins-araguaia';

export type ShipperPhoneCountryCode = '+55' | '+34' | '+1';

export type ShipperDocumentStatus = 'ok' | 'pending' | 'blocked' | 'expiring';

export type ShipperCtaState = 'idle' | 'pressed' | 'loading' | 'success' | 'error' | 'disabled';

export type ShipperBottomNavId = 'cockpit' | 'publicCargoes' | 'myCargoes' | 'notifications' | 'profile';

export type ShipperUser = {
  id: string;
  name: string;
  company: string;
  role: 'shipper';
  avatarInitials: string;
  locale: string;
};

export type ShipperPhoneCountry = {
  code: ShipperPhoneCountryCode;
  labelKey: string;
  placeholderKey: string;
};

export type ShipperPublicCargo = {
  id: string;
  corridorId: ShipperCorridorId;
  origin: string;
  destination: string;
  cargoTypeKey: string;
  windowLabelKey: string;
  statusKey: string;
  riskLevel: ShipperRiskLevel;
};

export type ShipperOwnedCargo = {
  id: string;
  code: string;
  corridorId: ShipperCorridorId;
  origin: string;
  destination: string;
  status: ShipperCargoStatus;
  riskLevel: ShipperRiskLevel;
  freshnessMinutes: number;
  freshnessState: ShipperFreshnessState;
  etaHours: number;
  offersCount: number;
  pendingDocsCount: number;
};

export type ShipperDocument = {
  id: string;
  nameKey: string;
  status: ShipperDocumentStatus;
  dueLabelKey?: string;
};

export type ShipperOffer = {
  id: string;
  labelKey: string;
  partnerKey: string;
  etaHours: number;
  pricePerTonLabel: string;
  recommended?: boolean;
};

export type ShipperNotification = {
  id: string;
  severity: ShipperRiskLevel;
  titleKey: string;
  bodyKey: string;
  timeLabelKey: string;
};

export type ShipperHydrologyBasin = {
  id: string;
  nameKey: string;
  draftMeters: number;
  trendKey: string;
  status: ShipperRiskLevel;
};

export type ShipperChartPoint = {
  label: string;
  value: number;
};

export type ShipperImpactMetric = {
  id: string;
  labelKey: string;
  valueLabel: string;
};

export type ShipperCockpitMetric = {
  id: string;
  labelKey: string;
  value: string;
  hintKey: string;
};
