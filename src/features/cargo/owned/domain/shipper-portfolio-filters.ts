import type {
  ShipperJourneySnapshot,
  ShipperPortfolioFilters,
} from '@/features/cargo/owned/domain/shipper-journey.types';

export const EMPTY_SHIPPER_PORTFOLIO_FILTERS: ShipperPortfolioFilters = {
  query: '',
  status: [],
  actionRequired: [],
  corridor: [],
  origin: [],
  destination: [],
  cargoType: [],
  risk: [],
  navigability: [],
  documentState: [],
  freshness: [],
  etaWindow: [],
  openOccurrence: null,
  carrier: [],
};

export type ShipperFilterFacet = {
  key: keyof ShipperPortfolioFilters;
  label: string;
  reason: string;
  source: 'cargo' | 'hydrology' | 'documents' | 'occurrences' | 'commercial';
};

export const SHIPPER_FILTER_FACETS: ShipperFilterFacet[] = [
  { key: 'status', label: 'Status da carga', reason: 'Separa etapa operacional e comercial.', source: 'cargo' },
  { key: 'actionRequired', label: 'Ação requerida', reason: 'Prioriza o trabalho que exige resposta humana.', source: 'occurrences' },
  { key: 'corridor', label: 'Corredor hidroviário', reason: 'Agrupa operação por hidrovia/trecho.', source: 'hydrology' },
  { key: 'origin', label: 'Origem', reason: 'Permite localizar carteira e janela operacional.', source: 'cargo' },
  { key: 'destination', label: 'Destino / terminal', reason: 'Permite localizar entrega e próximo marco.', source: 'cargo' },
  { key: 'cargoType', label: 'Tipo de carga', reason: 'Muda compatibilidade, documentos e risco.', source: 'cargo' },
  { key: 'risk', label: 'Risco operacional', reason: 'Traz exceções críticas para cima.', source: 'occurrences' },
  { key: 'navigability', label: 'Condição de navegabilidade', reason: 'Expõe restrição hidroviária relevante.', source: 'hydrology' },
  { key: 'documentState', label: 'Prontidão documental', reason: 'Localiza pendência, divergência ou bloqueio.', source: 'documents' },
  { key: 'freshness', label: 'Freshness / sinal', reason: 'Evita tratar dado velho como atual.', source: 'hydrology' },
  { key: 'etaWindow', label: 'Janela de ETA', reason: 'Prioriza entregas e marcos próximos.', source: 'cargo' },
  { key: 'openOccurrence', label: 'Ocorrência aberta', reason: 'Filtra cargas com mitigação ativa.', source: 'occurrences' },
  { key: 'carrier', label: 'Transportador / operador', reason: 'Agrupa responsabilidade operacional/comercial.', source: 'commercial' },
];

export function validateJourneySnapshot(snapshot: ShipperJourneySnapshot): string[] {
  const failures: string[] = [];
  const sourceIds = new Set(snapshot.sources.map((source) => source.id));

  if (snapshot.mode !== 'demo') failures.push('Page 62 mock snapshot must be explicitly DEMO.');

  if (!sourceIds.has(snapshot.hydro.sourceId)) {
    failures.push(`Hydro source missing: ${snapshot.hydro.sourceId}`);
  }

  for (const constraint of snapshot.hydro.constraints) {
    if (!sourceIds.has(constraint.sourceId)) failures.push(`Constraint source missing: ${constraint.sourceId}`);
  }

  for (const document of snapshot.documents) {
    if (document.state === 'divergent' && (!document.observedValue || !document.expectedValue)) {
      failures.push(`Divergent document must expose observed and expected values: ${document.id}`);
    }
  }

  for (const occurrence of snapshot.occurrences) {
    if (!occurrence.evidenceIds.length) failures.push(`Occurrence must be evidence-linked: ${occurrence.id}`);
    if (!occurrence.mitigationSteps.length) failures.push(`Occurrence must expose mitigation: ${occurrence.id}`);
  }

  for (const proposal of snapshot.proposals) {
    if (!proposal.validityAt) failures.push(`Proposal must expose validity: ${proposal.id}`);
  }

  return failures;
}
