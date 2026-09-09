export type PublicCargoRiskLevel = 'low' | 'medium' | 'high';

export type PublicCargoRecord = {
  id: string;
  corridorId: string;
  origin: string;
  destination: string;
  cargoTypeKey: string;
  windowLabelKey: string;
  statusKey: string;
  riskLevel: PublicCargoRiskLevel;
};

/** Public read model. Intentionally contains only fields safe for anonymous routes. */
export type PublicCargoSafeView = PublicCargoRecord;
