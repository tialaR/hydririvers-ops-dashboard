'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { LanguageSwitcher } from '@/features/product-shell/components/language-switcher/language-switcher';
import { ThemeSwitcher } from '@/features/product-shell/components/theme-switcher/theme-switcher';
import { NotificationBell } from '@/features/product-shell/components/notification-bell/notification-bell';
import { AvatarButton } from '@/features/product-shell/components/avatar-menu-sheet/avatar-button';
import { useProductShell } from '@/features/product-shell/providers/product-shell-provider';

import styles from './app-header.module.sass';

type AppHeaderProps = {
  title?: string;
  mode: 'public' | 'authenticated' | 'minimal';
  backHref?: string;
  onAvatarClick: () => void;
};

export function AppHeader({ title, mode, backHref, onAvatarClick }: AppHeaderProps) {
  const t = useTranslations('shipperMobileFlow.header');
  const { currentUser } = useProductShell();
  const resolvedTitle = title ?? t('hubTitle');

  return (
    <header className={`${styles.header} ${mode === 'minimal' ? styles.headerMap : ''}`}>
      <div className={styles.leftBlock}>
        <div className={styles.left}>
          {backHref ? (
            <Link href={backHref} className={styles.back} aria-label={t('back')}>
              <ArrowLeft size={18} aria-hidden />
            </Link>
          ) : null}
          <h1 className={styles.title}>{resolvedTitle}</h1>
        </div>
        {mode === 'authenticated' ? (
          <div className={styles.metaRow}>
            <span className={styles.metaCompany}>{currentUser.company}</span>
            <span className={styles.metaBadge}>{t('opsMode')}</span>
          </div>
        ) : null}
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
