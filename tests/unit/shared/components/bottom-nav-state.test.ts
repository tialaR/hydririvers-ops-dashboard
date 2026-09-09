import { describe, expect, it } from 'vitest';

import {
  PENDING_ACTIVE_TIMEOUT_MS,
  isBottomNavItemPending,
  resolveVisualActiveId,
} from '@/shared/components/bottom-nav/bottom-nav-state';

describe('bottom-nav-state', () => {
  it('resolveVisualActiveId usa somente a rota confirmada', () => {
    expect(resolveVisualActiveId('cargos', 'negotiations')).toBe('cargos');
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

  it('clique pendente não troca active visual antes da rota confirmar', () => {
    const routeActiveId = 'cargos';
    const pendingItemId = 'negotiations';

    expect(resolveVisualActiveId(routeActiveId, pendingItemId)).toBe(routeActiveId);
    expect(isBottomNavItemPending('negotiations', routeActiveId, pendingItemId)).toBe(true);
    expect(isBottomNavItemPending('cargos', routeActiveId, pendingItemId)).toBe(false);
  });

  it('layoutId da pill ativa ignora pendingItemId', () => {
    expect(resolveVisualActiveId('cargos', 'negotiations')).toBe('cargos');
    expect(resolveVisualActiveId('negotiations', 'cargos')).toBe('negotiations');
  });

  it('quando pathname confirma destino, active troca e pending deixa de aplicar', () => {
    const confirmedActiveId = 'negotiations';

    expect(resolveVisualActiveId(confirmedActiveId, null)).toBe(confirmedActiveId);
    expect(isBottomNavItemPending('negotiations', confirmedActiveId, null)).toBe(false);
    expect(isBottomNavItemPending('negotiations', confirmedActiveId, 'negotiations')).toBe(false);
  });
});
