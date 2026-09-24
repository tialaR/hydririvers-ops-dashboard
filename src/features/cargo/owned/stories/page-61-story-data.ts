import {
  buildOwnedCargoDesktopViewModel,
  type OwnedCargoDesktopCopy,
} from '@/features/cargo/owned/application/owned-cargo-desktop-view-model';
import {
  getPage61219254DesktopFacts,
  page61219254VisualCargoes,
} from '@/features/cargo/owned/fixtures/page-61-219-254.visual-fixture';

const page61StoryCopy: OwnedCargoDesktopCopy = {
  status: {
    open: 'Aberta',
    inTransit: 'Em trânsito',
    attention: 'Em atenção',
    delivered: 'Entregue',
    blocked: 'Bloqueada',
  },
  corridor: {
    'amazonas-solimoes': 'Amazonas / Solimões',
    madeira: 'Rio Madeira',
    tapajos: 'Rio Tapajós',
    'tocantins-araguaia': 'Tocantins / Araguaia',
  },
  risk: {
    low: 'Risco baixo',
    medium: 'Risco médio',
    high: 'Risco alto',
    critical: 'Risco crítico',
  },
  freshness: {
    fresh: 'Atualizado',
    stale: 'Desatualizado',
    offline: 'Offline',
  },
  cargoLabel: 'Carga',
  vesselLabel: 'Embarcação',
  corridorLabel: 'Corredor operacional',
  attentionEyebrow: 'Atenção operacional',
  attentionTitle: 'Há pendências que exigem revisão antes do próximo marco.',
  attentionBody: 'Resolva pendências antes da janela operacional.',
  attentionAction: 'Revisar agora',
  fitRoute: 'Centralizar rota',
  liveSignal: 'Atualizado',
  normalRiver: 'Risco baixo',
  docs: (count) => `${count} docs`,
  eta: (hours) => `${hours}h`,
  updated: (minutes) => `Atualizado há ${minutes} min`,
};

export const page61StoryViewModels = page61219254VisualCargoes.map((cargo) =>
  buildOwnedCargoDesktopViewModel(
    cargo,
    page61StoryCopy,
    getPage61219254DesktopFacts(cargo),
  ),
);
