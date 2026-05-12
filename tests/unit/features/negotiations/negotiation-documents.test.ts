import { describe, expect, it } from 'vitest';
import { getNegotiationDocumentStatus } from '@/features/negotiations/domain/negotiation-documents';

describe('getNegotiationDocumentStatus', () => {
  it('classifica pendente/validado/atencao de forma deterministica', () => {
    expect(getNegotiationDocumentStatus('NF-e pendente de anexação')).toBe('pending');
    expect(getNegotiationDocumentStatus('Romaneio validado')).toBe('verified');
    expect(getNegotiationDocumentStatus('Atenção: autorização de carga')).toBe('attention');
    expect(getNegotiationDocumentStatus('CT-e em emissão')).toBe('pending');
  });
});

