/** Clears optimistic pending if route navigation stalls (800–1200ms window). */
export const PENDING_ACTIVE_TIMEOUT_MS = 1_000;

/** Active pill follows confirmed route only — pending never moves the bubble. */
export function resolveVisualActiveId(activeId: string, _pendingItemId?: string | null): string {
  return activeId;
}

export function isBottomNavItemPending(
  itemId: string,
  activeId: string,
  pendingItemId: string | null,
): boolean {
  return pendingItemId === itemId && pendingItemId !== activeId;
}
