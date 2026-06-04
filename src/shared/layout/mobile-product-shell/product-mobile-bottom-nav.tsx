'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Gauge, Handshake, LayoutDashboard, Package, Route } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BottomNav } from '@/shared/components/bottom-nav';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { useScreenTransitionNavigation } from '@/shared/ui/screen-transition';

import { resolveMobileBottomNavActiveId } from './resolve-mobile-page-title';
import styles from './mobile-product-shell.module.scss';

const PRODUCT_MOBILE_BOTTOM_NAV_ITEMS = [
  { id: 'overview', labelKey: 'overview', href: intlAppPaths.home, Icon: LayoutDashboard },
  { id: 'dashboard', labelKey: 'dashboard', href: intlAppPaths.dashboard.home, Icon: Gauge },
  { id: 'cargos', labelKey: 'cargos', href: intlAppPaths.cargos.marketplace, Icon: Package },
  {
    id: 'negotiations',
    labelKey: 'negotiations',
    href: intlAppPaths.negotiations.home,
    Icon: Handshake,
  },
  { id: 'tracking', labelKey: 'tracking', href: intlAppPaths.tracking.home, Icon: Route },
] as const;

export type ProductMobileBottomNavProps = {
  hidden?: boolean;
};

export function ProductMobileBottomNav({ hidden = false }: ProductMobileBottomNavProps) {
  const tNav = useTranslations('nav');
  const tChrome = useTranslations('adminChrome');
  const pathname = usePathname();
  const router = useRouter();
  const { navigateWithTransition } = useScreenTransitionNavigation();
  const isDomReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const normalizedPathname = pathname.replace(/^\/(pt-BR|en-US|es)(?=\/|$)/, '') || '/';
  const activeId = resolveMobileBottomNavActiveId(normalizedPathname);
  const isCargoDetailPath = normalizedPathname.startsWith(`${intlAppPaths.cargos.marketplace}/`);

  if (!isDomReady || hidden) {
    return null;
  }

  const items = PRODUCT_MOBILE_BOTTOM_NAV_ITEMS.map(({ id, labelKey, Icon }) => ({
    id,
    label: tChrome(`mobile.bottomNav.${labelKey}`),
    icon: <Icon size={18} aria-hidden />,
  }));

  return createPortal(
    <div data-mobile-product-bottom-nav="true" className={styles.bottomNavHost}>
      <BottomNav
        className={styles.bottomNav}
        ariaLabel={tNav('mobileMenu')}
        items={items}
        activeId={activeId}
        onItemSelect={(id) => {
          const slot = PRODUCT_MOBILE_BOTTOM_NAV_ITEMS.find((entry) => entry.id === id);
          if (!slot) return;

          const active = activeId === id;
          const shouldForceCargoListReturn =
            slot.href === intlAppPaths.cargos.marketplace && isCargoDetailPath;

          if (active && !shouldForceCargoListReturn) {
            return;
          }

          if (shouldForceCargoListReturn) {
            router.replace(slot.href as never);
            return;
          }

          navigateWithTransition(slot.href);
        }}
        classNames={{
          item: styles.navItem,
          itemActive: styles.navItemActive,
          icon: styles.navIcon,
          label: styles.navLabel,
          activeBubble: styles.activeNavBubble,
          activeIcon: styles.activeNavIcon,
          activeLabel: styles.activeNavLabel,
        }}
      />
    </div>,
    document.body,
  );
}
