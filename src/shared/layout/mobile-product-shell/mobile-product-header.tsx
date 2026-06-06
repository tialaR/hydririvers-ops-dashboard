'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Waves } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getCompactDisplayInitials } from '@/features/auth/domain/user-display-name';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { Link } from '@/core/i18n/navigation';
import { ICON_BUTTON_ICON_SIZE, IconButton } from '@/shared/components/icon-button';
import type { StoredLocale } from '@/shared/preferences/client-preferences';

import {
  resolveMobilePageTitleKey,
  type MobilePageTitleMessageKey,
} from './resolve-mobile-page-title';
import { resolveMobileLocaleAbbrev } from './resolve-mobile-locale-abbrev';
import { useMobileHeaderScroll } from './use-mobile-header-scroll';
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
  const localeAbbrev = resolveMobileLocaleAbbrev(locale);
  const isCompact = useMobileHeaderScroll();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) {
      return;
    }

    const syncSpacerHeight = () => {
      document.documentElement.style.setProperty(
        '--hy-mobile-header-spacer-height',
        `${headerEl.offsetHeight}px`,
      );
    };

    syncSpacerHeight();

    const resizeObserver = new ResizeObserver(syncSpacerHeight);
    resizeObserver.observe(headerEl);

    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.removeProperty('--hy-mobile-header-spacer-height');
    };
  }, [isCompact, pageTitleText]);

  return (
    <header
      ref={headerRef}
      className={styles.header}
      data-mobile-product-shell="true"
      data-mobile-header-glass="true"
      data-mobile-header-compact={isCompact ? 'true' : 'false'}
      data-scroll-compact={isCompact ? 'true' : 'false'}
      data-theme="light"
      aria-label={tChrome('mobile.headerAria')}
    >
      <div className={styles.headerRow}>
        <Link
          href={brandHref}
          className={styles.brand}
          data-mobile-brand="true"
          aria-label={tChrome('brandAria')}
        >
          <span className={styles.brandMark} aria-hidden>
            <Waves size={16} />
          </span>
          <strong>HydroRivers</strong>
        </Link>

        <div className={styles.headerActions} data-mobile-header-actions="true">
          <IconButton
            className={styles.headerIconButton}
            iconButtonRole="header"
            data-mobile-header-action="language"
            ariaLabel={tChrome('mobile.localeToggleAria')}
            iconName="language"
            icon={<span className={styles.localeAbbrev}>{localeAbbrev}</span>}
            active={localeSheetOpen}
            aria-expanded={localeSheetOpen}
            onClick={onOpenLocale}
          />
          <IconButton
            className={styles.headerIconButton}
            iconButtonRole="header"
            data-mobile-header-action="notifications"
            ariaLabel={tChrome('header.notificationsAria', { count: unreadNotificationsCount })}
            iconName="notifications"
            badgeContent={unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined}
            aria-expanded={notificationsOpen}
            onClick={onOpenNotifications}
          />
          <IconButton
            className={styles.headerIconButton}
            iconButtonRole="header"
            data-mobile-header-action="profile"
            ariaLabel={
              navigationUser
                ? tChrome('profile.openAria', { name: navigationUser.name ?? '' })
                : tNav('login')
            }
            iconName={navigationUser?.avatarUrl || navigationUser ? undefined : 'profile'}
            icon={
              navigationUser?.avatarUrl ? (
                <Image
                  src={navigationUser.avatarUrl}
                  alt=""
                  width={ICON_BUTTON_ICON_SIZE}
                  height={ICON_BUTTON_ICON_SIZE}
                  sizes={`${ICON_BUTTON_ICON_SIZE}px`}
                  className={styles.profileAvatar}
                  unoptimized
                />
              ) : navigationUser ? (
                <span className={styles.profileInitials}>
                  {getCompactDisplayInitials(navigationUser.name ?? '')}
                </span>
              ) : undefined
            }
            onClick={onOpenProfile}
          />
        </div>
      </div>

      <h1
        className={`${styles.pageTitle} ${isCompact ? styles.pageTitleCompact : styles.pageTitleExpanded}`}
        data-mobile-page-title="true"
        data-mobile-page-title-variant="navigation"
        {...(isCompact ? { 'data-mobile-page-title-compact-offset': 'true' } : {})}
      >
        {pageTitleText}
      </h1>
    </header>
  );
}
