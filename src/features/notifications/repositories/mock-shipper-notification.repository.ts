import { SHIPPER_NOTIFICATIONS } from '@/features/notifications/mocks/shipper-notification.mock';
import type { ShipperNotificationRepository } from '@/features/notifications/domain/shipper-notification-repository';

export const mockShipperNotificationRepository: ShipperNotificationRepository = {
  async getNotifications() {
    return SHIPPER_NOTIFICATIONS;
  },
};
