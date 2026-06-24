'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/shipper-mobile-flow/components/mobile-app-shell/mobile-app-shell';
import { useShipperFlow } from '@/features/shipper-mobile-flow/providers/shipper-flow-provider';

import styles from '../components/shared-ui/shared-ui.module.sass';

const MENU = ['language', 'theme', 'notifications', 'security', 'logout'] as const;

export function ProfileScreen() {
  const t = useTranslations('shipperMobileFlow.profile');
  const { currentUser } = useShipperFlow();

  return (
    <MobileAppShell title={t('title')}>
      <div className={styles.profileHeader}>
        <span className={styles.profileAvatar} aria-hidden>
          {currentUser.avatarInitials}
        </span>
        <div>
          <h2 className={styles.title}>{currentUser.name}</h2>
          <p className={styles.summary}>{currentUser.company}</p>
        </div>
      </div>
      <nav className={styles.menuList} aria-label={t('menuLabel')}>
        {MENU.map((key) => (
          <Link
            key={key}
            href={key === 'logout' ? '/entrar' : '/perfil'}
            className={styles.menuLink}
          >
            {t(`menu.${key}`)}
          </Link>
        ))}
      </nav>
    </MobileAppShell>
  );
}
