import { SHIPPER_NOTIFICATIONS } from '@/features/shipper-mobile-flow/data/mock/shipper-notification-mock';
import type { NotificationRepository } from '@/features/shipper-mobile-flow/domain/repositories/notification-repository';

export const mockNotificationRepository: NotificationRepository = {
  async getNotifications() {
    return SHIPPER_NOTIFICATIONS;
  }
};
