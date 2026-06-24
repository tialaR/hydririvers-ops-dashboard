'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { LanguageSwitcher } from '@/features/shipper-mobile-flow/components/language-switcher/language-switcher';
import { ThemeSwitcher } from '@/features/shipper-mobile-flow/components/theme-switcher/theme-switcher';
import { NotificationBell } from '@/features/shipper-mobile-flow/components/notification-bell/notification-bell';
import { AvatarButton } from '@/features/shipper-mobile-flow/components/avatar-menu-sheet/avatar-button';

import styles from './app-header.module.sass';

type AppHeaderProps = {
  title?: string;
  mode: 'public' | 'authenticated' | 'minimal';
  backHref?: string;
  onAvatarClick: () => void;
};

export function AppHeader({ title, mode, backHref, onAvatarClick }: AppHeaderProps) {
  const t = useTranslations('shipperMobileFlow.header');

  return (
    <header className={`${styles.header} ${mode === 'minimal' ? styles.headerMap : ''}`}>
      <div className={styles.left}>
        {backHref ? (
          <Link href={backHref} className={styles.back} aria-label={t('back')}>
            <ArrowLeft size={18} aria-hidden />
          </Link>
        ) : null}
        {title ? <h1 className={styles.title}>{title}</h1> : null}
      </div>
      {mode === 'authenticated' ? (
        <div className={styles.actions}>
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell />
          <AvatarButton onClick={onAvatarClick} />
        </div>
      ) : mode === 'minimal' ? (
        <div className={styles.actions}>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      ) : null}
    </header>
  );
}
