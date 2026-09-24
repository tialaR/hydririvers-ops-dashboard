import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';
import type { OwnedCargoDesktopFacts } from '@/features/cargo/owned/application/owned-cargo-desktop-view-model';

export const PAGE_61_219_254_VISUAL_FIXTURE_ID = 'page61-219-254';

export const page61219254VisualCargoes: OwnedCargo[] = [
  { id: 'visual-hy-247-819', code: 'HY-247-819', corridorId: 'madeira', origin: 'Manaus, AM', destination: 'Santarém, PA', status: 'attention', riskLevel: 'medium', freshnessMinutes: 4, freshnessState: 'fresh', etaHours: 19, offersCount: 3, pendingDocsCount: 1 },
  { id: 'visual-hy-247-820', code: 'HY-247-820', corridorId: 'amazonas-solimoes', origin: 'Manaus, AM', destination: 'Santarém, PA', status: 'inTransit', riskLevel: 'low', freshnessMinutes: 8, freshnessState: 'fresh', etaHours: 20, offersCount: 2, pendingDocsCount: 0 },
  { id: 'visual-hy-247-821', code: 'HY-247-821', corridorId: 'tapajos', origin: 'Manaus, AM', destination: 'Santarém, PA', status: 'delivered', riskLevel: 'low', freshnessMinutes: 12, freshnessState: 'fresh', etaHours: 0, offersCount: 4, pendingDocsCount: 0 },
  { id: 'visual-hy-247-822', code: 'HY-247-822', corridorId: 'tocantins-araguaia', origin: 'Belém, PA', destination: 'Vila do Conde, PA', status: 'open', riskLevel: 'medium', freshnessMinutes: 6, freshnessState: 'fresh', etaHours: 16, offersCount: 1, pendingDocsCount: 0 }
];

export const page61219254SelectedVisualFacts = {
  originRegion: 'Amazonas,',
  originCity: 'Manaus',
  destinationRegion: 'Pará,',
  destinationCity: 'Santarém',
  cargoType: 'Equipamentos eletrônicos',
  totalWeight: '2.450 kg',
  vessel: 'Barcaça Aurora',
  carrier: 'Navega Amazônia',
  carrierReference: 'BR-PA-4821',
  progress: '65%',
  signal: 'Estável',
  river: 'Normal',
  nextMilestone: 'Santarém',
  nextMilestoneTime: '18:40',
  tabs: ['Overview', 'Rota', 'Carga', 'Documentos', 'Atividade'],
  carrierRole: 'Transportador',
  cardEta: '08:45',
  cardEtaDay: 'Hoje',
  attentionEyebrow: 'Atenção operacional',
  attentionTitle: 'Manifesto de carga precisa ser validado antes da chegada.',
  attentionBody: 'Sem a validação, a operação pode perder a janela de atracação prevista para 18:40.',
  attentionDocument: 'Documento pendente',
  attentionDeadline: 'Ação até 16:30',
  attentionAction: 'Abrir documentos'
} as const;

export const page61219254MapVisualFacts = {
  operation: 'HY-247-819 · Em trânsito',
  risk: 'Risco moderado',
  signal: 'Sinal ao vivo',
  signalDetail: 'GPS + AIS · atualizado há 4 min',
  river: 'Rio Madeira',
  riverDetail: 'faixa operacional normal',
  fitRoute: 'Enquadrar rota'
} as const;


export function getPage61219254DesktopFacts(cargo: OwnedCargo): OwnedCargoDesktopFacts {
  const base: OwnedCargoDesktopFacts = {
    codeLabel: '#HY-000-000',
    statusLabel:
      cargo.status === 'attention'
        ? 'Atrasada'
        : cargo.status === 'inTransit'
          ? 'Em trânsito'
          : cargo.status === 'delivered'
            ? 'Entregue'
            : 'Aberta',
    originRegion: page61219254SelectedVisualFacts.originRegion,
    originCity: page61219254SelectedVisualFacts.originCity,
    destinationRegion: page61219254SelectedVisualFacts.destinationRegion,
    destinationCity: page61219254SelectedVisualFacts.destinationCity,
    cargoType: page61219254SelectedVisualFacts.cargoType,
    cardEta: page61219254SelectedVisualFacts.cardEta,
    cardEtaDay: page61219254SelectedVisualFacts.cardEtaDay,
  };

  if (cargo.id !== page61219254VisualCargoes[0]?.id) return base;

  return {
    ...base,
    totalWeight: page61219254SelectedVisualFacts.totalWeight,
    vessel: page61219254SelectedVisualFacts.vessel,
    carrier: page61219254SelectedVisualFacts.carrier,
    carrierReference: page61219254SelectedVisualFacts.carrierReference,
    carrierRole: page61219254SelectedVisualFacts.carrierRole,
    progressLabel: page61219254SelectedVisualFacts.progress,
    signal: page61219254SelectedVisualFacts.signal,
    signalDetail: page61219254MapVisualFacts.signalDetail,
    river: page61219254SelectedVisualFacts.river,
    riverDetail: page61219254MapVisualFacts.riverDetail,
    nextMilestone: page61219254SelectedVisualFacts.nextMilestone,
    nextMilestoneTime: page61219254SelectedVisualFacts.nextMilestoneTime,
    attentionEyebrow: page61219254SelectedVisualFacts.attentionEyebrow,
    attentionTitle: page61219254SelectedVisualFacts.attentionTitle,
    attentionBody: page61219254SelectedVisualFacts.attentionBody,
    attentionDocument: page61219254SelectedVisualFacts.attentionDocument,
    attentionDeadline: page61219254SelectedVisualFacts.attentionDeadline,
    attentionAction: page61219254SelectedVisualFacts.attentionAction,
    mapOperation: page61219254MapVisualFacts.operation,
    mapRisk: page61219254MapVisualFacts.risk,
    mapSignal: page61219254MapVisualFacts.signal,
    mapSignalDetail: page61219254MapVisualFacts.signalDetail,
    mapRiver: page61219254MapVisualFacts.river,
    mapRiverDetail: page61219254MapVisualFacts.riverDetail,
    mapFitRoute: page61219254MapVisualFacts.fitRoute,
  };
}
