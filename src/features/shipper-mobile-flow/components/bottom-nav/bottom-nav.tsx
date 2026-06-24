'use client';

import { Bell, Globe, Home, Package, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/core/i18n/navigation';
import { bottomNavHref, resolveBottomNavId } from '@/features/shipper-mobile-flow/domain/shipper-nav-domain';
import type { ShipperBottomNavId } from '@/features/shipper-mobile-flow/types/shipper-flow-types';

import styles from './bottom-nav.module.sass';

const NAV_ITEMS: { id: ShipperBottomNavId; icon: typeof Home }[] = [
  { id: 'cockpit', icon: Home },
  { id: 'publicCargoes', icon: Globe },
  { id: 'myCargoes', icon: Package },
  { id: 'notifications', icon: Bell },
  { id: 'profile', icon: User }
];

export function BottomNav() {
  const t = useTranslations('shipperMobileFlow.bottomNav');
  const pathname = usePathname();
  const activeId = resolveBottomNavId(pathname);

  return (
    <nav className={styles.nav} aria-label={t('label')}>
      {NAV_ITEMS.map(({ id, icon: Icon }) => {
        const href = bottomNavHref(id);
        const active = activeId === id;
        return (
          <Link
            key={id}
            href={href}
            className={`${styles.item} ${active ? styles.itemActive : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={styles.icon} aria-hidden />
            <span className={styles.label}>{t(id)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
