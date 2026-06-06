'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { BottomNav, bottomNavV2LightClassNames } from '@/shared/components/bottom-nav';
import { renderBottomNavIcon, type BottomNavIconId } from '@/shared/components/bottom-nav/bottom-nav-icons';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';

import { resolveMobileBottomNavActiveId } from './resolve-mobile-page-title';

const PRODUCT_MOBILE_BOTTOM_NAV_ITEMS = [
  { id: 'overview', labelKey: 'overview', href: intlAppPaths.home, iconId: 'overview' as BottomNavIconId },
  { id: 'dashboard', labelKey: 'dashboard', href: intlAppPaths.dashboard.home, iconId: 'dashboard' as BottomNavIconId },
  { id: 'cargos', labelKey: 'cargos', href: intlAppPaths.cargos.marketplace, iconId: 'cargos' as BottomNavIconId },
  {
    id: 'negotiations',
    labelKey: 'negotiations',
    href: intlAppPaths.negotiations.home,
    iconId: 'negotiations' as BottomNavIconId,
  },
  { id: 'tracking', labelKey: 'tracking', href: intlAppPaths.tracking.home, iconId: 'tracking' as BottomNavIconId },
] as const;

export type ProductMobileBottomNavProps = {
  hidden?: boolean;
};

export function ProductMobileBottomNav({ hidden = false }: ProductMobileBottomNavProps) {
  const tNav = useTranslations('nav');
  const tChrome = useTranslations('adminChrome');
  const pathname = usePathname();
  const router = useRouter();
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

  const items = PRODUCT_MOBILE_BOTTOM_NAV_ITEMS.map(({ id, labelKey, href, iconId }) => ({
    id,
    label: tChrome(`mobile.bottomNav.${labelKey}`),
    href,
    iconOutlined: renderBottomNavIcon(iconId, false),
  }));

  return createPortal(
    <div data-mobile-product-bottom-nav="true">
      <BottomNav
        className={bottomNavV2LightClassNames.shell}
        ariaLabel={tNav('mobileMenu')}
        items={items}
        activeId={activeId}
        onItemSelect={(id) => {
          const slot = PRODUCT_MOBILE_BOTTOM_NAV_ITEMS.find((entry) => entry.id === id);
          if (!slot) return true;

          const active = activeId === id;
          const shouldForceCargoListReturn =
            slot.href === intlAppPaths.cargos.marketplace && isCargoDetailPath;

          if (active && !shouldForceCargoListReturn) {
            return true;
          }

          if (shouldForceCargoListReturn) {
            router.replace(slot.href as never);
            return true;
          }

          return false;
        }}
        classNames={{
          item: bottomNavV2LightClassNames.item,
          itemActive: bottomNavV2LightClassNames.itemActive,
          icon: bottomNavV2LightClassNames.icon,
          label: bottomNavV2LightClassNames.label,
          activeBubble: bottomNavV2LightClassNames.activeBubble,
          activeIcon: bottomNavV2LightClassNames.activeIcon,
          activeLabel: bottomNavV2LightClassNames.activeLabel,
        }}
      />
    </div>,
    document.body,
  );
}
