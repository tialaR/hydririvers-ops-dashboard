import type { ShipperNotification } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

export type NotificationRepository = {
  getNotifications(): Promise<ShipperNotification[]>;
};
