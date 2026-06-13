import { describe, expect, it } from 'vitest';
import { defaultUsers } from '@/features/auth/data/auth.mock';
import { MOCK_QA_PERSONAS } from '@/shared/qa/mock-qa-personas';
import {
  MOCK_PUBLIC_VISITOR,
  MOCK_USER_REGISTRY,
  findSeedPhoneByEmail,
  getMockUserByEmail,
  getMockUserById,
  getMockUserByPhone,
  getMockUsersVisibleInQaHub,
  getQaDirectLoginEmails,
  isValidE164,
  toHydroUsers,
  toQaPersonas
} from '@/shared/mock-data/mock-user-registry';

describe('mock-user-registry', () => {
  it('garante unicidade de id, qaPersonaId, email e phoneE164', () => {
    const ids = MOCK_USER_REGISTRY.map((u) => u.id);
    const personaIds = MOCK_USER_REGISTRY.map((u) => u.qaPersonaId);
    const emails = MOCK_USER_REGISTRY.map((u) => u.email.toLowerCase());
    const phones = MOCK_USER_REGISTRY.map((u) => u.phoneE164);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(personaIds).size).toBe(personaIds.length);
    expect(new Set(emails).size).toBe(emails.length);
    expect(new Set(phones).size).toBe(phones.length);
  });

  it('exige firstName, lastName e telefone E.164 válido', () => {
    for (const user of MOCK_USER_REGISTRY) {
      expect(user.firstName.trim()).not.toBe('');
      expect(user.lastName.trim()).not.toBe('');
      expect(isValidE164(user.phoneE164)).toBe(true);
    }
  });

  it('mantém country e locale coerentes por contexto', () => {
    const br = MOCK_USER_REGISTRY.filter((u) => u.country === 'BR');
    const us = MOCK_USER_REGISTRY.filter((u) => u.country === 'US');
    const es = MOCK_USER_REGISTRY.filter((u) => u.country === 'ES');

    expect(br.length).toBeGreaterThanOrEqual(3);
    expect(us.length).toBeGreaterThanOrEqual(3);
    expect(es.length).toBeGreaterThanOrEqual(3);

    for (const user of br) expect(user.locale).toBe('pt-BR');
    for (const user of us) expect(user.locale).toBe('en-US');
    for (const user of es) expect(user.locale).toBe('es');
  });

  it('preserva usuários BR principais', () => {
    const preserved = ['u-shipper-1', 'u-shipper-2', 'u-carrier-1', 'u-carrier-2', 'u-carrier-3', 'u-admin-1'];
    for (const id of preserved) {
      expect(getMockUserById(id)).toBeDefined();
    }
  });

  it('inclui usuários US e ES mínimos', () => {
    expect(getMockUserById('u-us-shipper-1')).toMatchObject({ qaPersonaId: 'emily-hartwell' });
    expect(getMockUserById('u-es-shipper-1')).toMatchObject({ qaPersonaId: 'lucia-morales' });
  });

  it('mantém pending users como não aprovados em HydroUser', () => {
    const pendingIds = ['u-carrier-3', 'u-us-carrier-2', 'u-es-carrier-2'];
    const hydro = toHydroUsers();
    for (const id of pendingIds) {
      const user = hydro.find((u) => u.id === id);
      expect(user?.approved).toBe(false);
    }
  });

  it('deriva defaultUsers com todos autenticados do registry', () => {
    expect(defaultUsers).toHaveLength(MOCK_USER_REGISTRY.length);
    expect(defaultUsers.map((u) => u.id).sort()).toEqual(MOCK_USER_REGISTRY.map((u) => u.id).sort());
  });

  it('deriva MOCK_QA_PERSONAS somente de qaHubVisible', () => {
    const visible = getMockUsersVisibleInQaHub();
    expect(MOCK_QA_PERSONAS).toHaveLength(visible.length);
    expect(toQaPersonas().map((p) => p.id).sort()).toEqual(visible.map((u) => u.qaPersonaId).sort());
  });

  it('inclui Mariana no hub QA', () => {
    expect(MOCK_QA_PERSONAS.some((p) => p.id === 'mariana')).toBe(true);
    expect(getMockUserByEmail('mariana@bioamazonia.coop')?.qaHubVisible).toBe(true);
  });

  it('deriva whitelist de QA direct login pelos flags do registry', () => {
    const allowed = getQaDirectLoginEmails().map((e) => e.toLowerCase()).sort();
    const expected = MOCK_USER_REGISTRY.filter((u) => u.qaDirectLoginAllowed)
      .map((u) => u.email.toLowerCase())
      .sort();
    expect(allowed).toEqual(expected);
  });

  it('expõe helpers de lookup por email, telefone e id', () => {
    expect(getMockUserByEmail('tiala@hydrorivers.com')?.id).toBe('u-shipper-1');
    expect(getMockUserByPhone('+5591999990001')?.qaPersonaId).toBe('tiala');
    expect(findSeedPhoneByEmail('joao@naveganorte.com')).toEqual({
      countryCode: '+55',
      phone: '+5592999990002'
    });
  });

  it('mantém visitante fora do array autenticado', () => {
    expect(MOCK_PUBLIC_VISITOR.id).toBe('visitor');
    expect(MOCK_USER_REGISTRY.some((u) => u.id === 'visitor')).toBe(false);
    expect(MOCK_PUBLIC_VISITOR.blockedRoutes).toContain('/minhas-cargas');
    expect(MOCK_PUBLIC_VISITOR.primaryRoutes).toContain('/cargas');
  });
});
