'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { Link, usePathname, useRouter } from '@/core/i18n/navigation';
import { mainNavigation, resolveActiveNavigationHref } from '@/shared/config/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { BottomSheet } from '@/shared/components/bottom-sheet/BottomSheet';
import { ThemeToggle } from '@/shared/ui/theme-toggle/theme-toggle';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher/locale-switcher';
import { AuthActions } from '@/features/auth/components/auth-actions/auth-actions';
import { getCompactDisplayInitials } from '@/features/auth/domain/user-display-name';
import { logout } from '@/features/auth/services/auth.client';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './app-header.module.scss';

const MENU_SHEET_SNAP_ORDER = ['half', 'full'] as const;

type MenuSheetSnap = (typeof MENU_SHEET_SNAP_ORDER)[number];

function resolveActiveHref(pathname: string) {
  return resolveActiveNavigationHref(pathname, mainNavigation);
}

export function AppHeader() {
  const t = useTranslations('nav');
  const ta = useTranslations('auth');
  const router = useRouter();
  const pathname = usePathname();
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [menuSheetSnap, setMenuSheetSnap] = useState<MenuSheetSnap>('full');
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { user, ready } = useAuthSession();
  const navigationUser = ready ? user : null;
  const desktopNavigation = useMemo(
    () =>
      mainNavigation
        .filter((item) => item.href !== intlAppPaths.admin.home)
        .filter(
          (item) =>
            item.href !== intlAppPaths.cargos.myCargos ||
            Boolean(navigationUser && (navigationUser.role === 'shipper' || navigationUser.role === 'carrier'))
        ),
    [navigationUser]
  );
  const primary = useMemo(() => desktopNavigation.slice(0, 4), [desktopNavigation]);
  const overflow = useMemo(() => desktopNavigation.slice(4), [desktopNavigation]);
  const activeHref = useMemo(() => resolveActiveHref(pathname), [pathname]);
  const activeItem = useMemo(() => mainNavigation.find((item) => item.href === activeHref), [activeHref]);
  const overflowActive = useMemo(() => overflow.some((item) => item.href === activeHref), [overflow, activeHref]);
  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen]);

  function openSheet(event?: { preventDefault: () => void; stopPropagation: () => void }) {
    event?.preventDefault();
    event?.stopPropagation();

    setMoreOpen(false);
    setMenuSheetSnap('full');
    setMenuSheetOpen(true);
  }

  function closeMenuSheet() {
    setMenuSheetOpen(false);
    setMenuSheetSnap('full');
  }

  function handleMenuSheetOpenChange(open: boolean) {
    setMenuSheetOpen(open);
    if (!open) {
      setMenuSheetSnap('full');
    }
  }

  function handleMenuSheetSnapChange(snapId: string) {
    if (snapId === 'half' || snapId === 'full') {
      setMenuSheetSnap(snapId);
    }
  }

  const closeMenus = () => {
    setMoreOpen(false);
    if (menuSheetOpen) closeMenuSheet();
  };

  const mobileNavItems = useMemo(
    () =>
      mainNavigation.filter(
        (item) =>
          (item.href !== intlAppPaths.admin.home || user?.role === 'admin') &&
          (item.href !== intlAppPaths.cargos.myCargos || Boolean(user && (user.role === 'shipper' || user.role === 'carrier')))
      ),
    [user]
  );

  const menuSheetFooter =
    pathname.startsWith(intlAppPaths.cargos.marketplace) || pathname.startsWith(intlAppPaths.cargos.myCargos) ? (
      <Link href={intlAppPaths.cargos.publishCargo} onClick={closeMenuSheet} className={styles.sheetCta}>
        {t('cta')}
      </Link>
    ) : null;

  return (
    <header className={`${styles.headerShell} ${pathname !== '/' ? styles.subPage : ''}`}>
      <div className={styles.header}>
        <Link href={intlAppPaths.home} className={styles.brand} aria-label="HydroRivers" onClick={closeMenus}>
          <span className={styles.brandMark}><HydroIcon name="river" size={24} /></span>
          <span className={styles.brandText}>HydroRivers</span>
        </Link>

        <nav className={styles.nav} aria-label={t('primaryNavigation')}>
          {primary.map((item) => (
            <Link onClick={closeMenus} className={item.href === activeHref ? styles.active : undefined} key={item.href} href={item.href}>
              {t(item.labelKey)}
            </Link>
          ))}
          {overflow.length ? (
            <div className={styles.more} ref={moreRef}>
              <button
                type="button"
                className={moreOpen || overflowActive ? styles.moreButtonActive : styles.moreButton}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((value) => !value)}
              >
                {t('more')} <HydroIcon name="chevronDown" size={16} />
              </button>
              {moreOpen ? (
                <div className={styles.morePanel} role="menu">
                  {overflow.map((item) => (
                    <Link role="menuitem" className={item.href === activeHref ? styles.activePanel : undefined} onClick={() => setMoreOpen(false)} key={item.href} href={item.href}>{t(item.labelKey)}</Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className={styles.actions}>
          <div className={styles.desktopTool}><LocaleSwitcher /></div>
          <div className={styles.desktopTool}><ThemeToggle /></div>
          <div className={styles.headerSession}><AuthActions /></div>
          {user ? (
            <Link href={intlAppPaths.auth.profile} className={styles.mobileAvatar} aria-label={t('profile')}>
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="" width={40} height={40} unoptimized />
              ) : (
                <span>{getCompactDisplayInitials(user.name)}</span>
              )}
            </Link>
          ) : null}
          <div className={styles.mobileActions}>
            <div className={styles.mobileTool}>
              <LocaleSwitcher dropdownPortal />
            </div>
            <div className={styles.mobileTool}>
              <ThemeToggle />
            </div>
            <button
              type="button"
              className={styles.menuButton}
              onClick={openSheet}
              aria-label={t('openMenu')}
              aria-haspopup="dialog"
              aria-expanded={menuSheetOpen}
            >
              <HydroIcon name="menu" />
            </button>
          </div>
        </div>
      </div>

      {activeItem && pathname !== '/' ? (
        <div className={styles.contextBar} aria-label={t('currentRoute')}>
          <span><HydroIcon name="route" size={14} /> {t(activeItem.labelKey)}</span>
          <small>{t('subpageContext')}</small>
        </div>
      ) : null}

      <BottomSheet
        open={menuSheetOpen}
        onOpenChange={handleMenuSheetOpenChange}
        title="HydroRivers"
        description={t('mobileMenuTitle')}
        closeAriaLabel={t('closeMenu')}
        snapHeights={{
          half: '55dvh',
          full: '92dvh',
        }}
        snapOrder={[...MENU_SHEET_SNAP_ORDER]}
        initialSnap={menuSheetSnap}
        enableDrag
        closeOnOverlayClick
        variant="strong"
        className={styles.menuSheet}
        bodyClassName={styles.menuSheetBody}
        onSnapChange={handleMenuSheetSnapChange}
        footer={menuSheetFooter}
      >
        <div className={styles.sheetBrandRow}>
          <span className={styles.sheetBrandMark} aria-hidden>
            <HydroIcon name="river" size={22} />
          </span>
        </div>

        <section className={styles.mobileMenuQuick} aria-label={t('quickActions')}>
          <h2 className={styles.visuallyHidden}>{t('quickActions')}</h2>

          <div className={`${styles.quickRow} ${styles.quickAccountRow}`}>
            <span className={styles.quickLabel} id="mobile-quick-account">
              {t('account')}
            </span>
            <div className={styles.quickAccountControls} aria-labelledby="mobile-quick-account">
              {!ready ? (
                <span className={styles.quickAuthSkeleton} aria-hidden />
              ) : !user ? (
                <>
                  <Link href={intlAppPaths.auth.login} onClick={closeMenuSheet} className={`${styles.quickLink} ${styles.quickLinkMuted}`}>
                    {t('login')}
                  </Link>
                  <Link href={intlAppPaths.auth.register} onClick={closeMenuSheet} className={`${styles.quickLink} ${styles.quickLinkPrimary}`}>
                    {t('signup')}
                  </Link>
                </>
              ) : (
                <>
                  <Link href={intlAppPaths.auth.profile} onClick={closeMenuSheet} className={`${styles.quickLink} ${styles.quickLinkMuted}`}>
                    {t('profile')}
                  </Link>
                  <button
                    type="button"
                    className={styles.quickLogout}
                    onClick={async () => {
                      await logout();
                      closeMenuSheet();
                      router.push(intlAppPaths.home);
                    }}
                    aria-label={ta('logout')}
                  >
                    <LogOut size={16} aria-hidden />
                    <span>{ta('logout')}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <nav className={styles.sheetScrollArea} aria-label={t('primaryNavigation')}>
          <div className={styles.sheetNav}>
            {mobileNavItems.map((item) => (
              <Link
                onClick={closeMenuSheet}
                key={item.href}
                href={item.href}
                className={item.href === activeHref ? styles.sheetActive : undefined}
              >
                <span>{t(item.labelKey)}</span>
                <HydroIcon
                  name={
                    item.href === intlAppPaths.cargos.marketplace
                      ? 'cargo'
                      : item.href === intlAppPaths.vessels.marketplace
                        ? 'ship'
                        : item.href === intlAppPaths.tracking.home
                          ? 'map'
                          : 'route'
                  }
                  size={16}
                />
              </Link>
            ))}
          </div>
        </nav>
      </BottomSheet>
    </header>
  );
}
