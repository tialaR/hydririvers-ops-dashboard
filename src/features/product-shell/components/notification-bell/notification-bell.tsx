'use client';

import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';

import styles from './notification-bell.module.sass';

export function NotificationBell() {
  const t = useTranslations('shipperMobileFlow.header');

  return (
    <Link href="/notificacoes" className={styles.link} aria-label={t('notifications')}>
      <Bell size={18} aria-hidden />
      <span className={styles.badge} aria-hidden />
    </Link>
  );
}
