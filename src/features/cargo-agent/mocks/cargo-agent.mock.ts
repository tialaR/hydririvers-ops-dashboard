import type { CargoAgentInput } from '../types/cargo-agent.types';

export const cargoAgentMock: CargoAgentInput = {
  userId: 'user-001',
  role: 'shipper',
  cargoId: 'cargo-001',
  route: 'Belém → Santarém',
  activeTab: 'overview',
  locale: 'pt-BR',
  theme: 'dark',
  pendingDocuments: 2,
  selectedCargoStatus: 'open',
  timelineSummary: '2 de 5 etapas concluídas',
  costSummary: 'Economia estimada de 18%'
};

