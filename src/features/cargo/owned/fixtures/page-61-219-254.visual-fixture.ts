import type { OwnedCargo } from '@/features/cargo/owned/domain/owned-cargo-types';

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
