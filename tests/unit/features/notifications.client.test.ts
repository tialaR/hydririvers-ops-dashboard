import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearNotificationsCache,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
  getNotificationsServerSnapshot,
  notificationsChangedEvent,
  readNotifications,
  resetNotifications
} from '@/features/notifications/services/notifications.client';

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };
}

describe('notifications.client', () => {
  const localStorage = createLocalStorageMock();
  const dispatchEvent = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    dispatchEvent.mockClear();
    clearNotificationsCache();
    vi.stubGlobal('window', {
      localStorage,
      dispatchEvent
    } as unknown as Window);
    vi.stubGlobal('CustomEvent', class CustomEvent {
      type: string;

      constructor(type: string) {
        this.type = type;
      }
    } as never);
  });

  it('seeds a stable notification list per user', () => {
    const alice = readNotifications('user-a');
    const aliceAgain = readNotifications('user-a');
    const bob = readNotifications('user-b');

    expect(alice).toEqual(aliceAgain);
    expect(alice).toBe(aliceAgain);
    expect(alice.map((notification) => notification.userId)).toEqual(Array(alice.length).fill('user-a'));
    expect(bob).not.toEqual(alice);
    expect(getUnreadNotificationsCount(alice)).toBe(alice.length);
  });

  it('exposes a stable server snapshot reference', () => {
    const first = getNotificationsServerSnapshot();
    const second = getNotificationsServerSnapshot();

    expect(first).toBe(second);
    expect(first).toHaveLength(0);
  });

  it('marks all notifications as read and persists the state', () => {
    const initial = readNotifications('user-a');
    expect(getUnreadNotificationsCount(initial)).toBeGreaterThan(0);

    const next = markAllNotificationsRead('user-a');
    expect(next.every((notification) => notification.read)).toBe(true);
    expect(getUnreadNotificationsCount(next)).toBe(0);
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: notificationsChangedEvent }));

    const stored = readNotifications('user-a');
    expect(stored.every((notification) => notification.read)).toBe(true);
    expect(stored).toBe(next);
  });

  it('resets notifications to the seeded unread state', () => {
    const initial = readNotifications('user-a');
    markAllNotificationsRead('user-a');

    const reset = resetNotifications('user-a');

    expect(reset).toHaveLength(initial.length);
    expect(reset.every((notification) => notification.read)).toBe(false);
    expect(getUnreadNotificationsCount(reset)).toBe(reset.length);
    expect(readNotifications('user-a')).toBe(reset);
  });

  it('marks a single notification as read without altering the rest', () => {
    const initial = readNotifications('user-a');
    const targetId = initial[0]?.id;
    expect(targetId).toBeTruthy();
    if (!targetId) return;

    const next = markNotificationRead(targetId, 'user-a');

    expect(next.find((notification) => notification.id === targetId)?.read).toBe(true);
    expect(next.filter((notification) => notification.read)).toHaveLength(1);
  });
});
