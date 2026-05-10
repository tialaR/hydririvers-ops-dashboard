'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CirclePlus,
  Compass,
  FileWarning,
  Gauge,
  Handshake,
  Landmark,
  Leaf,
  LogIn,
  LogOut,
  Menu,
  Map,
  RadioTower,
  Search,
  ShieldCheck,
  Ship,
  TriangleAlert,
  UserRound,
  Waves
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname, useRouter } from '@/core/i18n/navigation';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { logout } from '@/features/auth/services/auth.client';
import type { HydroUser, UserRole } from '@/features/auth/domain/auth.types';
import {
  emptyNotificationsSnapshot,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
  getNotificationsServerSnapshot,
  notificationsChangedEvent,
  readNotifications,
  type HydroNotification
} from '@/features/notifications/services/notifications.client';
import { mainNavigation, resolveActiveNavigationHref } from '@/shared/config/navigation';
import { persistStoredLocale, type StoredLocale } from '@/shared/preferences/client-preferences';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { BottomSheet } from '@/shared/components/bottom-sheet/BottomSheet';
import { ThemeToggle } from '@/shared/ui/theme-toggle/theme-toggle';

type AdminChromeProps = {
  children: React.ReactNode;
};

type NavIconKey =
  | 'home'
  | 'dashboard'
  | 'cargoes'
  | 'myCargos'
  | 'vessels'
  | 'negotiations'
  | 'tracking'
  | 'impact'
  | 'government'
  | 'admin';

const iconByKey: Record<NavIconKey, typeof Gauge> = {
  home: Compass,
  dashboard: Gauge,
  cargoes: BriefcaseBusiness,
  myCargos: Map,
  vessels: Ship,
  negotiations: Waves,
  tracking: Compass,
  impact: Leaf,
  government: Landmark,
  admin: ShieldCheck
};

function resolveActiveHref(pathname: string) {
  return resolveActiveNavigationHref(pathname, mainNavigation);
}

function initials(name?: string) {
  return (name ?? 'Carlos Almeida')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}


function roleLabel(role?: UserRole) {
  if (role === 'shipper') return 'shipper';
  if (role === 'carrier') return 'carrier';
  if (role === 'admin') return 'admin';
  return 'operations';
}

function formatNotificationTime(createdAt: string, locale: string) {
  const timestamp = new Date(createdAt).getTime();
  if (Number.isNaN(timestamp)) return '';

  const diffMinutes = Math.round((timestamp - Date.now()) / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
}

function notificationIcon(notification: HydroNotification) {
  if (notification.type === 'documentPending') return FileWarning;
  if (notification.type === 'berthUpdated') return Ship;
  if (notification.type === 'negotiationReceived') return Handshake;
  if (notification.type === 'routeMonitored') return RadioTower;
  return TriangleAlert;
}

function notificationTranslationValues(notification: HydroNotification) {
  return {
    cargoId: notification.cargoId ?? 'CARGO-000',
    eta: notification.eta ?? '06/06/2026 08:30',
    operatorName: notification.operatorName ?? 'HydroRivers',
    corridor: notification.corridor ?? 'Belém–Santarém',
    location: notification.location ?? 'Santarém'
  };
}

type SidebarLocale = StoredLocale;

const SIDEBAR_LOCALES: Array<{ value: SidebarLocale; label: string; flag: string }> = [
  { value: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' }
];

function profileActionFor(user: HydroUser | null): 'login' | 'myCargos' | 'myVessels' | 'governmentLayer' {
  if (!user) {
    return 'login';
  }

  if (user.role === 'shipper') {
    return 'myCargos';
  }

  if (user.role === 'carrier') {
    return 'myVessels';
  }

  if (user.role === 'admin') {
    return 'governmentLayer';
  }

  return 'login';
}

export function AdminChrome({ children }: AdminChromeProps) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tChrome = useTranslations('adminChrome');
  const tNotifications = useTranslations('notifications');
  const locale = useLocale() as SidebarLocale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeHref = useMemo(() => resolveActiveHref(pathname), [pathname]);
  const { user, ready: authReady } = useAuthSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const [notificationsPanelStyle, setNotificationsPanelStyle] = useState<CSSProperties>({});
  const localePanelId = 'hx-sidebar-language-panel';
  const notificationsPanelId = 'hx-header-notifications-panel';
  const currentLocale = SIDEBAR_LOCALES.find((item) => item.value === locale) ?? SIDEBAR_LOCALES[0];
  const profileAction = profileActionFor(user);
  const notifications = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};

      const syncNotifications = () => onStoreChange();
      window.addEventListener(notificationsChangedEvent, syncNotifications);
      window.addEventListener('hydrorivers:auth-changed', syncNotifications);
      window.addEventListener('hydrorivers:mock-changed', syncNotifications);
      return () => {
        window.removeEventListener(notificationsChangedEvent, syncNotifications);
        window.removeEventListener('hydrorivers:auth-changed', syncNotifications);
        window.removeEventListener('hydrorivers:mock-changed', syncNotifications);
      };
    },
    () => (authReady ? readNotifications(user?.id) : emptyNotificationsSnapshot),
    getNotificationsServerSnapshot
  );
  const unreadNotificationsCount = useMemo(
    () => getUnreadNotificationsCount(notifications),
    [notifications]
  );
  const profileActionConfig = {
    login: { href: intlAppPaths.auth.login, label: t('login'), icon: LogIn },
    myCargos: { href: intlAppPaths.cargos.myCargos, label: t('myCargoes'), icon: Map },
    myVessels: { href: intlAppPaths.vessels.marketplace, label: tChrome('cta.myVessels'), icon: Ship },
    governmentLayer: { href: intlAppPaths.government.home, label: tChrome('cta.governmentLayer'), icon: Landmark }
  }[profileAction];
  const ProfileActionIcon = profileActionConfig.icon;

  const navigation = useMemo(
    () =>
      mainNavigation.filter((item) => {
        if (item.href === intlAppPaths.admin.home) return user?.role === 'admin';
        if (item.href === intlAppPaths.government.home) return user?.role === 'admin';
        if (item.href === intlAppPaths.cargos.myCargos) return Boolean(user && (user.role === 'shipper' || user.role === 'carrier'));
        if (item.href === intlAppPaths.vessels.marketplace) return !user || user.role === 'carrier' || user.role === 'admin';
        if (item.href === intlAppPaths.negotiations.home) return !user || user.role === 'shipper' || user.role === 'carrier' || user.role === 'admin';
        return item.href !== intlAppPaths.home;
      }),
    [user]
  );
  const activeNavItem = navigation.find((item) => item.href === activeHref) ?? navigation.find((item) => item.href === intlAppPaths.dashboard.home) ?? null;
  const mobilePrimaryHrefs = [
    intlAppPaths.dashboard.home,
    intlAppPaths.cargos.marketplace,
    intlAppPaths.tracking.home,
    intlAppPaths.negotiations.home
  ];
  const mobilePrimaryNavigation = navigation.filter((item) => mobilePrimaryHrefs.some((href) => href === item.href));
  const mobileMoreNavigation = navigation.filter((item) => !mobilePrimaryNavigation.some((primary) => primary.href === item.href));
  const showPublishCargoContext = pathname.startsWith(intlAppPaths.cargos.marketplace) || pathname.startsWith(intlAppPaths.cargos.myCargos);
  const hideMobileFab = notificationsOpen || mobileMenuOpen || mobileSearchOpen;

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth <= 860);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!notificationsRef.current?.contains(target) && !notificationsPanelRef.current?.contains(target)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotificationsOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen]);

  useLayoutEffect(() => {
    if (!notificationsOpen || isMobileViewport || typeof window === 'undefined') return undefined;

    const updatePosition = () => {
      const buttonRect = notificationsButtonRef.current?.getBoundingClientRect();
      if (!buttonRect) return;

      const width = Math.min(420, Math.max(360, window.innerWidth - 24));
      const right = Math.max(12, window.innerWidth - buttonRect.right);
      const top = buttonRect.bottom + 12;
      const maxHeight = Math.max(240, window.innerHeight - top - 20);

      setNotificationsPanelStyle({
        position: 'fixed',
        zIndex: 1200,
        top,
        right,
        width,
        maxHeight
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isMobileViewport, notificationsOpen]);

  function changeSidebarLocale(nextLocale: SidebarLocale) {
    if (nextLocale === locale) {
      setLocaleOpen(false);
      return;
    }

    const query = searchParams.toString();
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    persistStoredLocale(nextLocale);
    router.replace(`${pathname}${query ? `?${query}` : ''}${hash}` as never, { locale: nextLocale });
    setLocaleOpen(false);
  }

  async function handleSidebarLogout() {
    await logout();
    router.push(intlAppPaths.auth.login as never);
  }

  function handleCollapsedLocaleOpen() {
    setSidebarCollapsed(false);
    setLocaleOpen(true);
  }

  function handleNotificationClick(notification: HydroNotification) {
    markNotificationRead(notification.id, user?.id);
    setNotificationsOpen(false);

    if (notification.actionHref) {
      router.push(notification.actionHref as never);
    }
  }

  function handleMarkAllNotificationsRead() {
    markAllNotificationsRead(user?.id);
  }

  const notificationsContent = (
    <>
      <div className="hx-notifications-header">
        <div>
          <strong>{tNotifications('title')}</strong>
          <small>{tNotifications('summary', { count: unreadNotificationsCount })}</small>
        </div>
        <button
          type="button"
          className="hx-notifications-mark-all"
          onClick={handleMarkAllNotificationsRead}
          disabled={unreadNotificationsCount === 0}
        >
          {tNotifications('markAllRead')}
        </button>
      </div>

      <div className="hx-notifications-list">
        {notifications.length ? (
          notifications.map((notification) => {
            const Icon = notificationIcon(notification);
            const values = notificationTranslationValues(notification);
            return (
              <button
                key={notification.id}
                type="button"
                className={notification.read ? 'hx-notification-item is-read' : `hx-notification-item is-${notification.severity}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <span className={`hx-notification-icon is-${notification.severity}`} aria-hidden>
                  <Icon size={16} />
                </span>
                <span className="hx-notification-copy">
                  <span className="hx-notification-topline">
                    <strong>{tNotifications(`types.${notification.type}.title`, values)}</strong>
                    {!notification.read ? <i aria-hidden /> : null}
                  </span>
                  <span>{tNotifications(`types.${notification.type}.message`, values)}</span>
                  <small>{formatNotificationTime(notification.createdAt, locale)}</small>
                </span>
              </button>
            );
          })
        ) : (
          <div className="hx-notifications-empty">
            <strong>{tNotifications('empty')}</strong>
            <span>{tNotifications('emptyDescription')}</span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className={sidebarCollapsed ? 'hx-shell hr-shell is-sidebar-collapsed' : 'hx-shell hr-shell'}>
      <aside className={sidebarCollapsed ? 'hx-sidebar hr-sidebar is-collapsed' : 'hx-sidebar hr-sidebar'} aria-label={t('primaryNavigation')}>
        <div className="hr-sidebar-inner">
          <Link href={intlAppPaths.dashboard.home} className="hx-sidebar-brand" aria-label={tChrome('brandAria')} title="HydroRivers">
            <span><Waves size={24} /></span>
            <strong>HydroRivers</strong>
          </Link>

          <div className="hx-sidebar-toggle-zone">
            <button
              type="button"
              className={sidebarCollapsed ? 'hx-collapse-button is-collapsed' : 'hx-collapse-button'}
              aria-label={sidebarCollapsed ? t('openMenu') : t('closeMenu')}
              title={sidebarCollapsed ? t('openMenu') : t('closeMenu')}
              onClick={() => setSidebarCollapsed((current) => !current)}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <nav className="hx-sidebar-nav hr-sidebar-nav">
            {navigation.map((item) => {
              const Icon = iconByKey[item.labelKey as NavIconKey] ?? Gauge;
              const active = activeHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? 'hx-sidebar-link is-active' : 'hx-sidebar-link'}
                  title={t(item.labelKey)}
                  aria-label={t(item.labelKey)}
                >
                  <Icon size={19} />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

            <div className="hx-sidebar-footer hr-sidebar-footer">
              <div className="hx-sidebar-footer-tools">
                {sidebarCollapsed ? (
                  <div className="hx-sidebar-setting-row hx-sidebar-theme-row is-theme-toggle-only">
                    <span className="hx-sidebar-theme-toggle">
                      <ThemeToggle ariaLabel={tChrome('settings.theme.toggleLabel')} />
                    </span>
                  </div>
                ) : (
                  <div className="hx-sidebar-setting-row hx-sidebar-theme-row is-theme-toggle-only" aria-label={tChrome('settings.theme.toggleLabel')}>
                    <span className="hx-sidebar-theme-toggle">
                      <ThemeToggle
                        variant="pill"
                        ariaLabel={tChrome('settings.theme.toggleLabel')}
                      />
                    </span>
                  </div>
                )}

                <div className={localeOpen ? 'hx-sidebar-locale is-open' : 'hx-sidebar-locale'}>
                  <button
                    type="button"
                    className="hx-sidebar-setting-row hx-sidebar-locale-trigger"
                    aria-expanded={localeOpen}
                    aria-controls={localePanelId}
                    aria-label={tChrome('settings.language.selectLabel', { locale: currentLocale.label })}
                    title={tChrome('settings.language.selectLabel', { locale: currentLocale.label })}
                    onClick={() => {
                      if (sidebarCollapsed) {
                        handleCollapsedLocaleOpen();
                        return;
                      }
                      setLocaleOpen((current) => !current);
                    }}
                  >
                    <span className="hx-sidebar-locale-flag" aria-hidden>{currentLocale.flag}</span>
                    <div className="hx-sidebar-setting-copy">
                      <strong>{currentLocale.label}</strong>
                    </div>
                    <ChevronDown size={16} className="hx-sidebar-footer-chevron" />
                  </button>

                {localeOpen ? (
                  <div id={localePanelId} className="hx-sidebar-locale-panel" role="menu" aria-label={tChrome('language.select')}>
                    {SIDEBAR_LOCALES.map((item) => {
                      const selected = item.value === locale;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          role="menuitem"
                          aria-current={selected ? 'true' : undefined}
                          className={selected ? 'is-active' : ''}
                          onClick={() => changeSidebarLocale(item.value)}
                        >
                          <span aria-hidden>{item.flag}</span>
                          <strong>{item.label}</strong>
                          {selected ? <Check size={15} aria-hidden /> : <small>{item.value}</small>}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {user ? (
                <button type="button" className="hx-sidebar-setting-row hx-sidebar-logout" onClick={handleSidebarLogout} title={t('logout')} aria-label={t('logout')}>
                  <span className="hx-sidebar-setting-icon"><LogOut size={18} /></span>
                  <div className="hx-sidebar-setting-copy">
                    <small>{tChrome('session')}</small>
                    <strong>{t('logout')}</strong>
                  </div>
                </button>
              ) : (
                <Link href={intlAppPaths.auth.login} className="hx-sidebar-setting-row hx-sidebar-login" title={t('login')} aria-label={t('login')}>
                  <span className="hx-sidebar-setting-icon"><LogIn size={18} /></span>
                  <div className="hx-sidebar-setting-copy">
                    <small>{tChrome('session')}</small>
                    <strong>{t('login')}</strong>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="hx-main hr-main">
        <main className="hx-content hr-dashboard-page">
          <header className="hx-mobile-topbar" aria-label={tChrome('mobile.headerAria')}>
            <div className="hx-mobile-topbar__row">
              <Link href={intlAppPaths.dashboard.home} className="hx-mobile-brand" aria-label={tChrome('brandAria')}>
                <span><Waves size={18} /></span>
                <strong>HydroRivers</strong>
              </Link>

              <div className="hx-mobile-topbar__actions">
                <button
                  type="button"
                  className="hx-bell"
                  aria-label={tChrome('header.notifications')}
                  onClick={() => setNotificationsOpen(true)}
                >
                  <Bell size={18} />
                  {unreadNotificationsCount > 0 ? (
                    <span className="hx-bell-badge" aria-hidden>{unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}</span>
                  ) : null}
                </button>
                <Link href={user ? intlAppPaths.auth.profile : intlAppPaths.auth.login} className="hx-mobile-avatar" aria-label={t('profile')}>
                  {user?.avatarUrl ? <Image src={user.avatarUrl} alt="" width={38} height={38} unoptimized /> : initials(user?.name)}
                </Link>
              </div>
            </div>

            <div className="hx-mobile-topbar__row is-secondary">
              <div className="hx-mobile-title">
                <small>{tChrome('mobile.kicker')}</small>
                <strong>{activeNavItem ? t(activeNavItem.labelKey) : tChrome('header.title')}</strong>
              </div>
              <div className="hx-mobile-quick-actions">
                <button type="button" className="hx-mobile-ghost-button" onClick={() => setMobileSearchOpen(true)} aria-label={tCommon('search')}>
                  <Search size={16} />
                </button>
              </div>
            </div>
          </header>

          <header className="hx-topbar hr-topbar">
            <div className="hx-title-block">
              <h1>{tChrome('header.title')} <span /> {tChrome('header.subtitle')}</h1>
              <p>{tChrome('header.description')}</p>
            </div>

            <label className="hx-top-search">
              <Search size={17} />
              <input type="search" placeholder={tChrome('header.searchPlaceholder')} aria-label={tCommon('search')} />
              <kbd>⌘K</kbd>
            </label>

            <div className="hx-top-actions">
              <span className="hx-system-pill"><i /> {tChrome('header.systemStatus')}</span>
              <div className="hx-notifications" ref={notificationsRef}>
                <button
                  ref={notificationsButtonRef}
                  type="button"
                  className={notificationsOpen ? 'hx-bell is-open' : 'hx-bell'}
                  aria-label={tChrome('header.notifications')}
                  aria-expanded={notificationsOpen}
                  aria-haspopup="dialog"
                  aria-controls={notificationsPanelId}
                  onClick={() => setNotificationsOpen((current) => !current)}
                >
                  <Bell size={18} />
                  {unreadNotificationsCount > 0 ? (
                    <span className="hx-bell-badge" aria-hidden>{unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}</span>
                  ) : null}
                </button>

                {notificationsOpen && !isMobileViewport ? (
                  createPortal((
                    <div
                      ref={notificationsPanelRef}
                      id={notificationsPanelId}
                      className="hx-notifications-popover"
                      role="dialog"
                      aria-label={tNotifications('title')}
                      style={notificationsPanelStyle}
                    >
                      {notificationsContent}
                      <div className="hx-notifications-footer">
                        <Link href={intlAppPaths.negotiations.home} onClick={() => setNotificationsOpen(false)}>
                          {tNotifications('viewAll')}
                        </Link>
                      </div>
                    </div>
                  ), document.body)
                ) : null}
              </div>
              <Link href={user ? intlAppPaths.auth.profile : intlAppPaths.auth.login} className={user?.avatarUrl ? 'hx-profile has-avatar' : 'hx-profile'}>
                <span className="hx-profile-avatar">
                  {user?.avatarUrl ? <Image src={user.avatarUrl} alt="" width={44} height={44} unoptimized /> : initials(user?.name)}
                </span>
                <div>
                  <strong>{user?.name ?? 'Carlos Almeida'}</strong>
                  <small>{user ? tChrome(`roles.${roleLabel(user.role)}`) : tChrome('roles.operations')}</small>
                </div>
                {user ? <UserRound size={16} /> : <LogIn size={16} />}
              </Link>
            </div>
          </header>

          <div className="hr-dashboard-content-root">{children}</div>
        </main>
      </div>

      <nav className="hx-mobile-nav" aria-label={t('mobileMenu')}>
        {mobilePrimaryNavigation.map((item) => {
          const Icon = iconByKey[item.labelKey as NavIconKey] ?? Gauge;
          const active = activeHref === item.href;
          return (
            <Link key={item.href} href={item.href} className={active ? 'hx-mobile-nav__item is-active' : 'hx-mobile-nav__item'} aria-current={active ? 'page' : undefined}>
              <Icon size={18} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}

        <button type="button" className="hx-mobile-nav__item" onClick={() => setMobileMenuOpen(true)} aria-label={t('more')}>
          <Menu size={18} />
          <span>{t('more')}</span>
        </button>
      </nav>

      {hideMobileFab ? null : (
        <Link href={profileActionConfig.href} className="hx-mobile-fab" aria-label={profileActionConfig.label}>
          <ProfileActionIcon size={20} />
        </Link>
      )}

      <BottomSheet
        open={isMobileViewport && notificationsOpen}
        onOpenChange={setNotificationsOpen}
        title={tNotifications('mobileTitle')}
        description={tNotifications('emptyDescription')}
        snapPoints={["90vh"]}
      >
        {notificationsContent}
      </BottomSheet>

      <BottomSheet
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
        title={tChrome('mobile.searchTitle')}
        description={tChrome('mobile.searchDescription')}
        snapPoints={["60vh"]}
      >
        <label className="hx-mobile-sheet-search">
          <Search size={16} />
          <input type="search" placeholder={tChrome('header.searchPlaceholder')} aria-label={tCommon('search')} />
        </label>
        <div className="hx-mobile-sheet-links">
          <Link href={intlAppPaths.dashboard.home} onClick={() => setMobileSearchOpen(false)}>{t('dashboard')}</Link>
          <Link href={intlAppPaths.cargos.marketplace} onClick={() => setMobileSearchOpen(false)}>{t('cargoes')}</Link>
          <Link href={intlAppPaths.tracking.home} onClick={() => setMobileSearchOpen(false)}>{t('tracking')}</Link>
          <Link href={intlAppPaths.negotiations.home} onClick={() => setMobileSearchOpen(false)}>{t('negotiations')}</Link>
        </div>
      </BottomSheet>

      <BottomSheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title={tChrome('mobile.menuTitle')}
        description={tChrome('mobile.menuDescription')}
        snapPoints={["90vh"]}
      >
        {showPublishCargoContext ? (
          <Link href={intlAppPaths.cargos.publishCargo} className="hx-mobile-primary-button" onClick={() => setMobileMenuOpen(false)}>
            <CirclePlus size={16} />
            <span>{tChrome('cta.newCargo')}</span>
          </Link>
        ) : null}
        <div className="hx-mobile-menu-list">
          {mobileMoreNavigation.map((item) => {
            const Icon = iconByKey[item.labelKey as NavIconKey] ?? Gauge;
            return (
              <Link key={item.href} href={item.href} className="hx-mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                <span><Icon size={18} /></span>
                <strong>{t(item.labelKey)}</strong>
              </Link>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
