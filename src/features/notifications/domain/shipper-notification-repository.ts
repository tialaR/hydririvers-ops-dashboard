import type { ShipperNotification } from '@/features/notifications/domain/shipper-notification';

export type ShipperNotificationRepository = {
  getNotifications(): Promise<ShipperNotification[]>;
};
