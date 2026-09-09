import { mockShipperNotificationRepository } from '@/features/notifications/repositories/mock-shipper-notification.repository';

export async function getShipperNotifications() {
  return mockShipperNotificationRepository.getNotifications();
}
