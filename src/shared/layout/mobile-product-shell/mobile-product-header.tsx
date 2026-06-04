'use client';

import Image from 'next/image';
import { Bell, Languages, User, Waves } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getCompactDisplayInitials } from '@/features/auth/domain/user-display-name';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { Link } from '@/core/i18n/navigation';
import { IconButton } from '@/shared/components/icon-button';
import type { StoredLocale } from '@/shared/preferences/client-preferences';

import {
  resolveMobilePageTitleKey,
  type MobilePageTitleMessageKey,
} from './resolve-mobile-page-title';
import styles from './mobile-product-shell.module.scss';

export type MobileProductHeaderProps = {
  normalizedPathname: string;
  brandHref: string;
  unreadNotificationsCount: number;
  navigationUser: HydroUser | null;
  onOpenLocale: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  localeSheetOpen: boolean;
  notificationsOpen: boolean;
};

function resolvePageTitleLabel(
  key: MobilePageTitleMessageKey,
  tNav: ReturnType<typeof useTranslations<'nav'>>,
  tChrome: ReturnType<typeof useTranslations<'adminChrome'>>,
) {
  if (key.startsWith('nav.')) {
    return tNav(key.slice('nav.'.length) as 'dashboard');
  }

  const chromeKey = key.slice('adminChrome.'.length) as 'mobile.pageTitles.cargoDetail';
  return tChrome(chromeKey);
}

function resolveLocaleLabel(locale: StoredLocale, tChrome: ReturnType<typeof useTranslations<'adminChrome'>>) {
  if (locale === 'pt-BR') return tChrome('settings.language.ptBR');
  if (locale === 'en-US') return tChrome('settings.language.en');
  return tChrome('settings.language.es');
}

export function MobileProductHeader({
  normalizedPathname,
  brandHref,
  unreadNotificationsCount,
  navigationUser,
  onOpenLocale,
  onOpenNotifications,
  onOpenProfile,
  localeSheetOpen,
  notificationsOpen,
}: MobileProductHeaderProps) {
  const tNav = useTranslations('nav');
  const tChrome = useTranslations('adminChrome');
  const locale = useLocale() as StoredLocale;
  const pageTitleKey = resolveMobilePageTitleKey(normalizedPathname);
  const pageTitleText = resolvePageTitleLabel(pageTitleKey, tNav, tChrome);
  const localeLabel = resolveLocaleLabel(locale, tChrome);

  return (
    <header
      className={styles.header}
      data-mobile-product-shell="true"
      data-theme="light"
      aria-label={tChrome('mobile.headerAria')}
    >
      <div className={styles.headerRow}>
        <Link href={brandHref} className={styles.brand} aria-label={tChrome('brandAria')}>
          <span className={styles.brandMark} aria-hidden>
            <Waves size={16} />
          </span>
          <strong>HydroRivers</strong>
        </Link>

        <div className={styles.headerActions} data-mobile-header-actions="true">
          <IconButton
            className={styles.headerIconButton}
            ariaLabel={tChrome('settings.language.selectLabel', { locale: localeLabel })}
            icon={<Languages size={18} aria-hidden />}
            size="sm"
            isActive={localeSheetOpen}
            aria-expanded={localeSheetOpen}
            onClick={onOpenLocale}
          />
          <IconButton
            className={styles.headerIconButton}
            ariaLabel={tChrome('header.notificationsAria', { count: unreadNotificationsCount })}
            icon={<Bell size={18} aria-hidden />}
            size="sm"
            badgeCount={unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined}
            aria-expanded={notificationsOpen}
            onClick={onOpenNotifications}
          />
          {navigationUser?.avatarUrl ? (
            <button
              type="button"
              className={styles.profileButton}
              aria-label={tChrome('profile.openAria', { name: navigationUser.name ?? '' })}
              onClick={onOpenProfile}
            >
              <Image
                src={navigationUser.avatarUrl}
                alt=""
                width={40}
                height={40}
                sizes="40px"
                className={styles.profileAvatar}
                unoptimized
              />
            </button>
          ) : (
            <IconButton
              className={styles.headerIconButton}
              ariaLabel={
                navigationUser
                  ? tChrome('profile.openAria', { name: navigationUser.name ?? '' })
                  : tNav('login')
              }
              icon={
                navigationUser ? (
                  <span className={styles.profileInitials}>{getCompactDisplayInitials(navigationUser.name ?? '')}</span>
                ) : (
                  <User size={18} aria-hidden />
                )
              }
              size="sm"
              onClick={onOpenProfile}
            />
          )}
        </div>
      </div>

      <h1 className={styles.pageTitle} data-mobile-page-title="true">
        {pageTitleText}
      </h1>
    </header>
  );
}
