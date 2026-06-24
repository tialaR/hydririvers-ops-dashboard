import { getNotifications } from '@/features/shipper-mobile-flow/application/get-notifications';
import { NotificationsScreen } from '@/features/shipper-mobile-flow/screens/notifications-screen';

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return <NotificationsScreen notifications={notifications} />;
}
