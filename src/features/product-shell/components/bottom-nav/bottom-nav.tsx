'use client';

import { Bell, Globe, Home, Package, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/core/i18n/navigation';
import { bottomNavHref, resolveBottomNavId } from '@/features/product-shell/domain/product-shell-navigation';
import type { ProductShellNavId } from '@/features/product-shell/domain/product-shell-navigation';
import { BottomNav as SharedBottomNav, type BottomNavItem } from '@/shared/components/bottom-nav';

const NAV_ITEMS: ProductShellNavId[] = ['cockpit', 'publicCargoes', 'myCargoes', 'notifications', 'profile'];

function resolveIcon(navId: ProductShellNavId) {
  if (navId === 'cockpit') return <Home size={20} aria-hidden />;
  if (navId === 'publicCargoes') return <Globe size={20} aria-hidden />;
  if (navId === 'myCargoes') return <Package size={20} aria-hidden />;
  if (navId === 'notifications') return <Bell size={20} aria-hidden />;
  return <User size={20} aria-hidden />;
}

export function BottomNav() {
  const t = useTranslations('shipperMobileFlow.bottomNav');
  const pathname = usePathname();
  const activeId = resolveBottomNavId(pathname);
  const items: BottomNavItem[] = NAV_ITEMS.map((id) => ({
    id,
    label: t(id),
    iconOutlined: resolveIcon(id),
    href: bottomNavHref(id),
  }));

  return (
    <SharedBottomNav
      items={items}
      activeId={activeId ?? 'cockpit'}
      ariaLabel={t('label')}
    />
  );
}
