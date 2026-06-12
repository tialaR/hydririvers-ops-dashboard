import { describe, expect, it } from 'vitest';
import { MOCK_QA_PERSONAS } from '@/shared/qa/mock-qa-personas';
import { defaultUsers } from '@/features/auth/data/auth.mock';
import { MOCK_USER_REGISTRY } from '@/shared/mock-data/mock-user-registry';

describe('mock-qa-personas', () => {
  it('lista contém personas visíveis no hub alinhadas ao mock', () => {
    const hubVisibleCount = MOCK_USER_REGISTRY.filter((u) => u.qaHubVisible).length;
    expect(MOCK_QA_PERSONAS).toHaveLength(hubVisibleCount);

    const byEmail = new Map(defaultUsers.map((u) => [u.email.toLowerCase(), u]));
    for (const p of MOCK_QA_PERSONAS) {
      const u = byEmail.get(p.email.toLowerCase());
      expect(u).toBeDefined();
      expect(u!.id).toBe(p.mockUserId);
      expect(u!.role).toBe(p.role);
      expect(u!.approved).toBe(p.approved);
    }
  });

  it('inclui Mariana Tapajós no hub', () => {
    expect(MOCK_QA_PERSONAS.some((p) => p.id === 'mariana' && p.mockUserId === 'u-shipper-2')).toBe(true);
  });
});
