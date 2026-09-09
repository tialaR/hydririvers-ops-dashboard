export type NegotiationDocumentStatus = 'pending' | 'verified' | 'attention' | 'unknown';

export function getNegotiationDocumentStatus(label: string): NegotiationDocumentStatus {
  const normalized = label.toLowerCase();

  if (
    normalized.includes('pendente') ||
    normalized.includes('pending') ||
    normalized.includes('pendiente') ||
    normalized.includes('emissão') ||
    normalized.includes('emision')
  ) {
    return 'pending';
  }
  if (
    normalized.includes('validado') ||
    normalized.includes('verified') ||
    normalized.includes('revisada') ||
    normalized.includes('revisado') ||
    normalized.includes(' ok') ||
    normalized.endsWith('ok')
  ) {
    return 'verified';
  }
  if (
    normalized.includes('atenção') ||
    normalized.includes('attention') ||
    normalized.includes('alerta') ||
    normalized.includes('revisão') ||
    normalized.includes('revision') ||
    normalized.includes('revisión')
  ) {
    return 'attention';
  }

  return 'unknown';
}

