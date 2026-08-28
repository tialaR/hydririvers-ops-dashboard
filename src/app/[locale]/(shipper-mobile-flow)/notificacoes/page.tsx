import { getTranslations } from 'next-intl/server';

import { getShipperNotifications } from '@/features/notifications/application/get-shipper-notifications';
import { NotificationsScreen } from '@/features/notifications/screens/notifications-screen';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';

type NotificationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { locale } = await params;
  const [notifications, t] = await Promise.all([
    getShipperNotifications(),
    getTranslations({ locale, namespace: 'shipperMobileFlow.notifications' }),
  ]);

  return (
    <MobileAppShell title={t('title')}>
      <NotificationsScreen notifications={notifications} />
    </MobileAppShell>
  );
}
