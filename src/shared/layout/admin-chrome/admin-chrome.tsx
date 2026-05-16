'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import {
  Activity,
  Anchor,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  CirclePlus,
  FileWarning,
  Gauge,
  Handshake,
  Landmark,
  LayoutDashboard,
  Leaf,
  LifeBuoy,
  LogIn,
  LogOut,
  Package,
  RadioTower,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Ship,
  TriangleAlert,
  User,
  Waves
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname, useRouter } from '@/core/i18n/navigation';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { logout } from '@/features/auth/services/auth.client';
import type { HydroUser, UserRole } from '@/features/auth/domain/auth.types';
import { getCompactDisplayInitials, getCompactUserDisplayName } from '@/features/auth/domain/user-display-name';
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
import { filterMainNavigationForUser, mainNavigation, resolveActiveNavigationHref } from '@/shared/config/navigation';
import { persistStoredLocale, type StoredLocale } from '@/shared/preferences/client-preferences';
import { intlAppPaths, isAuthPublicShellPathname } from '@/shared/routing/app-routes';
import styles from './admin-chrome.module.scss';
import { BottomSheet } from '@/shared/components/bottom-sheet/BottomSheet';
import { ThemeToggle } from '@/shared/ui/theme-toggle/theme-toggle';
import { OPEN_MOCK_PANEL_EVENT } from '@/shared/ui/mock-mode/mock-mode';
import { isMockQaUiEnabled } from '@/shared/qa/mock-qa-ui-env';
import { ScreenTransition, useScreenTransitionNavigation } from '@/shared/ui/screen-transition';

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
  home: LayoutDashboard,
  dashboard: Gauge,
  cargoes: Package,
  myCargos: Boxes,
  vessels: Anchor,
  negotiations: Handshake,
  tracking: Route,
  impact: Leaf,
  government: Landmark,
  admin: ShieldCheck
};

const MOBILE_BOTTOM_NAV: ReadonlyArray<{ href: string; iconKey: NavIconKey; labelKey: string }> = [
  { href: intlAppPaths.home, iconKey: 'home', labelKey: 'overview' },
  { href: intlAppPaths.dashboard.home, iconKey: 'dashboard', labelKey: 'dashboard' },
  { href: intlAppPaths.cargos.marketplace, iconKey: 'cargoes', labelKey: 'cargos' },
  { href: intlAppPaths.negotiations.home, iconKey: 'negotiations', labelKey: 'negotiations' },
  { href: intlAppPaths.tracking.home, iconKey: 'tracking', labelKey: 'tracking' }
];

function resolveActiveHref(pathname: string) {
  return resolveActiveNavigationHref(pathname, mainNavigation);
}

function profileDisplayName(name?: string) {
  return getCompactUserDisplayName(name ?? '') || 'Carlos Almeida';
}

function roleLabel(role?: UserRole) {
  if (role === 'shipper') return 'shipper';
  if (role === 'carrier') return 'carrier';
  if (role === 'admin') return 'admin';
  return 'operations';
}

/** Formatação estável entre SSR e cliente (sem `Date.now` no render). */
function formatNotificationTime(createdAt: string, locale: string) {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(d);
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

export function AdminChrome({ children }: AdminChromeProps) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tChrome = useTranslations('adminChrome');
  const tNotifications = useTranslations('notifications');
  const locale = useLocale() as SidebarLocale;
  const pathname = usePathname();
  const router = useRouter();
  const { navigateWithTransition, prefetchScreen } = useScreenTransitionNavigation();
  const searchParams = useSearchParams();
  const activeHref = useMemo(() => resolveActiveHref(pathname), [pathname]);
  const normalizedPathname = useMemo(() => {
    return pathname.replace(/^\/(pt-BR|en-US|es)(?=\/|$)/, '') || '/';
  }, [pathname]);
  const { user, ready: authReady } = useAuthSession();
  /** Só aplica papel na sidebar após a sessão resolver — evita divergência SSR vs 1º paint client. */
  const navigationUser = authReady ? user : null;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const [notificationsPanelStyle, setNotificationsPanelStyle] = useState<CSSProperties>({});
  const dashboardScrollRef = useRef<HTMLDivElement>(null);
  const [isDashboardHeaderScrolled, setIsDashboardHeaderScrolled] = useState(false);
  const systemStatusButtonRef = useRef<HTMLButtonElement>(null);
  const [systemStatusTipVisible, setSystemStatusTipVisible] = useState(false);
  const [systemStatusTipStyle, setSystemStatusTipStyle] = useState<CSSProperties>({});
  const systemStatusHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localePanelId = 'hx-sidebar-language-panel';
  const notificationsPanelId = 'hx-header-notifications-panel';
  const currentLocale = SIDEBAR_LOCALES.find((item) => item.value === locale) ?? SIDEBAR_LOCALES[0];
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
    () => (authReady ? readNotifications(navigationUser?.id) : emptyNotificationsSnapshot),
    getNotificationsServerSnapshot
  );
  const unreadNotificationsCount = useMemo(
    () => getUnreadNotificationsCount(notifications),
    [notifications]
  );

  const navigation = useMemo(() => filterMainNavigationForUser(navigationUser), [navigationUser]);
  const mobileBottomHrefSet = useMemo(() => new Set(MOBILE_BOTTOM_NAV.map((item) => item.href)), []);
  const accountSheetMoreNav = useMemo(() => {
    const primaryExtra = new Set<string>([intlAppPaths.auth.profile, intlAppPaths.cargos.myCargos]);
    return navigation.filter((item) => !mobileBottomHrefSet.has(item.href) && !primaryExtra.has(item.href));
  }, [navigation, mobileBottomHrefSet]);
  const activeNavItem = navigation.find((item) => item.href === activeHref) ?? navigation.find((item) => item.href === intlAppPaths.dashboard.home) ?? null;
  const activeNavLabel = activeNavItem ? t(activeNavItem.labelKey) : tChrome('header.title');
  const activeNavSubtitle = activeHref === intlAppPaths.home
    ? tChrome('header.homeSubtitle')
    : tChrome('header.subtitle');
  const headerDescriptionText = activeHref === intlAppPaths.home ? tChrome('header.homeDescription') : tChrome('header.description');
  const headerFullTitleLabel = `${activeNavLabel} • ${activeNavSubtitle}`;
  const hasUnreadNotifications = unreadNotificationsCount > 0;
  const showPublishCargoContext = pathname.startsWith(intlAppPaths.cargos.marketplace) || pathname.startsWith(intlAppPaths.cargos.myCargos);
  const isCargoDetailPath = normalizedPathname.startsWith(`${intlAppPaths.cargos.marketplace}/`);
  const showMockTools = isMockQaUiEnabled();

  const mobileSearchShortcutList = useMemo(
    () => [
      { href: intlAppPaths.home, label: tChrome('mobile.bottomNav.overview'), Icon: LayoutDashboard },
      { href: intlAppPaths.dashboard.home, label: tChrome('mobile.bottomNav.dashboard'), Icon: Gauge },
      { href: `/${locale}/cargas`, label: tChrome('mobile.bottomNav.cargos'), Icon: Package },
      { href: intlAppPaths.negotiations.home, label: tChrome('mobile.bottomNav.negotiations'), Icon: Handshake },
      { href: intlAppPaths.tracking.home, label: tChrome('mobile.bottomNav.tracking'), Icon: Route },
      { href: intlAppPaths.cargos.myCargos, label: t('myCargoes'), Icon: Boxes },
      { href: intlAppPaths.auth.profile, label: tChrome('mobile.accountSheet.profile'), Icon: User }
    ],
    [locale, t, tChrome]
  );

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth <= 860);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const el = dashboardScrollRef.current;
    const syncScroll = () => {
      const inner = el ? el.scrollTop > 8 : false;
      const win = typeof window !== 'undefined' && window.scrollY > 8;
      setIsDashboardHeaderScrolled(inner || win);
    };

    syncScroll();
    el?.addEventListener('scroll', syncScroll, { passive: true });
    window.addEventListener('scroll', syncScroll, { passive: true });
    return () => {
      el?.removeEventListener('scroll', syncScroll);
      window.removeEventListener('scroll', syncScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!localeOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLocaleOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [localeOpen]);

  function clearSystemStatusHideTimer() {
    if (systemStatusHideTimerRef.current !== null) {
      clearTimeout(systemStatusHideTimerRef.current);
      systemStatusHideTimerRef.current = null;
    }
  }

  function openSystemStatusTip() {
    clearSystemStatusHideTimer();
    setSystemStatusTipVisible(true);
  }

  function scheduleCloseSystemStatusTip() {
    clearSystemStatusHideTimer();
    systemStatusHideTimerRef.current = setTimeout(() => {
      setSystemStatusTipVisible(false);
      systemStatusHideTimerRef.current = null;
    }, 140);
  }

  useLayoutEffect(() => {
    if (!systemStatusTipVisible || typeof window === 'undefined' || !systemStatusButtonRef.current) {
      return;
    }
    const rect = systemStatusButtonRef.current.getBoundingClientRect();
    const panelWidth = 228;
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - panelWidth / 2),
      window.innerWidth - panelWidth - 12
    );
    const top = rect.bottom + 10;
    setSystemStatusTipStyle({
      position: 'fixed',
      top,
      left,
      width: panelWidth,
      zIndex: 1260
    });
  }, [systemStatusTipVisible]);

  useEffect(() => {
    if (!systemStatusTipVisible) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSystemStatusHideTimer();
        setSystemStatusTipVisible(false);
        systemStatusButtonRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [systemStatusTipVisible]);

  useEffect(
    () => () => {
      clearSystemStatusHideTimer();
    },
    []
  );

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
    setAccountSheetOpen(false);
    await logout();
    router.push(intlAppPaths.auth.login as never);
  }

  function handleCollapsedLocaleOpen() {
    setSidebarCollapsed(false);
    setLocaleOpen(true);
  }

  function handleNotificationClick(notification: HydroNotification) {
    markNotificationRead(notification.id, navigationUser?.id);
    setNotificationsOpen(false);

    if (notification.actionHref) {
      router.push(notification.actionHref as never);
    }
  }

  function handleMarkAllNotificationsRead() {
    markAllNotificationsRead(navigationUser?.id);
  }

  function openMobileAccountSheet() {
    setNotificationsOpen(false);
    setMobileSearchOpen(false);
    setAccountSheetOpen(true);
  }

  function toggleMobileNotificationsSheet() {
    setAccountSheetOpen(false);
    setMobileSearchOpen(false);
    setNotificationsOpen((current) => !current);
  }

  function openMobileSearchSheet() {
    setAccountSheetOpen(false);
    setNotificationsOpen(false);
    setMobileSearchOpen(true);
  }

  function handleOpenMockFromAccount() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(OPEN_MOCK_PANEL_EVENT));
    }
    setAccountSheetOpen(false);
  }

  const notificationsContent = (
    <>
      <div className="hx-notifications-header">
        <div>
          <strong>{tNotifications('title')}</strong>
          <small>{tNotifications('summary', { count: unreadNotificationsCount })}</small>
        </div>
        {hasUnreadNotifications ? (
          <button
            type="button"
            className="hx-notifications-mark-all"
            onClick={handleMarkAllNotificationsRead}
          >
            {tNotifications('markAllRead')}
          </button>
        ) : null}
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

  if (isAuthPublicShellPathname(pathname)) {
    return <div className={styles.publicAuthWrap}>{children}</div>;
  }

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
              className={sidebarCollapsed ? 'hx-collapse-button is-collapsed hx-sidebar-interactive' : 'hx-collapse-button hx-sidebar-interactive'}
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
                  className={active ? 'hx-sidebar-link is-active hx-sidebar-interactive' : 'hx-sidebar-link hx-sidebar-interactive'}
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
                <div className="hx-sidebar-theme-row" role="group" aria-label={tChrome('settings.theme.toggleLabel')}>
                  <ThemeToggle
                    variant={sidebarCollapsed ? 'icon' : 'pill'}
                    ariaLabel={tChrome('settings.theme.toggleLabel')}
                  />
                </div>

                <div className={localeOpen ? 'hx-sidebar-locale is-open' : 'hx-sidebar-locale'}>
                  <button
                    type="button"
                    className="hx-sidebar-setting-row hx-sidebar-locale-trigger hx-sidebar-interactive"
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
                    <ChevronDown size={16} className="hx-sidebar-footer-chevron" aria-hidden />
                  </button>

                  <div
                    id={localePanelId}
                    className="hx-sidebar-locale-accordion"
                    role="region"
                    aria-label={tChrome('language.select')}
                    {...(!localeOpen ? { inert: true } : {})}
                  >
                    <div className="hx-sidebar-locale-accordion-inner">
                      <div className="hx-sidebar-locale-options">
                        {SIDEBAR_LOCALES.map((item) => {
                          const selected = item.value === locale;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              aria-current={selected ? 'true' : undefined}
                              aria-label={`${item.label} (${item.value})`}
                              title={`${item.label} (${item.value})`}
                              className={
                                selected
                                  ? 'hx-sidebar-locale-option hx-sidebar-interactive is-active'
                                  : 'hx-sidebar-locale-option hx-sidebar-interactive'
                              }
                              onClick={() => changeSidebarLocale(item.value)}
                            >
                              <span className="hx-sidebar-locale-option-flag" aria-hidden>
                                {item.flag}
                              </span>
                              <span className="hx-sidebar-locale-option-copy">
                                <strong>{item.label}</strong>
                                <small>{item.value}</small>
                              </span>
                              {selected ? (
                                <Check size={15} className="hx-sidebar-locale-option-check" aria-hidden />
                              ) : (
                                <span className="hx-sidebar-locale-option-spacer" aria-hidden />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              {navigationUser ? (
                <button type="button" className="hx-sidebar-setting-row hx-sidebar-logout hx-sidebar-interactive" onClick={handleSidebarLogout} title={t('logout')} aria-label={t('logout')}>
                  <span className="hx-sidebar-setting-icon"><LogOut size={18} /></span>
                  <div className="hx-sidebar-setting-copy">
                    <small>{tChrome('session')}</small>
                    <strong>{t('logout')}</strong>
                  </div>
                </button>
              ) : (
                <Link href={intlAppPaths.auth.login} className="hx-sidebar-setting-row hx-sidebar-login hx-sidebar-interactive" title={t('login')} aria-label={t('login')}>
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
          <div ref={dashboardScrollRef} className="hr-dashboard-scroll">
          <header className="hx-mobile-topbar" aria-label={tChrome('mobile.headerAria')}>
            <div className="hx-mobile-topbar__row">
              <Link href={intlAppPaths.dashboard.home} className="hx-mobile-brand" aria-label={tChrome('brandAria')}>
                <span><Waves size={18} /></span>
                <strong>HydroRivers</strong>
              </Link>

              <div className="hx-mobile-topbar__actions">
                <button
                  type="button"
                  className={styles.mobileSearchTrigger}
                  aria-label={tChrome('mobile.searchSheet.openAria')}
                  aria-expanded={mobileSearchOpen}
                  onClick={openMobileSearchSheet}
                >
                  <Search size={18} />
                </button>
                <button
                  type="button"
                  className="hx-bell"
                  aria-label={tChrome('header.notificationsAria', { count: unreadNotificationsCount })}
                  aria-expanded={notificationsOpen}
                  onClick={toggleMobileNotificationsSheet}
                >
                  <Bell size={18} />
                  {unreadNotificationsCount > 0 ? (
                    <span className="hx-bell-badge" aria-hidden>{unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}</span>
                  ) : null}
                </button>
                <button
                  type="button"
                  className="hx-mobile-avatar"
                  aria-label={navigationUser ? tChrome('profile.openAria', { name: profileDisplayName(navigationUser?.name) }) : t('login')}
                  onClick={openMobileAccountSheet}
                >
                  {navigationUser?.avatarUrl ? (
                    <Image src={navigationUser.avatarUrl} alt="" width={38} height={38} sizes="38px" unoptimized />
                  ) : (
                    getCompactDisplayInitials(navigationUser?.name ?? '')
                  )}
                </button>
              </div>
            </div>

            <div className="hx-mobile-topbar__row hx-mobile-topbar__row--page-title">
              <h1 className="hx-mobile-title">
                <strong>{activeNavLabel}</strong>
              </h1>
            </div>
          </header>

          <div className={styles.desktopChromeShell}>
          <header
            className={`hx-topbar hr-topbar${isDashboardHeaderScrolled ? ' hx-topbar--scrolled' : ''}`}
            data-scrolled={isDashboardHeaderScrolled ? 'true' : 'false'}
          >
            <div className="hx-title-block">
              <h1 className="hx-title-block__heading" title={headerFullTitleLabel} aria-label={headerFullTitleLabel}>
                <span className="hx-title-block__heading-inner">
                  <span className="hx-title-block__kicker">
                    <span className="hx-title-block__context">{activeNavLabel}</span>
                    <span className="hx-title-block__bullet" aria-hidden />
                  </span>
                  <span className="hx-title-block__section">{activeNavSubtitle}</span>
                </span>
              </h1>
              <p className="hx-title-block__description" title={headerDescriptionText}>
                {headerDescriptionText}
              </p>
            </div>

            <label className="hx-top-search">
              <Search size={17} />
              <input type="search" placeholder={tChrome('header.searchPlaceholder')} aria-label={tCommon('search')} />
              <kbd>⌘K</kbd>
            </label>

            <div className="hx-top-actions">
              <button
                ref={systemStatusButtonRef}
                type="button"
                className="hx-system-pill hx-system-pill--icon-only"
                aria-label={tChrome('header.systemStatus')}
                aria-describedby={systemStatusTipVisible ? 'hx-header-system-status-tooltip' : undefined}
                onPointerEnter={openSystemStatusTip}
                onPointerLeave={scheduleCloseSystemStatusTip}
                onFocus={() => openSystemStatusTip()}
                onBlur={() => {
                  clearSystemStatusHideTimer();
                  setSystemStatusTipVisible(false);
                }}
              >
                <i aria-hidden />
                <Activity className="hx-system-pill__glyph" size={17} aria-hidden />
              </button>
              {systemStatusTipVisible && typeof document !== 'undefined'
                ? createPortal(
                    <div
                      id="hx-header-system-status-tooltip"
                      role="tooltip"
                      className="hx-system-status-tooltip"
                      style={systemStatusTipStyle}
                      onPointerEnter={openSystemStatusTip}
                      onPointerLeave={scheduleCloseSystemStatusTip}
                    >
                      <strong className="hx-system-status-tooltip__title">{tChrome('header.systemStatusTooltipTitle')}</strong>
                      <p className="hx-system-status-tooltip__desc">{tChrome('header.systemStatusTooltipDescription')}</p>
                    </div>,
                    document.body
                  )
                : null}
              <div className="hx-notifications" ref={notificationsRef}>
                <button
                  ref={notificationsButtonRef}
                  type="button"
                  className={notificationsOpen ? 'hx-bell is-open' : 'hx-bell'}
                  aria-label={tChrome('header.notificationsAria', { count: unreadNotificationsCount })}
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
              <Link
                href={navigationUser ? intlAppPaths.auth.profile : intlAppPaths.auth.login}
                className={navigationUser?.avatarUrl ? 'hx-profile has-avatar' : 'hx-profile'}
                aria-label={navigationUser ? tChrome('profile.openAria', { name: profileDisplayName(navigationUser?.name) }) : t('login')}
              >
                <span className="hx-profile-avatar">
                  {navigationUser?.avatarUrl ? (
                    <Image src={navigationUser.avatarUrl} alt="" width={44} height={44} sizes="44px" unoptimized />
                  ) : (
                    getCompactDisplayInitials(navigationUser?.name ?? '')
                  )}
                </span>
                <div className="hx-profile-text">
                  <strong title={navigationUser?.name ?? 'Carlos Almeida'}>{profileDisplayName(navigationUser?.name)}</strong>
                  <small>
                    {navigationUser ? tChrome(`roles.${roleLabel(navigationUser.role)}`) : tChrome('roles.operations')}
                  </small>
                </div>
              </Link>
            </div>
          </header>
          </div>

          <div className={`hr-dashboard-content-root ${styles.mobileContentStage}`}>
            <ScreenTransition>
              {children}
            </ScreenTransition>
          </div>
          </div>
        </main>
      </div>

      <nav className={styles.mobileBottomNav} aria-label={t('mobileMenu')}>
        {MOBILE_BOTTOM_NAV.map((slot) => {
          const Icon = iconByKey[slot.iconKey];
          const active = activeHref === slot.href;
          return (
            <Link
              key={slot.href}
              href={slot.href}
              className={active ? `${styles.mobileBottomNavItem} ${styles.mobileBottomNavItemActive}` : styles.mobileBottomNavItem}
              aria-current={active ? 'page' : undefined}
              aria-label={tChrome(`mobile.bottomNav.${slot.labelKey}`)}
              onMouseEnter={() => prefetchScreen(slot.href)}
              onClick={(event) => {
                const shouldForceCargoListReturn =
                  slot.href === intlAppPaths.cargos.marketplace && isCargoDetailPath;

                if (active && !shouldForceCargoListReturn) {
                  return;
                }

                event.preventDefault();

                if (shouldForceCargoListReturn) {
                  router.replace(slot.href as never);
                  return;
                }

                navigateWithTransition(slot.href);
              }}
            >
              <span className={styles.mobileBottomNavItemInner}>
                <span className={styles.mobileBottomNavIconBubble}>
                  <Icon size={18} />
                </span>
                <span className={styles.mobileBottomNavLabel}>{tChrome(`mobile.bottomNav.${slot.labelKey}`)}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <BottomSheet
        open={isMobileViewport && notificationsOpen}
        onOpenChange={(next) => {
          setNotificationsOpen(next);
          if (next) {
            setAccountSheetOpen(false);
            setMobileSearchOpen(false);
          }
        }}
        title={tNotifications('mobileTitle')}
        description={tNotifications('emptyDescription')}
        closeAriaLabel={tNotifications('closeSheet')}
        snapPoints={['90vh']}
        variant="strong"
        footer={
          <Link href={intlAppPaths.negotiations.home} onClick={() => setNotificationsOpen(false)}>
            {tNotifications('viewAll')}
          </Link>
        }
      >
        {notificationsContent}
      </BottomSheet>

      <BottomSheet
        open={isMobileViewport && accountSheetOpen}
        onOpenChange={(next) => {
          setAccountSheetOpen(next);
          if (next) {
            setNotificationsOpen(false);
            setMobileSearchOpen(false);
          }
        }}
        title={tChrome('mobile.accountSheet.title')}
        description={tChrome('mobile.accountSheet.description')}
        closeAriaLabel={tChrome('mobile.accountSheet.closeSheet')}
        snapPoints={['90vh']}
        variant="strong"
      >
        <div className={styles.accountSheet}>
          <div className={styles.accountSheetUser}>
            <div className={styles.accountSheetAvatar}>
              {navigationUser?.avatarUrl ? (
                <Image src={navigationUser.avatarUrl} alt="" width={44} height={44} sizes="44px" unoptimized />
              ) : (
                getCompactDisplayInitials(navigationUser?.name ?? '')
              )}
            </div>
            <div className={styles.accountSheetMeta}>
              <strong>{navigationUser ? profileDisplayName(navigationUser.name) : tChrome('mobile.accountSheet.guestName')}</strong>
              <small>
                {navigationUser ? tChrome(`roles.${roleLabel(navigationUser.role)}`) : tChrome('mobile.accountSheet.guestHint')}
              </small>
            </div>
          </div>

          {showPublishCargoContext ? (
            <Link href={intlAppPaths.cargos.publishCargo} className={styles.accountSheetLink} onClick={() => setAccountSheetOpen(false)}>
              <CirclePlus size={18} aria-hidden />
              {tChrome('cta.newCargo')}
            </Link>
          ) : null}

          <div className={styles.accountSheetSection}>
            <p className={styles.accountSheetSectionTitle}>{tChrome('mobile.accountSheet.sectionPrimary')}</p>
            <div className={styles.accountSheetLinks}>
              <Link href={intlAppPaths.auth.profile} className={styles.accountSheetLink} onClick={() => setAccountSheetOpen(false)}>
                <User size={18} aria-hidden />
                {tChrome('mobile.accountSheet.profile')}
              </Link>
              <Link href={intlAppPaths.cargos.myCargos} className={styles.accountSheetLink} onClick={() => setAccountSheetOpen(false)}>
                <Boxes size={18} aria-hidden />
                {t('myCargoes')}
              </Link>
              <Link href={intlAppPaths.auth.profile} className={styles.accountSheetLink} onClick={() => setAccountSheetOpen(false)}>
                <Settings size={18} aria-hidden />
                {tChrome('mobile.accountSheet.preferences')}
              </Link>
            </div>
          </div>

          <div className={styles.accountSheetSection}>
            <p className={styles.accountSheetSectionTitle}>{tChrome('mobile.accountSheet.sectionExperience')}</p>
            <div className={styles.accountSheetRow} role="group" aria-label={tChrome('settings.language.selectLabel', { locale: currentLocale.label })}>
              <span>{tChrome('mobile.accountSheet.language')}</span>
              <div className={styles.accountSheetLocaleFlags}>
                {SIDEBAR_LOCALES.map((item) => {
                  const selected = item.value === locale;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-current={selected ? 'true' : undefined}
                      className={selected ? 'hx-mobile-ghost-button' : 'hx-mobile-ghost-button'}
                      style={{ opacity: selected ? 1 : 0.72 }}
                      onClick={() => changeSidebarLocale(item.value)}
                    >
                      <span aria-hidden>{item.flag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={styles.accountSheetRow} role="group" aria-label={tChrome('settings.theme.toggleLabel')}>
              <span>{tChrome('mobile.accountSheet.theme')}</span>
              <ThemeToggle variant="icon" ariaLabel={tChrome('settings.theme.toggleLabel')} />
            </div>
          </div>

          <a
            className={styles.accountSheetLink}
            href="https://example.com/help"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAccountSheetOpen(false)}
          >
            <LifeBuoy size={18} aria-hidden />
            {tChrome('mobile.accountSheet.help')}
          </a>

          {accountSheetMoreNav.length ? (
            <div className={styles.accountSheetSection}>
              <p className={styles.accountSheetSectionTitle}>{tChrome('mobile.accountSheet.sectionMore')}</p>
              <div className={styles.accountSheetLinks}>
                {accountSheetMoreNav.map((item) => {
                  const NavIcon = iconByKey[item.labelKey as NavIconKey] ?? Gauge;
                  return (
                    <Link key={item.href} href={item.href} className={styles.accountSheetLink} onClick={() => setAccountSheetOpen(false)}>
                      <NavIcon size={18} aria-hidden />
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {showMockTools ? (
            <div className={styles.accountSheetSection}>
              <p className={styles.accountSheetSectionTitle}>{tChrome('mobile.accountSheet.sectionMock')}</p>
              <button type="button" className={styles.accountSheetMockButton} onClick={handleOpenMockFromAccount}>
                {tChrome('mobile.accountSheet.openMockPanel')}
              </button>
            </div>
          ) : null}

          {navigationUser ? (
            <button type="button" className={styles.accountSheetLogout} onClick={handleSidebarLogout}>
              {t('logout')}
            </button>
          ) : (
            <Link href={intlAppPaths.auth.login} className={styles.accountSheetLink} onClick={() => setAccountSheetOpen(false)}>
              <LogIn size={18} aria-hidden />
              {t('login')}
            </Link>
          )}
        </div>
      </BottomSheet>

      <BottomSheet
        open={isMobileViewport && mobileSearchOpen}
        onOpenChange={(next) => {
          setMobileSearchOpen(next);
          if (!next) setMobileSearchQuery('');
          if (next) {
            setAccountSheetOpen(false);
            setNotificationsOpen(false);
          }
        }}
        title={tChrome('mobile.searchSheet.title')}
        description={tChrome('mobile.searchSheet.description')}
        closeAriaLabel={tChrome('mobile.searchSheet.closeSheet')}
        snapPoints={['75vh']}
        variant="strong"
      >
        <div className={styles.mobileSearchSheet}>
          <label className={styles.mobileSearchField}>
            <Search size={18} aria-hidden />
            <input
              type="search"
              value={mobileSearchQuery}
              onChange={(event) => setMobileSearchQuery(event.target.value)}
              placeholder={tChrome('mobile.searchSheet.placeholder')}
              aria-label={tChrome('mobile.searchSheet.inputAria')}
              autoComplete="off"
            />
          </label>
          <p className={styles.mobileSearchShortcutsLabel}>{tChrome('mobile.searchSheet.shortcutsTitle')}</p>
          <nav className={styles.mobileSearchShortcuts} aria-label={tChrome('mobile.searchSheet.shortcutsTitle')}>
            {mobileSearchShortcutList.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className={styles.mobileSearchShortcut} onClick={() => setMobileSearchOpen(false)}>
                <Icon size={18} aria-hidden />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </BottomSheet>
    </div>
  );
}
