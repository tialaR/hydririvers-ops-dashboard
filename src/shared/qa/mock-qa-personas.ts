import { toQaPersonas } from '@/shared/mock-data/mock-user-registry';

export type { MockQaPersona, MockQaPersonaId } from '@/shared/mock-data/mock-user-registry';

/** Personas visíveis no QA Hub — derivadas do registry canônico. */
export const MOCK_QA_PERSONAS = toQaPersonas();
