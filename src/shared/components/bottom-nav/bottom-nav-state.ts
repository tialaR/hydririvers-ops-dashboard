/** Clears optimistic active if route navigation stalls (800–1200ms window). */
export const PENDING_ACTIVE_TIMEOUT_MS = 1_000;

export function resolveVisualActiveId(activeId: string, pendingItemId: string | null): string {
  return pendingItemId != null && pendingItemId !== activeId ? pendingItemId : activeId;
}

export function isBottomNavItemPending(
  itemId: string,
  activeId: string,
  pendingItemId: string | null,
): boolean {
  return pendingItemId === itemId && pendingItemId !== activeId;
}
