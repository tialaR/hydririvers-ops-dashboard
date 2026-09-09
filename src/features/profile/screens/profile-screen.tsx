'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { MobileAppShell } from '@/features/product-shell/components/mobile-app-shell/mobile-app-shell';
import { useProductShell } from '@/features/product-shell/providers/product-shell-provider';

import styles from './profile-screen.module.sass';

const MENU = ['language', 'theme', 'notifications', 'security', 'logout'] as const;

export function ProfileScreen() {
  const t = useTranslations('shipperMobileFlow.profile');
  const { currentUser } = useProductShell();
  const quickMenu = MENU.filter((item) => item !== 'logout');
  const resolveQuickValue = (key: (typeof MENU)[number]) => {
    if (key === 'language') return currentUser.locale;
    if (key === 'theme') return t('menu.theme');
    if (key === 'notifications') return t('menu.notifications');
    return t('identity.accessValue');
  };

  return (
    <MobileAppShell title={t('title')}>
      <div className={styles.profileHeader}>
        <span className={styles.profileAvatar} aria-hidden>
          {currentUser.avatarInitials}
        </span>
        <div>
          <h2 className={styles.title}>{currentUser.name}</h2>
          <p className={styles.summary}>{currentUser.company}</p>
          <p className={styles.profileContextLine}>
            {t('identity.roleValue')} · {currentUser.locale}
          </p>
        </div>
      </div>
      <section className={styles.profileIdentityGrid} aria-label={t('identityAria')}>
        <article className={styles.profileIdentityCard}>
          <p className={styles.profileIdentityLabel}>{t('identity.role')}</p>
          <p className={styles.profileIdentityValue}>{t('identity.roleValue')}</p>
        </article>
        <article className={styles.profileIdentityCard}>
          <p className={styles.profileIdentityLabel}>{t('identity.locale')}</p>
          <p className={styles.profileIdentityValue}>{currentUser.locale}</p>
        </article>
        <article className={styles.profileIdentityCard}>
          <p className={styles.profileIdentityLabel}>{t('identity.access')}</p>
          <p className={styles.profileIdentityValue}>{t('identity.accessValue')}</p>
        </article>
      </section>
      <section className={styles.profileQuickGrid} aria-label={t('menuLabel')}>
        {quickMenu.map((key) => (
          <article key={key} className={styles.profileQuickCard}>
            <p className={styles.profileQuickLabel}>{t(`menu.${key}`)}</p>
            <p className={styles.profileQuickValue}>{resolveQuickValue(key)}</p>
          </article>
        ))}
      </section>
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
