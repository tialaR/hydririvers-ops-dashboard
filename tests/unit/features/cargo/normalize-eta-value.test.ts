import { describe, expect, it } from 'vitest';

import { normalizeEtaValue, stripEtaPrefix } from '@/features/cargo/utils/normalize-eta-value';

describe('normalizeEtaValue', () => {
  it('remove prefixo ETA do valor exibido', () => {
    expect(stripEtaPrefix('ETA 30–42h')).toBe('30–42h');
    expect(stripEtaPrefix('eta 4–7 dias')).toBe('4–7 dias');
    expect(normalizeEtaValue('ETA ETA 30–42h')).toBe('30–42h');
  });

  it('preserva valor sem prefixo ETA', () => {
    expect(normalizeEtaValue('24 Mai, 14:00')).toBe('24 Mai, 14:00');
    expect(normalizeEtaValue(undefined)).toBe('');
  });
});
