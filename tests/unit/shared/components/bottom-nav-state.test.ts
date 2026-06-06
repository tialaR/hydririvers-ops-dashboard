import { describe, expect, it } from 'vitest';

import {
  PENDING_ACTIVE_TIMEOUT_MS,
  isBottomNavItemPending,
  resolveVisualActiveId,
} from '@/shared/components/bottom-nav/bottom-nav-state';

describe('bottom-nav-state', () => {
  it('resolveVisualActiveId usa pending antes do active real', () => {
    expect(resolveVisualActiveId('cargos', 'negotiations')).toBe('negotiations');
    expect(resolveVisualActiveId('cargos', null)).toBe('cargos');
    expect(resolveVisualActiveId('cargos', 'cargos')).toBe('cargos');
  });

  it('isBottomNavItemPending só quando pending difere da rota', () => {
    expect(isBottomNavItemPending('negotiations', 'cargos', 'negotiations')).toBe(true);
    expect(isBottomNavItemPending('cargos', 'cargos', 'negotiations')).toBe(false);
    expect(isBottomNavItemPending('negotiations', 'cargos', null)).toBe(false);
  });

  it('timeout de pending fica na janela 800–1200ms', () => {
    expect(PENDING_ACTIVE_TIMEOUT_MS).toBeGreaterThanOrEqual(800);
    expect(PENDING_ACTIVE_TIMEOUT_MS).toBeLessThanOrEqual(1200);
  });
});
