import type { CargoDocument, CargoOffer, OwnedCargo, OwnedCargoChartPoint, OwnedCargoCockpitMetric } from '@/features/cargo/owned/domain/owned-cargo-types';

export const DEFAULT_OWNED_CARGO_ID = 'hr-4821';

export const OWNED_CARGOES: OwnedCargo[] = [
  { id: 'hr-4821', code: 'HR-4821', corridorId: 'madeira', origin: 'Porto Velho', destination: 'Miritituba / Itaituba', status: 'attention', riskLevel: 'high', freshnessMinutes: 12, freshnessState: 'fresh', etaHours: 15, offersCount: 3, pendingDocsCount: 1 },
  { id: 'hr-4770', code: 'HR-4770', corridorId: 'amazonas-solimoes', origin: 'Santarém', destination: 'Manaus / Chibatão', status: 'inTransit', riskLevel: 'medium', freshnessMinutes: 28, freshnessState: 'fresh', etaHours: 22, offersCount: 0, pendingDocsCount: 0 },
  { id: 'hr-4699', code: 'HR-4699', corridorId: 'tapajos', origin: 'Miritituba / Itaituba', destination: 'Santarém', status: 'open', riskLevel: 'low', freshnessMinutes: 90, freshnessState: 'stale', etaHours: 18, offersCount: 1, pendingDocsCount: 2 }
];

export const OWNED_CARGO_DOCUMENTS: CargoDocument[] = [
  { id: 'doc-cte', nameKey: 'cte', status: 'ok' },
  { id: 'doc-env', nameKey: 'environmentalLicense', status: 'expiring', dueLabelKey: 'dueToday' },
  { id: 'doc-manifest', nameKey: 'manifest', status: 'pending' },
  { id: 'doc-insurance', nameKey: 'insurance', status: 'blocked', dueLabelKey: 'blocking' }
];

export const OWNED_CARGO_OFFERS: CargoOffer[] = [
  { id: 'offer-a', labelKey: 'offerA', partnerKey: 'partnerA', etaHours: 14, pricePerTonLabel: 'R$ —', recommended: true },
  { id: 'offer-b', labelKey: 'offerB', partnerKey: 'partnerB', etaHours: 16, pricePerTonLabel: 'R$ —' },
  { id: 'offer-c', labelKey: 'offerC', partnerKey: 'partnerC', etaHours: 18, pricePerTonLabel: 'R$ —' }
];

export const OWNED_CARGO_COCKPIT_METRICS: OwnedCargoCockpitMetric[] = [
  { id: 'cargoes', labelKey: 'metrics.cargoes', value: '3', hintKey: 'metrics.cargoesHint' },
  { id: 'docs', labelKey: 'metrics.docs', value: '2', hintKey: 'metrics.docsHint' },
  { id: 'eta', labelKey: 'metrics.eta', value: '15h', hintKey: 'metrics.etaHint' },
  { id: 'co2', labelKey: 'metrics.co2', value: '38%', hintKey: 'metrics.co2Hint' }
];

export const OWNED_CARGO_COCKPIT_TREND: OwnedCargoChartPoint[] = [
  { label: 'Seg', value: 1 }, { label: 'Ter', value: 1 }, { label: 'Qua', value: 2 },
  { label: 'Qui', value: 2 }, { label: 'Sex', value: 3 }, { label: 'Sáb', value: 2 }, { label: 'Hoje', value: 3 }
];
