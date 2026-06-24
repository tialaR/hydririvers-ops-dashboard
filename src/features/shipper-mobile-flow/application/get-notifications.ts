import { createShipperMobileRepositories } from '@/features/shipper-mobile-flow/data/repositories/repository-provider';

export async function getNotifications() {
  const { notification } = createShipperMobileRepositories();
  return notification.getNotifications();
}
