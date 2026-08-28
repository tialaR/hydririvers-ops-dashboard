'use client';

import { useTranslations } from 'next-intl';
import type { ShipperNotification } from '@/features/notifications/domain/shipper-notification';

import styles from './notifications-screen.module.sass';

type NotificationsScreenProps = {
  notifications: ShipperNotification[];
};

export function NotificationsScreen({ notifications }: NotificationsScreenProps) {
  const t = useTranslations('shipperMobileFlow.notifications');
  const tRisk = useTranslations('shipperMobileFlow.risk');
  const criticalCount = notifications.filter((item) => item.severity === 'high').length;
  const warningCount = notifications.filter((item) => item.severity === 'medium').length;
  const groupedNotifications = [
    {
      id: 'high',
      label: tRisk('critical'),
      items: notifications.filter((item) => item.severity === 'high'),
    },
    {
      id: 'medium',
      label: tRisk('medium'),
      items: notifications.filter((item) => item.severity === 'medium'),
    },
    {
      id: 'low',
      label: tRisk('low'),
      items: notifications.filter((item) => item.severity === 'low'),
    },
  ].filter((group) => group.items.length > 0);
  const resolveNotificationClass = (severity: ShipperNotification['severity']) =>
    severity === 'high'
      ? styles.notificationHigh
      : severity === 'medium'
        ? styles.notificationMedium
        : styles.notificationLow;

  return (
    <>
      <section className={styles.notificationsHero} aria-label={t('heroAria')}>
        <div>
          <p className={styles.notificationsHeroLabel}>{t('heroLabel')}</p>
          <p className={styles.notificationsHeroValue}>{t('heroValue', { count: notifications.length })}</p>
        </div>
        <div className={styles.notificationsHeroMeta}>
          <span>{t('heroCritical', { count: criticalCount })}</span>
          <span>{t('heroWarning', { count: warningCount })}</span>
        </div>
      </section>
      {groupedNotifications.map((group) => (
        <section key={group.id} className={styles.notificationSection}>
          <header className={styles.notificationSectionHeader}>
            <h2 className={styles.notificationSectionTitle}>{group.label}</h2>
            <span className={styles.notificationSectionCount}>{group.items.length}</span>
          </header>
          <div className={styles.notificationRail}>
            {group.items.map((item) => (
              <article key={item.id} className={`${styles.notification} ${resolveNotificationClass(item.severity)}`}>
                <div>
                  <h3 className={styles.title}>{t(`items.${item.titleKey}`)}</h3>
                  <p className={styles.summary}>{t(`items.${item.bodyKey}`)}</p>
                  <p className={styles.summary}>{t(`items.${item.timeLabelKey}`)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
