'use client';

import { useTranslations } from 'next-intl';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import type { ShipperNotification } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from '../components/shared-ui/shared-ui.module.sass';

type NotificationsScreenProps = {
  notifications: ShipperNotification[];
};

export function NotificationsScreen({ notifications }: NotificationsScreenProps) {
  const t = useTranslations('shipperMobileFlow.notifications');

  return (
    <MobileAppShell title={t('title')}>
      <div className={styles.list}>
        {notifications.map((item) => (
          <article
            key={item.id}
            className={`${styles.notification} ${
              item.severity === 'high'
                ? styles.notificationHigh
                : item.severity === 'medium'
                  ? styles.notificationMedium
                  : styles.notificationLow
            }`}
          >
            <div>
              <h3 className={styles.title}>{t(`items.${item.titleKey}`)}</h3>
              <p className={styles.summary}>{t(`items.${item.bodyKey}`)}</p>
              <p className={styles.summary}>{t(`items.${item.timeLabelKey}`)}</p>
            </div>
          </article>
        ))}
      </div>
    </MobileAppShell>
  );
}
