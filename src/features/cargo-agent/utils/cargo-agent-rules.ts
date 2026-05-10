import type { CargoAgentInput, CargoAgentResponse } from '../types/cargo-agent.types';

export function resolveCargoAgentResponse(input: CargoAgentInput): CargoAgentResponse {
  const pendingDocuments = input.pendingDocuments ?? 0;

  if (pendingDocuments > 0) {
    return {
      intent: 'documentChecklist',
      message: pendingDocuments === 1
        ? 'Essa carga ainda precisa de 1 documento para seguir sem atraso.'
        : `Essa carga ainda precisa de ${pendingDocuments} documentos para seguir sem atraso.`,
      suggestions: [
        { label: 'Ver documentos', action: 'OPEN_DOCUMENTS', href: input.cargoId ? `/cargas/${input.cargoId}` : undefined },
        { label: 'Entendi', action: 'DISMISS' }
      ],
      severity: 'warning',
      requiresConfirmation: false,
      canExecuteAction: false
    };
  }

  if (input.selectedCargoStatus === 'boarded') {
    return {
      intent: 'explainCargoStatus',
      message: 'A carga já está em trânsito e o acompanhamento está ativo.',
      suggestions: [
        { label: 'Ver jornada', action: 'OPEN_TIMELINE', href: input.cargoId ? `/cargas/${input.cargoId}` : undefined },
        { label: 'Abrir mapa', action: 'OPEN_MAP' }
      ],
      severity: 'success',
      requiresConfirmation: false,
      canExecuteAction: false
    };
  }

  return {
    intent: 'unknown',
    message: 'Posso te ajudar a ver o que falta nessa carga.',
    suggestions: [
      { label: 'Ver documentos', action: 'OPEN_DOCUMENTS', href: input.cargoId ? `/cargas/${input.cargoId}` : undefined },
      { label: 'Ver custos', action: 'OPEN_COST' }
    ],
    severity: 'info',
    requiresConfirmation: false,
    canExecuteAction: false
  };
}

