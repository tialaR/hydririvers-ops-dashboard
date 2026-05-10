import { intlAppPaths } from '@/shared/routing/app-routes';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';
export type NotificationType =
  | 'documentPending'
  | 'berthUpdated'
  | 'negotiationReceived'
  | 'routeMonitored'
  | 'operationalAlert';

export type HydroNotification = {
  id: string;
  userId?: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  severity: NotificationSeverity;
  actionHref?: string;
  cargoId?: string;
  eta?: string;
  operatorName?: string;
  corridor?: string;
  location?: string;
};

const STORAGE_PREFIX = 'hydrorivers:notifications';
const CHANGE_EVENT = 'hydrorivers:notifications-changed';
const NOTIFICATION_BASE_TIMESTAMP = Date.UTC(2026, 4, 9, 12, 0, 0);
const EMPTY_NOTIFICATIONS_SNAPSHOT: HydroNotification[] = Object.freeze([]) as unknown as HydroNotification[];

type SeedTemplate = Omit<HydroNotification, 'id' | 'createdAt' | 'read' | 'userId'> & {
  idPrefix: string;
};

const seedTemplates: SeedTemplate[] = [
  {
    idPrefix: 'document-pending',
    type: 'documentPending',
    severity: 'warning',
    actionHref: intlAppPaths.cargos.myCargos,
    cargoId: 'CARGO-002'
  },
  {
    idPrefix: 'berth-updated',
    type: 'berthUpdated',
    severity: 'info',
    actionHref: intlAppPaths.dashboard.home,
    cargoId: 'CARGO-004',
    eta: '06/06/2026 08:30'
  },
  {
    idPrefix: 'negotiation-received',
    type: 'negotiationReceived',
    severity: 'success',
    actionHref: intlAppPaths.negotiations.home,
    operatorName: 'FrioRios'
  },
  {
    idPrefix: 'route-monitored',
    type: 'routeMonitored',
    severity: 'info',
    actionHref: intlAppPaths.dashboard.home,
    cargoId: 'CARGO-001',
    corridor: 'Belém–Santarém'
  },
  {
    idPrefix: 'operational-alert',
    type: 'operationalAlert',
    severity: 'error',
    actionHref: intlAppPaths.tracking.home,
    cargoId: 'CARGO-003',
    location: 'Santarém'
  }
];

const notificationCache = new Map<string, HydroNotification[]>();

function storageKey(userId?: string | null) {
  return `${STORAGE_PREFIX}:${userId ?? 'guest'}`;
}

function cacheKey(userId?: string | null) {
  return userId ?? 'guest';
}

function dispatchNotificationsChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function seedFromUserId(userId?: string | null) {
  const input = userId ?? 'guest';
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildSeedNotifications(userId?: string | null): HydroNotification[] {
  const seed = seedFromUserId(userId);
  const rotation = seed % seedTemplates.length;
  const rotatedTemplates = [...seedTemplates.slice(rotation), ...seedTemplates.slice(0, rotation)];
  const userKey = userId ?? 'guest';

  return rotatedTemplates.map((template, index) => {
    const minutesAgo = 12 + ((seed + index * 17) % 6) * 18 + index * 13;
    return {
      id: `notif-${template.idPrefix}-${rotation}-${index}`,
      userId: userKey,
      type: template.type,
      createdAt: new Date(NOTIFICATION_BASE_TIMESTAMP - minutesAgo * 60_000).toISOString(),
      read: false,
      severity: template.severity,
      actionHref: template.actionHref,
      cargoId: template.cargoId,
      eta: template.eta,
      operatorName: template.operatorName,
      corridor: template.corridor,
      location: template.location
    };
  });
}

function getStoredNotifications(userId?: string | null): HydroNotification[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(storageKey(userId));
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;

    return parsed as HydroNotification[];
  } catch {
    return null;
  }
}

function setNotificationCache(userId: string | null | undefined, notifications: HydroNotification[]) {
  notificationCache.set(cacheKey(userId), notifications);
  return notifications;
}

export function readNotifications(userId?: string | null): HydroNotification[] {
  if (typeof window === 'undefined') return EMPTY_NOTIFICATIONS_SNAPSHOT as HydroNotification[];

  const key = cacheKey(userId);
  const cached = notificationCache.get(key);
  if (cached) return cached;

  const stored = getStoredNotifications(userId);
  if (stored) return setNotificationCache(userId, stored);

  return setNotificationCache(userId, buildSeedNotifications(userId));
}

export function persistNotifications(notifications: HydroNotification[], userId?: string | null) {
  if (typeof window === 'undefined') return;

  try {
    notificationCache.set(cacheKey(userId), notifications);
    window.localStorage.setItem(storageKey(userId), JSON.stringify(notifications));
    dispatchNotificationsChanged();
  } catch {
    /* ignore storage failures */
  }
}

export function markNotificationRead(notificationId: string, userId?: string | null) {
  const notifications = readNotifications(userId).map((notification) =>
    notification.id === notificationId ? { ...notification, read: true } : notification
  );
  persistNotifications(notifications, userId);
  return notifications;
}

export function markAllNotificationsRead(userId?: string | null) {
  const notifications = readNotifications(userId).map((notification) => ({ ...notification, read: true }));
  persistNotifications(notifications, userId);
  return notifications;
}

export function resetNotifications(userId?: string | null) {
  const seeded = buildSeedNotifications(userId);
  notificationCache.set(cacheKey(userId), seeded);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(seeded));
      dispatchNotificationsChanged();
    } catch {
      /* ignore storage failures */
    }
  }

  return seeded;
}

export function clearNotificationsCache(userId?: string | null) {
  if (typeof userId === 'undefined') {
    notificationCache.clear();
    return;
  }

  notificationCache.delete(cacheKey(userId));
}

export function getNotificationsServerSnapshot() {
  return EMPTY_NOTIFICATIONS_SNAPSHOT;
}

export function getUnreadNotificationsCount(notifications: HydroNotification[]) {
  return notifications.reduce((count, notification) => count + (notification.read ? 0 : 1), 0);
}

export const notificationsChangedEvent = CHANGE_EVENT;
export const emptyNotificationsSnapshot = EMPTY_NOTIFICATIONS_SNAPSHOT;
